"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextMenuFactory = void 0;
var tslib_1 = require("tslib");
var assert_1 = require("oak-domain/lib/utils/assert");
var lodash_1 = require("oak-domain/lib/utils/lodash");
var Feature_1 = require("../types/Feature");
var relation_1 = require("oak-domain/lib/store/relation");
var ContextMenuFactory = /** @class */ (function (_super) {
    tslib_1.__extends(ContextMenuFactory, _super);
    function ContextMenuFactory(cache, relationAuth, cascadePathGraph) {
        var _this = _super.call(this) || this;
        _this.cache = cache;
        _this.cascadePathGraph = cascadePathGraph;
        _this.relationAuth = relationAuth;
        return _this;
    }
    ContextMenuFactory.prototype.setMenus = function (menus) {
        (0, assert_1.assert)(!this.menus, 'setMenus只应该全局调用一次');
        this.menus = menus;
    };
    ContextMenuFactory.prototype.makeMenuFilters = function (destEntity, paths, entity, entityId) {
        var schema = this.cache.getSchema();
        (0, assert_1.assert)(paths.length > 0);
        var filters = paths
            .map(function (path) {
            if (path === '') {
                if (entity === destEntity) {
                    return {
                        id: entityId,
                    };
                }
                return;
            }
            var pathhh = path.split('.');
            var judgeIter = function (e2, idx) {
                var attr = pathhh[idx];
                var rel = (0, relation_1.judgeRelation)(schema, e2, attr);
                var e3 = e2;
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
                        var filter = {};
                        var paths2 = pathhh.slice(0, pathhh.length - 1);
                        if (rel === 2) {
                            (0, lodash_1.set)(filter, paths2.concat('entity'), entity);
                            (0, lodash_1.set)(filter, paths2.concat('entityId'), entityId);
                        }
                        else if (typeof rel === 'string') {
                            (0, lodash_1.set)(filter, paths2.concat("".concat(attr, "Id")), entityId);
                        }
                        else {
                            (0, lodash_1.set)(filter, "".concat(path, ".id"), entityId);
                        }
                        return filter;
                    }
                    return undefined;
                }
                return judgeIter(e3, idx + 1);
            };
            return judgeIter(destEntity, 0);
        })
            .filter(function (ele) { return !!ele; });
        return filters;
    };
    ContextMenuFactory.prototype.getMenusByContext = function (entity, entityId) {
        var _this = this;
        (0, assert_1.assert)(this.menus, '应当先调用setMenus才能动态判定菜单');
        var menus = this.menus
            .filter(function (menu) {
            var destEntity = menu.entity, paths = menu.paths, action = menu.action;
            var filters = paths.length > 0
                ? _this.makeMenuFilters(destEntity, paths, entity, entityId)
                : [{}]; // 如果没有path，视为无法推断操作的filter，直接返回无任何限制
            if (filters.length > 0) {
                // 这里应该是or关系，paths表达的路径中只要有一条满足就可能满足
                var allows = filters.map(function (filter) {
                    if (filter === true) {
                        return true;
                    }
                    // relationAuth和其它的checker现在分开判断
                    return (_this.relationAuth.checkRelation(destEntity, {
                        action: action,
                        data: undefined,
                        filter: filter,
                    }) &&
                        _this.cache.checkOperation(destEntity, action, undefined, filter, [
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
            .map(function (wrapper) { return (0, lodash_1.omit)(wrapper, ['filtersMaker']); });
        return menus;
    };
    return ContextMenuFactory;
}(Feature_1.Feature));
exports.ContextMenuFactory = ContextMenuFactory;
