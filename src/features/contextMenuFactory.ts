import assert from 'assert';
import { uniq, set, omit } from 'oak-domain/lib/utils/lodash';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict, Aspect, AuthCascadePath } from 'oak-domain/lib/types';
import { CommonAspectDict } from 'oak-common-aspect';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import { Cache } from './cache';
import { Feature } from '../types/Feature';
import { judgeRelation } from 'oak-domain/lib/store/relation';
import { RelationAuth } from './relationAuth';

interface IMenu<ED extends EntityDict & BaseEntityDict, T extends keyof ED> {
    name: string;
    entity: T;
    action: ED[T]['Action'];
    paths?: string[];
};

interface IMenuWrapper<ED extends EntityDict & BaseEntityDict, T extends keyof ED> extends IMenu<ED, T> {
    filtersMaker: (entity: keyof ED, entityId: string) => Array<ED[T]['Selection']['filter']>;
};

export class ContextMenuFactory<
    ED extends EntityDict & BaseEntityDict,
    Cxt extends AsyncContext<ED>,
    FrontCxt extends SyncContext<ED>,
    AD extends CommonAspectDict<ED, Cxt> & Record<string, Aspect<ED, Cxt>>
    >  extends Feature {
    cache: Cache<ED, Cxt, FrontCxt, AD>;
    menus?: IMenu<ED, keyof ED>[];
    cascadePathGraph: AuthCascadePath<ED>[];
    relationAuth: RelationAuth<ED, Cxt, FrontCxt, AD>;

    constructor(cache: Cache<ED, Cxt, FrontCxt, AD>, relationAuth: RelationAuth<ED, Cxt, FrontCxt, AD>, cascadePathGraph: AuthCascadePath<ED>[]) {
        super();
        this.cache = cache;
        this.cascadePathGraph = cascadePathGraph;
        this.relationAuth = relationAuth;
    }

    setMenus(menus: IMenu<ED, keyof ED>[]) {
        assert(!this.menus, 'setMenus只应该全局调用一次');
        this.menus = menus;
    }

    makeMenuFilters(destEntity: keyof ED, paths: string[], entity: keyof ED, entityId: string) {
        const schema = this.cache.getSchema();
        assert(paths.length > 0);

        const filters = paths.map(
            (path) => {
                if (path === '') {
                    if (entity === destEntity) {
                        return {
                            id: entityId,
                        } as ED[keyof ED]['Selection']['filter'];
                    }
                    return;
                }
                const pathhh = path.split('.');

                const judgeIter = (e2: keyof ED, idx: number): true | undefined | ED[keyof ED]['Selection']['filter'] => {
                    const rel = judgeRelation(schema, e2, pathhh[idx]);
                    let e3 = e2;
                    if (typeof rel === 'string') {
                        e3 = rel;
                    }
                    else if (rel === 2) {
                        e3 = pathhh[idx];
                    }
                    else {
                        assert(rel instanceof Array);
                        e3 = rel[0];
                    }
                    if (idx === pathhh.length - 1) {
                        if (e3 === 'user') {
                            // 用user连接说明一定满足
                            return true;
                        }
                        if (e3 === entity) {
                            const filter: ED[keyof ED]['Selection']['filter'] = {};
                            return set(filter, `${path}.id`, entityId);
                        }
                        return undefined;
                    }
                    return judgeIter(e3, idx + 1);
                }
                
                return judgeIter(destEntity, 0);
            }
        ).filter(
            ele => !!ele
        );

        return filters as (true | ED[keyof ED]['Selection']['filter'])[];
    }

    getMenusByContext<OMenu extends IMenu<ED, keyof ED>>(entity: keyof ED, entityId: string) {
        assert(this.menus, '应当先调用setMenus才能动态判定菜单');
        const menus = this.menus.filter(
            (menu) => {
                const { entity: destEntity, paths, action } = menu;
                const filters = paths ? this.makeMenuFilters(destEntity, paths, entity, entityId) : [{}];   // 如果没有path，视为无法推断操作的filter，直接返回无任何限制
                if (filters.length > 0) {
                    // 这里应该是or关系，paths表达的路径中只要有一条满足就可能满足
                    const allows = filters.map(
                        (filter) => {
                            if (filter === true) {
                                return true;
                            }
                            // relationAuth和其它的checker现在分开判断
                            return this.relationAuth.checkRelation(destEntity, {
                                action,
                                data: undefined as any,
                                filter,
                            } as Omit<ED[keyof ED]['Operation'], 'id'>) && this.cache.checkOperation(destEntity, action, undefined, filter, ['logical', 'relation', 'logicalRelation', 'row']);
                        }
                    );
                    if (allows.indexOf(true) >= 0) {
                        return true;
                    }
                    return false;                    
                }
                return false;
            }
        ).map(
            (wrapper) => omit(wrapper, ['filtersMaker'])
        ) as OMenu[];

        return menus;
    }
}