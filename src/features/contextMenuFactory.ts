import assert from 'assert';
import { uniq, set, omit } from 'oak-domain/lib/utils/lodash';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict, AuthCascadePath, Aspect } from 'oak-domain/lib/types';
import { CommonAspectDict } from 'oak-common-aspect';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import { combineFilters } from 'oak-domain/lib/store/filter';
import { Cache } from './cache';
import { Feature } from '../types/Feature';
import { judgeRelation } from 'oak-domain/lib/store/relation';

interface IMenu<ED extends EntityDict & BaseEntityDict, T extends keyof ED> {
    name: string;
    entity: T;
    action: ED[T]['Action'];
    data?: ED[T]['Update']['data'];
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
    menuWrappers?: IMenuWrapper<ED, keyof ED>[];
    cascadePathGraph: AuthCascadePath<ED>[];

    private makeMenuWrappers(menus: IMenu<ED, keyof ED>[]): IMenuWrapper<ED, keyof ED>[] {
        const destEntities = uniq(
            menus.map(
                ele => ele.entity
            )
        );
        const pathMap: {
            [E in keyof ED]?: AuthCascadePath<ED>[];
        } = {};

        this.cascadePathGraph.forEach(
            (path) => {
                const [destEntity, p, s, ir] = path;
                if (ir && destEntities.includes(destEntity)) {
                    // 应用在判定登录者身份时用的对象都是应用级对象，且以relation判定关系
                    if (pathMap[destEntity]) {
                        pathMap[destEntity]?.push(path);
                    }
                    else {
                        pathMap[destEntity] = [path];
                    }
                }
            }
        );

        return menus.map(
            (menu) => {
                const { entity: destEntity, paths: cascadePaths } = menu;
                const filtersMaker = (sourceEntity: keyof ED, entityId: string) => {
                    // 在cascadePathMap中找到可能的路径并构建对应的filter
                    const paths = pathMap[destEntity]!.filter(
                        (ele) => {
                            if (cascadePaths) {
                                assert(cascadePaths.length > 0);
                                return ele[2] === sourceEntity && cascadePaths.includes(ele[1]);
                            }
                            return ele[2] === sourceEntity;
                        }
                    );
                    return paths.map(
                        (path) => {
                            const p = path[1];
                            const ps = p.split('.');
                            const makeFilterInner = (entity: keyof ED, idx: number): ED[keyof ED]['Selection']['filter'] => {
                                const attr = ps[idx];
                                const rel = judgeRelation(this.cache.getSchema(), entity, attr);
                                if (idx === ps.length - 1) {
                                    if (rel === 2) {
                                        return {
                                            entity: attr,
                                            entityId,
                                        };
                                    }
                                    assert(typeof rel === 'string');
                                    return {
                                        [`${attr}Id`]: entityId,
                                    };
                                }
                                const e = rel === 2 ? attr : rel as string;
                                return {
                                    [attr]: makeFilterInner(e, idx + 1),
                                };
                            }
                            return makeFilterInner(destEntity, 0);
                        }
                    )
                };
                return Object.assign({}, menu, {
                    filtersMaker,
                });
            }
        );
    }

    constructor(cache: Cache<ED, Cxt, FrontCxt, AD>, cascadePathGraph: AuthCascadePath<ED>[]) {
        super();
        this.cache = cache;
        this.cascadePathGraph = cascadePathGraph;
    }

    setMenus(menus: IMenu<ED, keyof ED>[]) {
        assert(!this.menuWrappers, 'setMenus只应该全局调用一次');
        this.menuWrappers = this.makeMenuWrappers(menus);
    }

    getMenusByContext<OMenu extends IMenu<ED, keyof ED>>(entity: keyof ED, entityId: string) {
        assert(this.menuWrappers, '应当先调用setMenus才能动态判定菜单');
        const menus = this.menuWrappers.filter(
            (wrapper) => {
                const { entity: destEntity, data, filtersMaker, action } = wrapper;
                const filters = filtersMaker(entity, entityId);
                if (filters.length > 0) {
                    const filter = combineFilters(filters);
                    const allow = this.cache.checkOperation(destEntity, action, data, filter);
                    return allow;
                }
                return false;
            }
        ).map(
            (wrapper) => omit(wrapper, ['filtersMaker'])
        ) as OMenu[];

        return menus;
    }
}