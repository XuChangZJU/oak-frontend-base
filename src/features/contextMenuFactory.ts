import { assert } from 'oak-domain/lib/utils/assert';
import { uniq, set, omit } from 'oak-domain/lib/utils/lodash';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict, Aspect } from 'oak-domain/lib/types';
import { CommonAspectDict } from 'oak-common-aspect';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import { Cache } from './cache';
import { Feature } from '../types/Feature';
import { judgeRelation } from 'oak-domain/lib/store/relation';
import { RelationAuth } from './relationAuth';

interface IMenu<ED extends EntityDict & BaseEntityDict, T extends keyof ED> {
    name: string;
    entity?: T;
    action?: ED[T]['Action'] | ED[T]['Action'][];
    paths?: string[];
    url?: string
}

export class ContextMenuFactory<
    ED extends EntityDict & BaseEntityDict,
    Cxt extends AsyncContext<ED>,
    FrontCxt extends SyncContext<ED>,
    AD extends CommonAspectDict<ED, Cxt> & Record<string, Aspect<ED, Cxt>>
> extends Feature {
    cache: Cache<ED, Cxt, FrontCxt, AD>;
    menus?: IMenu<ED, keyof ED>[];
    relationAuth: RelationAuth<ED, Cxt, FrontCxt, AD>;

    constructor(
        cache: Cache<ED, Cxt, FrontCxt, AD>,
        relationAuth: RelationAuth<ED, Cxt, FrontCxt, AD>,
    ) {
        super();
        this.cache = cache;
        this.relationAuth = relationAuth;
    }

    setMenus(menus: IMenu<ED, keyof ED>[]) {
        assert(!this.menus, 'setMenus只应该全局调用一次');
        this.menus = menus;
    }

    makeMenuFilters(
        destEntity: keyof ED,
        paths: string[],
        entity: keyof ED,
        entityId: string
    ) {
        const schema = this.cache.getSchema();
        assert(paths.length > 0);

        const filters = paths
            .map((path) => {
                if (path === '') {
                    if (entity === destEntity) {
                        return {
                            id: entityId,
                        } as ED[keyof ED]['Selection']['filter'];
                    }
                    return;
                }
                const pathArr = path.split('.');

                const judgeIter = (
                    e2: keyof ED,
                    idx: number
                ): true | undefined | ED[keyof ED]['Selection']['filter'] => {
                    const attr = pathArr[idx];
                    const rel = judgeRelation(schema, e2, attr);
                    let e3 = e2;
                    if (typeof rel === 'string') {
                        e3 = rel;
                    } else if (rel === 2) {
                        e3 = attr;
                    } else {
                        assert(rel instanceof Array);
                        e3 = rel[0];
                    }
                    if (idx === pathArr.length - 1) {
                        if (e3 === 'user') {
                            // 用user连接说明一定满足
                            return true;
                        }
                        if (e3 === entity) {
                            const filter: ED[keyof ED]['Selection']['filter'] =
                                {};
                            const paths2 = pathArr.slice(0, pathArr.length - 1);
                            if (rel === 2) {
                                set(filter, paths2.concat('entity'), entity);
                                set(
                                    filter,
                                    paths2.concat('entityId'),
                                    entityId
                                );
                            } else if (typeof rel === 'string') {
                                set(
                                    filter,
                                    paths2.concat(`${attr}Id`),
                                    entityId
                                );
                            } else {
                                set(filter, `${path}.id`, entityId);
                            }
                            return filter;
                        }
                        return undefined;
                    }
                    return judgeIter(e3, idx + 1);
                };

                return judgeIter(destEntity, 0);
            })
            .filter((ele) => !!ele);

        return filters as (true | ED[keyof ED]['Selection']['filter'])[];
    }

    getMenusByContext<OMenu extends IMenu<ED, keyof ED>>(
        entity: keyof ED,
        entityId: string
    ) {
        assert(this.menus, '应当先调用setMenus才能动态判定菜单');
        const menus = this.menus
            .filter((menu) => {
                const { entity: destEntity, paths, action } = menu;
                // 如果没有关联在entity上，则默认显示，由页面自己处理用户权限
                if (!destEntity || !paths) {
                    return true;
                }
                assert(action);
                const filters =
                    paths && paths.length > 0
                        ? this.makeMenuFilters(
                              destEntity!,
                              paths!,
                              entity,
                              entityId
                          )
                        : [{}]; // 如果没有path，视为无法推断操作的filter，直接返回无任何限制
                if (filters.length > 0) {
                    // 这里应该是or关系，paths表达的路径中只要有一条满足就可能满足
                    const allows = filters.map((filter) => {
                        if (filter === true) {
                            return true;
                        }
                        // relationAuth和其它的checker现在分开判断
                        let result = false;
                        if (action instanceof Array) {
                            for (let i = 0; i < action.length; i++) {
                                // action有一个满足就行了
                                const checkResult =
                                    this.relationAuth.checkRelation(
                                        destEntity,
                                        {
                                            action: action[i],
                                            data: undefined as any,
                                            filter,
                                        } as Omit<
                                            ED[keyof ED]['Operation'],
                                            'id'
                                        >
                                    ) &&
                                    this.cache.checkOperation(
                                        destEntity,
                                        action[i],
                                        undefined,
                                        filter,
                                        [
                                            'logical',
                                            'relation',
                                            'logicalRelation',
                                            'row',
                                        ]
                                    );

                                if (checkResult) {
                                    result = checkResult;
                                    break;
                                }
                            }
                            return result;
                        }
                        return (
                            this.relationAuth.checkRelation(destEntity, {
                                action,
                                data: undefined as any,
                                filter,
                            } as Omit<ED[keyof ED]['Operation'], 'id'>) &&
                            this.cache.checkOperation(
                                destEntity,
                                action,
                                undefined,
                                filter,
                                [
                                    'logical',
                                    'relation',
                                    'logicalRelation',
                                    'row',
                                ]
                            )
                        );
                    });
                    if (allows.indexOf(true) >= 0) {
                        return true;
                    }
                    return false;
                }
                return false;
            })
            .map((wrapper) => omit(wrapper, ['filtersMaker'])) as OMenu[];

        return menus;
    }
}
