"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextMenuFactory = void 0;
var tslib_1 = require("tslib");
var assert_1 = tslib_1.__importDefault(require("assert"));
var lodash_1 = require("oak-domain/lib/utils/lodash");
var filter_1 = require("oak-domain/lib/store/filter");
;
;
var ContextMenuFactory = /** @class */ (function () {
    function ContextMenuFactory(cache, cascadePathGraph) {
        this.cache = cache;
        this.cascadePathGraph = cascadePathGraph;
    }
    ContextMenuFactory.prototype.makeMenuWrappers = function (menus) {
        var destEntities = (0, lodash_1.uniq)(menus.map(function (ele) { return ele.entity; }));
        var pathMap = {};
        this.cascadePathGraph.forEach(function (path) {
            var _a;
            var _b = tslib_1.__read(path, 4), destEntity = _b[0], p = _b[1], s = _b[2], ir = _b[3];
            if (ir && destEntities.includes(destEntity)) {
                // 应用在判定登录者身份时用的对象都是应用级对象，且以relation判定关系
                if (pathMap[destEntity]) {
                    (_a = pathMap[destEntity]) === null || _a === void 0 ? void 0 : _a.push(path);
                }
                else {
                    pathMap[destEntity] = [path];
                }
            }
        });
        return menus.map(function (menu) {
            var destEntity = menu.entity;
            var filtersMaker = function (sourceEntity, entityId) {
                // 在cascadePathMap中找到可能的路径并构建对应的filter
                var paths = pathMap[destEntity].filter(function (ele) { return ele[2] === sourceEntity; });
                return paths.map(function (path) {
                    var p = path[1];
                    var p2 = p.concat('Id');
                    var filter = {};
                    (0, lodash_1.set)(filter, p2, entityId);
                    return filter;
                });
            };
            return Object.assign({}, menu, {
                filtersMaker: filtersMaker,
            });
        });
    };
    ContextMenuFactory.prototype.setMenus = function (menus) {
        (0, assert_1.default)(!this.menuWrappers, 'setMenus只应该全局调用一次');
        this.menuWrappers = this.makeMenuWrappers(menus);
    };
    ContextMenuFactory.prototype.getMenusByContext = function (entity, entityId) {
        var _this = this;
        (0, assert_1.default)(this.menuWrappers, '应当先调用setMenus才能动态判定菜单');
        var menus = this.menuWrappers.filter(function (wrapper) {
            var destEntity = wrapper.entity, data = wrapper.data, filtersMaker = wrapper.filtersMaker, action = wrapper.action;
            var filters = filtersMaker(entity, entityId);
            var filter = (0, filter_1.combineFilters)(filters);
            var allow = _this.cache.checkOperation(destEntity, action, data, filter);
            return allow;
        }).map(function (wrapper) { return (0, lodash_1.omit)(wrapper, ['filtersMaker']); });
        return menus;
    };
    return ContextMenuFactory;
}());
exports.ContextMenuFactory = ContextMenuFactory;
