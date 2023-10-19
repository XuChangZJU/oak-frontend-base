"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextMenuFactory = void 0;
const assert_1 = require("oak-domain/lib/utils/assert");
const lodash_1 = require("oak-domain/lib/utils/lodash");
const Feature_1 = require("../types/Feature");
const relation_1 = require("oak-domain/lib/store/relation");
class ContextMenuFactory extends Feature_1.Feature {
    cache;
    menus;
    relationAuth;
    constructor(cache, relationAuth) {
        super();
        this.cache = cache;
        this.relationAuth = relationAuth;
    }
    setMenus(menus) {
        (0, assert_1.assert)(!this.menus, 'setMenus只应该全局调用一次');
        this.menus = menus;
    }
    makeMenuFilters(destEntity, paths, entity, entityId) {
        const schema = this.cache.getSchema();
        (0, assert_1.assert)(paths.length > 0);
        const filters = paths
            .map((path) => {
            if (path === '') {
                if (entity === destEntity) {
                    return {
                        id: entityId,
                    };
                }
                return;
            }
            const pathhh = path.split('.');
            const judgeIter = (e2, idx) => {
                const attr = pathhh[idx];
                const rel = (0, relation_1.judgeRelation)(schema, e2, attr);
                let e3 = e2;
                if (typeof rel === 'string') {
                    e3 = rel;
                }
                else if (rel === 2) {
                    e3 = attr;
                }
                else {
                    (0, assert_1.assert)(rel instanceof Array);
                    e3 = rel[0];
                }
                if (idx === pathhh.length - 1) {
                    if (e3 === 'user') {
                        // 用user连接说明一定满足
                        return true;
                    }
                    if (e3 === entity) {
                        const filter = {};
                        const paths2 = pathhh.slice(0, pathhh.length - 1);
                        if (rel === 2) {
                            (0, lodash_1.set)(filter, paths2.concat('entity'), entity);
                            (0, lodash_1.set)(filter, paths2.concat('entityId'), entityId);
                        }
                        else if (typeof rel === 'string') {
                            (0, lodash_1.set)(filter, paths2.concat(`${attr}Id`), entityId);
                        }
                        else {
                            (0, lodash_1.set)(filter, `${path}.id`, entityId);
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
        return filters;
    }
    getMenusByContext(entity, entityId) {
        (0, assert_1.assert)(this.menus, '应当先调用setMenus才能动态判定菜单');
        const menus = this.menus
            .filter((menu) => {
            const { entity: destEntity, paths, action } = menu;
            const filters = paths.length > 0
                ? this.makeMenuFilters(destEntity, paths, entity, entityId)
                : [{}]; // 如果没有path，视为无法推断操作的filter，直接返回无任何限制
            if (filters.length > 0) {
                // 这里应该是or关系，paths表达的路径中只要有一条满足就可能满足
                const allows = filters.map((filter) => {
                    if (filter === true) {
                        return true;
                    }
                    // relationAuth和其它的checker现在分开判断
                    return (this.relationAuth.checkRelation(destEntity, {
                        action,
                        data: undefined,
                        filter,
                    }) &&
                        this.cache.checkOperation(destEntity, action, undefined, filter, [
                            'logical',
                            'relation',
                            'logicalRelation',
                            'row',
                        ]));
                });
                if (allows.indexOf(true) >= 0) {
                    return true;
                }
                return false;
            }
            return false;
        })
            .map((wrapper) => (0, lodash_1.omit)(wrapper, ['filtersMaker']));
        return menus;
    }
}
exports.ContextMenuFactory = ContextMenuFactory;
