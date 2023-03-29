"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunningTree = void 0;
var tslib_1 = require("tslib");
var assert_1 = require("oak-domain/lib/utils/assert");
var lodash_1 = require("oak-domain/lib/utils/lodash");
var filter_1 = require("oak-domain/lib/store/filter");
var modi_1 = require("oak-domain/lib/store/modi");
var relation_1 = require("oak-domain/lib/store/relation");
var Feature_1 = require("../types/Feature");
var uuid_1 = require("oak-domain/lib/utils/uuid");
var string_1 = require("oak-domain/lib/utils/string");
function translateAuthItemToProjection(schema, entity, item, userId, prefix) {
    var cascadePath = item.cascadePath, relations = item.relations;
    var paths = cascadePath.split('.');
    var makeUserEntityProjection = function (entity2) {
        var _a, _b;
        (0, assert_1.assert)(entity2 !== 'user');
        var filter = {
            userId: userId,
        };
        // 数组目前不太好merge
        /* if (relations) {
            Object.assign(filter, {
                relation: {
                    $in: relations,
                }
            });
        } */
        var projection = (_a = {
                id: 1
            },
            _a["user".concat((0, string_1.firstLetterUpperCase)(entity2), "$").concat(entity2, "$244")] = {
                $entity: "user".concat((0, string_1.firstLetterUpperCase)(entity2)),
                data: (_b = {
                        id: 1,
                        userId: 1
                    },
                    _b["".concat(entity2, "Id")] = 1,
                    _b.relation = 1,
                    _b),
                filter: filter,
            },
            _a);
        return projection;
    };
    var translateIter = function (entity2, iter) {
        var _a, _b, _c, _d;
        var attr = paths[iter];
        var rel = (0, relation_1.judgeRelation)(schema, entity2, attr);
        if (iter === paths.length - 1) {
            if (rel === 2) {
                if (attr === 'user') {
                    return {
                        id: 1,
                        entity: 1,
                        entityId: 1,
                    };
                }
                else {
                    return _a = {
                            id: 1
                        },
                        _a[attr] = makeUserEntityProjection(attr),
                        _a;
                }
            }
            else {
                if (rel === 'user') {
                    return _b = {
                            id: 1
                        },
                        _b["".concat(attr, "Id")] = 1,
                        _b;
                }
                else {
                    return _c = {
                            id: 1
                        },
                        _c[attr] = makeUserEntityProjection(rel),
                        _c;
                }
            }
        }
        else {
            var proj2 = translateIter(rel === 2 ? attr : rel, iter + 1);
            return _d = {
                    id: 1
                },
                _d[attr] = proj2,
                _d;
        }
    };
    if (!cascadePath) {
        return makeUserEntityProjection(entity);
    }
    if (prefix && paths[0] !== prefix) {
        // 不在相关路径上的关系在这里不查
        return {};
    }
    return translateIter(entity, 0);
}
function makeRelationRefProjection(schema, authDict, entity, action, userId, prefix) {
    var _a, _b, _c;
    var proj = {};
    if (authDict[entity] && ((_a = authDict[entity]) === null || _a === void 0 ? void 0 : _a.actionAuth) && ((_b = authDict[entity]) === null || _b === void 0 ? void 0 : _b.actionAuth[action])) {
        var actionDef = (_c = authDict[entity]) === null || _c === void 0 ? void 0 : _c.actionAuth[action];
        if (actionDef instanceof Array) {
            var proj2 = actionDef.map(function (ad) {
                if (ad instanceof Array) {
                    var proj3 = ad.map(function (add) { return translateAuthItemToProjection(schema, entity, add, userId, prefix); }).reduce(function (prev, current) { return (0, lodash_1.merge)(prev, current); }, {});
                    return proj3;
                }
                return translateAuthItemToProjection(schema, entity, ad, userId, prefix);
            }).reduce(function (prev, current) { return (0, lodash_1.merge)(prev, current); }, {});
            (0, lodash_1.merge)(proj, proj2);
        }
        else {
            var proj2 = translateAuthItemToProjection(schema, entity, actionDef, userId);
            (0, lodash_1.merge)(proj, proj2);
        }
    }
    return proj;
}
var Node = /** @class */ (function (_super) {
    tslib_1.__extends(Node, _super);
    function Node(entity, schema, cache, authDict, projection, parent, path, actions, cascadeActions) {
        var _this = _super.call(this) || this;
        _this.entity = entity;
        _this.schema = schema;
        _this.authDict = authDict;
        _this.cache = cache;
        _this.projection = projection;
        _this.parent = parent;
        _this.dirty = undefined;
        _this.loading = false;
        _this.loadingMore = false;
        _this.executing = false;
        _this.modiIds = undefined;
        _this.actions = actions;
        _this.cascadeActions = cascadeActions;
        if (parent) {
            (0, assert_1.assert)(path);
            parent.addChild(path, _this);
        }
        return _this;
    }
    Node.prototype.getEntity = function () {
        return this.entity;
    };
    Node.prototype.getSchema = function () {
        return this.schema;
    };
    /**
     * 这个函数从某个结点向父亲查询，看所在路径上是否有需要被应用的modi
     */
    Node.prototype.getActiveModiOperations = function () {
        var modiIds = this.modiIds;
        if (modiIds && modiIds.length > 0) {
            var modies = this.cache.get('modi', {
                data: {
                    id: 1,
                    targetEntity: 1,
                    entity: 1,
                    entityId: 1,
                    iState: 1,
                    action: 1,
                    data: 1,
                    filter: 1,
                },
                filter: {
                    id: {
                        $in: modiIds,
                    },
                    iState: 'active',
                }
            });
            (0, assert_1.assert)(modies);
            return (0, modi_1.createOperationsFromModies)(modies);
        }
        // 如果当前层没有，向上查找。只要有就返回，目前应该不存在多层modi
        if (this.parent) {
            if (this.parent instanceof ListNode || this.parent instanceof SingleNode) {
                return this.parent.getActiveModiOperations();
            }
        }
    };
    Node.prototype.setDirty = function () {
        if (!this.dirty) {
            this.dirty = true;
        }
        // 现在必须要将父结点都置dirty了再publish，因为整棵树是在一起redoOperation了
        if (this.parent) {
            this.parent.setDirty();
        }
        this.publish();
    };
    Node.prototype.isDirty = function () {
        return !!this.dirty;
    };
    Node.prototype.isLoading = function () {
        return this.loading;
    };
    Node.prototype.setLoading = function (loading) {
        this.loading = loading;
    };
    Node.prototype.isLoadingMore = function () {
        return this.loadingMore;
    };
    Node.prototype.isExecuting = function () {
        return this.executing;
    };
    Node.prototype.setExecuting = function (executing) {
        this.executing = executing;
        this.publish();
    };
    Node.prototype.getParent = function () {
        return this.parent;
    };
    Node.prototype.getProjection = function (context) {
        var e_1, _a, e_2, _b;
        var projection = typeof this.projection === 'function' ? this.projection() : (this.projection && (0, lodash_1.cloneDeep)(this.projection));
        // 根据actions和cascadeActions的定义，将对应的projection构建出来
        var userId = context ? context.getCurrentUserId(true) : this.cache.getCurrentUserId(true);
        if (userId && projection) {
            if (this.actions) {
                var actions = typeof this.actions === 'function' ? this.actions() : this.actions;
                try {
                    for (var actions_1 = tslib_1.__values(actions), actions_1_1 = actions_1.next(); !actions_1_1.done; actions_1_1 = actions_1.next()) {
                        var a = actions_1_1.value;
                        var action = typeof a === 'object' ? a.action : a;
                        var proj = makeRelationRefProjection(this.schema, this.authDict, this.entity, action, userId);
                        (0, lodash_1.merge)(projection, proj);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (actions_1_1 && !actions_1_1.done && (_a = actions_1.return)) _a.call(actions_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            if (this.cascadeActions) {
                var cas = this.cascadeActions();
                for (var attr in cas) {
                    var rel = this.judgeRelation(attr);
                    (0, assert_1.assert)(rel instanceof Array);
                    try {
                        for (var _c = (e_2 = void 0, tslib_1.__values(cas[attr])), _d = _c.next(); !_d.done; _d = _c.next()) {
                            var a = _d.value;
                            var action = typeof a === 'object' ? a.action : a;
                            if (rel[1]) {
                                var proj = makeRelationRefProjection(this.schema, this.authDict, rel[0], action, this.entity);
                                (0, lodash_1.merge)(projection, proj[rel[1].slice(0, rel[1].length - 2)]);
                            }
                            else {
                                var proj = makeRelationRefProjection(this.schema, this.authDict, rel[0], action, this.entity);
                                (0, lodash_1.merge)(projection, proj[this.entity]);
                            }
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                }
            }
        }
        return projection;
    };
    Node.prototype.setProjection = function (projection) {
        (0, assert_1.assert)(!this.projection);
        this.projection = projection;
    };
    Node.prototype.judgeRelation = function (attr) {
        var attr2 = attr.split(':')[0]; // 处理attr:prev
        return (0, relation_1.judgeRelation)(this.schema, this.entity, attr2);
    };
    Node.prototype.contains = function (filter, conditionalFilter) {
        return (0, filter_1.contains)(this.entity, this.schema, filter, conditionalFilter);
    };
    Node.prototype.repel = function (filter1, filter2) {
        return (0, filter_1.repel)(this.entity, this.schema, filter1, filter2);
    };
    return Node;
}(Feature_1.Feature));
var DEFAULT_PAGINATION = {
    currentPage: 1,
    pageSize: 20,
    append: true,
    more: true,
};
var ListNode = /** @class */ (function (_super) {
    tslib_1.__extends(ListNode, _super);
    function ListNode(entity, schema, cache, authDict, projection, parent, path, filters, sorters, pagination, actions, cascadeActions) {
        var _this = _super.call(this, entity, schema, cache, authDict, projection, parent, path, actions, cascadeActions) || this;
        _this.children = {};
        _this.filters = filters || [];
        _this.sorters = sorters || [];
        _this.pagination = pagination || DEFAULT_PAGINATION;
        _this.updates = {};
        _this.syncHandler = function (records) { return _this.onCacheSync(records); };
        _this.cache.bindOnSync(_this.syncHandler);
        return _this;
    }
    ListNode.prototype.getChildPath = function (child) {
        var idx = 0;
        for (var k in this.children) {
            if (this.children[k] === child) {
                return k;
            }
            idx++;
        }
        (0, assert_1.assert)(false);
    };
    /* setLoading(loading: boolean) {
        super.setLoading(loading);
        for (const k in this.children) {
            this.children[k].setLoading(loading);
        }
    } */
    ListNode.prototype.checkIfClean = function () {
        var _a;
        if (Object.keys(this.updates).length > 0) {
            return;
        }
        for (var k in this.children) {
            if (this.children[k].isDirty()) {
                return;
            }
        }
        if (this.isDirty()) {
            this.dirty = false;
            (_a = this.parent) === null || _a === void 0 ? void 0 : _a.checkIfClean();
        }
    };
    ListNode.prototype.onCacheSync = function (records) {
        var e_3, _a;
        // 只需要处理insert
        if (this.loading) {
            return;
        }
        if (!this.ids) {
            return;
        }
        var needRefresh = false;
        try {
            for (var records_1 = tslib_1.__values(records), records_1_1 = records_1.next(); !records_1_1.done; records_1_1 = records_1.next()) {
                var record = records_1_1.value;
                var a = record.a;
                switch (a) {
                    case 'c': {
                        var e = record.e;
                        if (e === this.entity) {
                            needRefresh = true;
                        }
                        break;
                    }
                    case 'r': {
                        var e = record.e;
                        if (e === this.entity) {
                            needRefresh = true;
                        }
                        break;
                    }
                    default: {
                        break;
                    }
                }
                if (needRefresh) {
                    break;
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (records_1_1 && !records_1_1.done && (_a = records_1.return)) _a.call(records_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        /**
         * 这样处理可能会导致对B对象的删除或插入影响到A对象的list结果，当A的filter存在in B的查询时
         * 典型的例子如userRelationList中对user的查询
         * filter是： {
                    id: {
                        $in: {
                            entity: `user${entityStr}`,
                            data: {
                                userId: 1,
                            },
                            filter: {
                                [`${entity}Id`]: entityId,
                            },
                        },
                    },
                }
            此时对userRelation的删除动作就会导致user不会被移出list
         */
        if (needRefresh) {
            var _b = this.constructSelection(true), filter = _b.filter, sorter = _b.sorter;
            if (filter) {
                var result = this.cache.get(this.getEntity(), {
                    data: {
                        id: 1,
                    },
                    filter: filter,
                    sorter: sorter,
                });
                this.ids = result.map(function (ele) { return ele.id; });
            }
        }
    };
    ListNode.prototype.destroy = function () {
        this.cache.unbindOnSync(this.syncHandler);
        for (var k in this.children) {
            this.children[k].destroy();
        }
    };
    ListNode.prototype.getPagination = function () {
        return this.pagination;
    };
    ListNode.prototype.setPagination = function (pagination, dontRefresh) {
        var newPagination = Object.assign(this.pagination, pagination);
        this.pagination = newPagination;
        if (!dontRefresh) {
            this.refresh();
        }
    };
    ListNode.prototype.getChild = function (path) {
        return this.children[path];
    };
    ListNode.prototype.getChildren = function () {
        return this.children;
    };
    ListNode.prototype.addChild = function (path, node) {
        (0, assert_1.assert)(!this.children[path]);
        // assert(path.length > 10, 'List的path改成了id');
        this.children[path] = node;
    };
    ListNode.prototype.removeChild = function (path) {
        (0, lodash_1.unset)(this.children, path);
    };
    ListNode.prototype.getNamedFilters = function () {
        return this.filters;
    };
    ListNode.prototype.getNamedFilterByName = function (name) {
        var filter = this.filters.find(function (ele) { return ele['#name'] === name; });
        return filter;
    };
    ListNode.prototype.setNamedFilters = function (filters, refresh) {
        this.filters = filters;
        if (refresh) {
            this.refresh(1, true);
        }
        else {
            this.publish();
        }
    };
    ListNode.prototype.addNamedFilter = function (filter, refresh) {
        // filter 根据#name查找
        var fIndex = this.filters.findIndex(function (ele) { return filter['#name'] && ele['#name'] === filter['#name']; });
        if (fIndex >= 0) {
            this.filters.splice(fIndex, 1, filter);
        }
        else {
            this.filters.push(filter);
        }
        if (refresh) {
            this.refresh(1, true);
        }
        else {
            this.publish();
        }
    };
    ListNode.prototype.removeNamedFilter = function (filter, refresh) {
        // filter 根据#name查找
        var fIndex = this.filters.findIndex(function (ele) { return filter['#name'] && ele['#name'] === filter['#name']; });
        if (fIndex >= 0) {
            this.filters.splice(fIndex, 1);
        }
        if (refresh) {
            this.refresh(1, true);
        }
        else {
            this.publish();
        }
    };
    ListNode.prototype.removeNamedFilterByName = function (name, refresh) {
        // filter 根据#name查找
        var fIndex = this.filters.findIndex(function (ele) { return ele['#name'] === name; });
        if (fIndex >= 0) {
            this.filters.splice(fIndex, 1);
        }
        if (refresh) {
            this.refresh(1, true);
        }
        else {
            this.publish();
        }
    };
    ListNode.prototype.getNamedSorters = function () {
        return this.sorters;
    };
    ListNode.prototype.getNamedSorterByName = function (name) {
        var sorter = this.sorters.find(function (ele) { return ele['#name'] === name; });
        return sorter;
    };
    ListNode.prototype.setNamedSorters = function (sorters, refresh) {
        this.sorters = sorters;
        if (refresh) {
            this.refresh(1, true);
        }
        else {
            this.publish();
        }
    };
    ListNode.prototype.addNamedSorter = function (sorter, refresh) {
        // sorter 根据#name查找
        var fIndex = this.sorters.findIndex(function (ele) { return sorter['#name'] && ele['#name'] === sorter['#name']; });
        if (fIndex >= 0) {
            this.sorters.splice(fIndex, 1, sorter);
        }
        else {
            this.sorters.push(sorter);
        }
        if (refresh) {
            this.refresh(1, true);
        }
        else {
            this.publish();
        }
    };
    ListNode.prototype.removeNamedSorter = function (sorter, refresh) {
        // sorter 根据#name查找
        var fIndex = this.sorters.findIndex(function (ele) { return sorter['#name'] && ele['#name'] === sorter['#name']; });
        if (fIndex >= 0) {
            this.sorters.splice(fIndex, 1);
        }
        if (refresh) {
            this.refresh(1, true);
        }
        else {
            this.publish();
        }
    };
    ListNode.prototype.removeNamedSorterByName = function (name, refresh) {
        // sorter 根据#name查找
        var fIndex = this.sorters.findIndex(function (ele) { return ele['#name'] === name; });
        if (fIndex >= 0) {
            this.sorters.splice(fIndex, 1);
        }
        if (refresh) {
            this.refresh(1, true);
        }
        else {
            this.publish();
        }
    };
    ListNode.prototype.getFreshValue = function (context) {
        /**
         * 如果当前结点有父结点，根据filter去取数据（一对多的cascade取数据，父结点上可能有本结点相关的create动作）
         * 如果当前结点没有父结点，根据ids和自己所属的create去取数据
         */
        var _a = this.constructSelection(true, context), data = _a.data, sorter = _a.sorter, filter = _a.filter;
        var parent = this.getParent();
        var filter2;
        if (!(parent instanceof SingleNode)) {
            var _b = this, ids = _b.ids, updates = _b.updates;
            var ids2 = ids ? tslib_1.__spreadArray([], tslib_1.__read(ids), false) : [];
            for (var u in updates) {
                if (updates[u].operation.action === 'create') {
                    ids2.push(updates[u].operation.data.id);
                }
            }
            filter2 = ids2.length > 0 ? {
                id: {
                    $in: ids2,
                },
            } : undefined;
        }
        else {
            filter2 = filter;
        }
        if (filter2) {
            var result = this.cache.get(this.entity, {
                data: data,
                filter: filter2,
                sorter: sorter,
            }, undefined, context);
            return result;
        }
        return [];
    };
    ListNode.prototype.addItem = function (item, beforeExecute, afterExecute) {
        var id = (0, uuid_1.generateNewId)();
        (0, assert_1.assert)(!this.updates[id]);
        this.updates[id] = {
            beforeExecute: beforeExecute,
            afterExecute: afterExecute,
            operation: {
                id: (0, uuid_1.generateNewId)(),
                action: 'create',
                data: Object.assign(item, { id: id }),
            },
        };
        this.setDirty();
    };
    ListNode.prototype.removeItem = function (id, beforeExecute, afterExecute) {
        if (this.updates[id] &&
            this.updates[id].operation.action === 'create') {
            // 如果是新增项，在这里抵消
            (0, lodash_1.unset)(this.updates, id);
            this.removeChild(id);
        }
        else {
            this.updates[id] = {
                beforeExecute: beforeExecute,
                afterExecute: afterExecute,
                operation: {
                    id: (0, uuid_1.generateNewId)(),
                    action: 'remove',
                    data: {},
                    filter: {
                        id: id,
                    },
                },
            };
        }
        this.setDirty();
    };
    ListNode.prototype.recoverItem = function (id) {
        var operation = this.updates[id].operation;
        (0, assert_1.assert)(operation.action === 'remove');
        (0, lodash_1.unset)(this.updates, id);
        this.setDirty();
    };
    ListNode.prototype.resetItem = function (id) {
        var operation = this.updates[id].operation;
        (0, assert_1.assert)(operation.action === 'update');
        (0, lodash_1.unset)(this.updates, id);
        this.setDirty();
    };
    /**
     * 目前只支持根据itemId进行更新
     * @param data
     * @param id
     * @param beforeExecute
     * @param afterExecute
     */
    ListNode.prototype.updateItem = function (data, id, action, beforeExecute, afterExecute) {
        // assert(Object.keys(this.children).length === 0, `更新子结点应该落在相应的component上`);
        if (this.children && this.children[id]) {
            // 实际中有这样的case出现，当使用actionButton时。先这样处理。by Xc 20230214
            return this.children[id].update(data, action, beforeExecute, afterExecute);
        }
        if (this.updates[id]) {
            var operation = this.updates[id].operation;
            var dataOrigin = operation.data;
            (0, lodash_1.merge)(dataOrigin, data);
            if (action && operation.action !== action) {
                (0, assert_1.assert)(operation.action === 'update');
                operation.action = action;
            }
        }
        else {
            this.updates[id] = {
                beforeExecute: beforeExecute,
                afterExecute: afterExecute,
                operation: {
                    id: (0, uuid_1.generateNewId)(),
                    action: action || 'update',
                    data: data,
                    filter: {
                        id: id,
                    },
                },
            };
        }
        this.setDirty();
    };
    ListNode.prototype.updateItems = function (data, action) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, _b, _i, id;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = [];
                        for (_b in data)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        id = _a[_i];
                        return [4 /*yield*/, this.updateItem(data[id], id, action)];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ListNode.prototype.doBeforeTrigger = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, _b, _i, k, update, _c, _d, _e, k;
            return tslib_1.__generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _a = [];
                        for (_b in this.updates)
                            _a.push(_b);
                        _i = 0;
                        _f.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        k = _a[_i];
                        update = this.updates[k];
                        if (!update.beforeExecute) return [3 /*break*/, 3];
                        return [4 /*yield*/, update.beforeExecute()];
                    case 2:
                        _f.sent();
                        _f.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        _c = [];
                        for (_d in this.children)
                            _c.push(_d);
                        _e = 0;
                        _f.label = 5;
                    case 5:
                        if (!(_e < _c.length)) return [3 /*break*/, 8];
                        k = _c[_e];
                        return [4 /*yield*/, this.children[k].doBeforeTrigger()];
                    case 6:
                        _f.sent();
                        _f.label = 7;
                    case 7:
                        _e++;
                        return [3 /*break*/, 5];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    ListNode.prototype.doAfterTrigger = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, _b, _i, k, update, _c, _d, _e, k;
            return tslib_1.__generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _a = [];
                        for (_b in this.updates)
                            _a.push(_b);
                        _i = 0;
                        _f.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        k = _a[_i];
                        update = this.updates[k];
                        if (!update.afterExecute) return [3 /*break*/, 3];
                        return [4 /*yield*/, update.afterExecute()];
                    case 2:
                        _f.sent();
                        _f.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        _c = [];
                        for (_d in this.children)
                            _c.push(_d);
                        _e = 0;
                        _f.label = 5;
                    case 5:
                        if (!(_e < _c.length)) return [3 /*break*/, 8];
                        k = _c[_e];
                        return [4 /*yield*/, this.children[k].doAfterTrigger()];
                    case 6:
                        _f.sent();
                        _f.label = 7;
                    case 7:
                        _e++;
                        return [3 /*break*/, 5];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    ListNode.prototype.getParentFilter = function (childNode) {
        for (var id in this.children) {
            if (this.children[id] === childNode) {
                return {
                    id: id,
                };
            }
        }
    };
    ListNode.prototype.composeOperations = function () {
        if (!this.dirty) {
            return;
        }
        var operations = [];
        for (var id in this.updates) {
            operations.push({
                entity: this.entity,
                operation: (0, lodash_1.cloneDeep)(this.updates[id].operation),
            });
        }
        for (var id in this.children) {
            var childOperation = this.children[id].composeOperations();
            if (childOperation) {
                operations.push.apply(operations, tslib_1.__spreadArray([], tslib_1.__read(childOperation), false));
            }
        }
        return operations;
    };
    ListNode.prototype.getProjection = function (context) {
        var projection = _super.prototype.getProjection.call(this, context);
        // List必须自主决定Projection
        /* if (this.children.length > 0) {
            const subProjection = await this.children[0].getProjection();
            return merge(projection, subProjection);
        } */
        return projection;
    };
    ListNode.prototype.constructFilters = function (context, withParent) {
        var ownFilters = this.filters;
        var filters = ownFilters.map(function (ele) {
            var filter = ele.filter;
            if (typeof filter === 'function') {
                return filter();
            }
            return filter;
        });
        if (withParent && this.parent) {
            if (this.parent instanceof SingleNode) {
                var filterOfParent = this.parent.getParentFilter(this, context);
                if (filterOfParent) {
                    filters.push(filterOfParent);
                }
                else {
                    // 说明有父结点但是却没有相应的约束，此时不应该去refresh(是一个insert动作)
                    return undefined;
                }
            }
        }
        return filters;
    };
    ListNode.prototype.constructSelection = function (withParent, context) {
        var sorters = this.sorters;
        var data = this.getProjection(context);
        (0, assert_1.assert)(data, '取数据时找不到projection信息');
        var sorterArr = sorters
            .map(function (ele) {
            var sorter = ele.sorter;
            if (typeof sorter === 'function') {
                return sorter();
            }
            return sorter;
        })
            .filter(function (ele) { return !!ele; });
        var filters = this.constructFilters(context, withParent);
        var filters2 = filters === null || filters === void 0 ? void 0 : filters.filter(function (ele) { return !!ele; });
        var filter = filters2 ? (0, filter_1.combineFilters)(filters2) : undefined;
        return {
            data: data,
            filter: filter,
            sorter: sorterArr,
        };
    };
    ListNode.prototype.refresh = function (pageNumber, getCount, append) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, entity, pagination, currentPage, pageSize, currentPage3, _b, projection, filter, sorter, err_1;
            var _this = this;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this, entity = _a.entity, pagination = _a.pagination;
                        currentPage = pagination.currentPage, pageSize = pagination.pageSize;
                        currentPage3 = typeof pageNumber === 'number' ? pageNumber - 1 : currentPage - 1;
                        _b = this.constructSelection(true), projection = _b.data, filter = _b.filter, sorter = _b.sorter;
                        if (!(filter && projection)) return [3 /*break*/, 4];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        this.setLoading(true);
                        if (append) {
                            this.loadingMore = true;
                        }
                        this.publish();
                        return [4 /*yield*/, this.cache.refresh(entity, {
                                data: projection,
                                filter: filter,
                                sorter: sorter,
                                indexFrom: currentPage3 * pageSize,
                                count: pageSize,
                            }, undefined, getCount, function (_a) {
                                var data = _a.data, count = _a.count;
                                _this.pagination.currentPage = currentPage3 + 1;
                                _this.pagination.more = data.length === pageSize;
                                _this.setLoading(false);
                                if (append) {
                                    _this.loadingMore = false;
                                }
                                if (getCount) {
                                    _this.pagination.total = count;
                                }
                                var ids = data.map(function (ele) { return ele.id; });
                                if (append) {
                                    _this.ids = (_this.ids || []).concat(ids);
                                }
                                else {
                                    _this.ids = ids;
                                }
                            })];
                    case 2:
                        _c.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _c.sent();
                        this.setLoading(false);
                        if (append) {
                            this.loadingMore = false;
                        }
                        throw err_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ListNode.prototype.loadMore = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, filters, sorters, pagination, entity, pageSize, more, currentPage, currentPage2;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this, filters = _a.filters, sorters = _a.sorters, pagination = _a.pagination, entity = _a.entity;
                        pageSize = pagination.pageSize, more = pagination.more, currentPage = pagination.currentPage;
                        if (!more) {
                            return [2 /*return*/];
                        }
                        currentPage2 = currentPage + 1;
                        return [4 /*yield*/, this.refresh(currentPage2, undefined, true)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ListNode.prototype.setCurrentPage = function (currentPage, append) {
        this.refresh(currentPage, undefined, append);
    };
    ListNode.prototype.clean = function () {
        this.dirty = undefined;
        this.updates = {};
        for (var k in this.children) {
            this.children[k].clean();
        }
        this.publish();
    };
    ListNode.prototype.getChildOperation = function (child) {
        var childId = '';
        for (var k in this.children) {
            if (this.children[k] === child) {
                childId = k;
                break;
            }
        }
        (0, assert_1.assert)(childId);
        if (this.updates && this.updates[childId]) {
            return this.updates[childId].operation;
        }
    };
    // 查看这个list上所有数据必须遵守的等值限制
    ListNode.prototype.getIntrinsticFilters = function () {
        var filters = this.constructFilters();
        return (0, filter_1.combineFilters)(filters || []);
    };
    return ListNode;
}(Node));
var SingleNode = /** @class */ (function (_super) {
    tslib_1.__extends(SingleNode, _super);
    function SingleNode(entity, schema, cache, authDict, projection, parent, path, id, actions, cascadeActions) {
        var _this = _super.call(this, entity, schema, cache, authDict, projection, parent, path, actions, cascadeActions) || this;
        _this.children = {};
        if (!id) {
            // 不传id先假设是创建动作
            _this.create({});
            _this.id = _this.operation.operation.data.id;
        }
        else {
            _this.id = id;
        }
        return _this;
    }
    SingleNode.prototype.getChildPath = function (child) {
        for (var k in this.children) {
            if (child === this.children[k]) {
                return k;
            }
        }
        (0, assert_1.assert)(false);
    };
    /*  setLoading(loading: boolean) {
         super.setLoading(loading);
         for (const k in this.children) {
             this.children[k].setLoading(loading);
         }
     } */
    SingleNode.prototype.checkIfClean = function () {
        var _a;
        if (this.operation) {
            return;
        }
        for (var k in this.children) {
            if (this.children[k].isDirty()) {
                return;
            }
        }
        if (this.isDirty()) {
            this.dirty = false;
            (_a = this.parent) === null || _a === void 0 ? void 0 : _a.checkIfClean();
        }
    };
    SingleNode.prototype.destroy = function () {
        for (var k in this.children) {
            this.children[k].destroy();
        }
    };
    SingleNode.prototype.getChild = function (path) {
        return this.children[path];
    };
    SingleNode.prototype.setId = function (id) {
        if (id !== this.id) {
            this.id = id;
            (0, assert_1.assert)(!this.dirty, 'setId时结点是dirty，在setId之前应当处理掉原有的update');
        }
    };
    SingleNode.prototype.unsetId = function () {
        this.id = undefined;
        this.publish();
    };
    // 最好用getFreshValue取值
    SingleNode.prototype.getId = function () {
        return this.id;
    };
    SingleNode.prototype.getChildren = function () {
        return this.children;
    };
    SingleNode.prototype.addChild = function (path, node) {
        (0, assert_1.assert)(!this.children[path]);
        this.children[path] = node;
    };
    SingleNode.prototype.removeChild = function (path) {
        (0, lodash_1.unset)(this.children, path);
    };
    SingleNode.prototype.getFreshValue = function (context) {
        var projection = this.getProjection(context, false);
        var id = this.id;
        if (projection) {
            var result = this.cache.get(this.entity, {
                data: projection,
                filter: {
                    id: id,
                },
            }, undefined, context);
            return result[0];
        }
    };
    SingleNode.prototype.doBeforeTrigger = function () {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _b, _c, _i, k, child;
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!((_a = this.operation) === null || _a === void 0 ? void 0 : _a.beforeExecute)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.operation.beforeExecute()];
                    case 1:
                        _d.sent();
                        _d.label = 2;
                    case 2:
                        _b = [];
                        for (_c in this.children)
                            _b.push(_c);
                        _i = 0;
                        _d.label = 3;
                    case 3:
                        if (!(_i < _b.length)) return [3 /*break*/, 6];
                        k = _b[_i];
                        child = this.children[k];
                        return [4 /*yield*/, child.doBeforeTrigger()];
                    case 4:
                        _d.sent();
                        _d.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    SingleNode.prototype.doAfterTrigger = function () {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _b, _c, _i, k, child;
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!((_a = this.operation) === null || _a === void 0 ? void 0 : _a.afterExecute)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.operation.afterExecute()];
                    case 1:
                        _d.sent();
                        _d.label = 2;
                    case 2:
                        _b = [];
                        for (_c in this.children)
                            _b.push(_c);
                        _i = 0;
                        _d.label = 3;
                    case 3:
                        if (!(_i < _b.length)) return [3 /*break*/, 6];
                        k = _b[_i];
                        child = this.children[k];
                        return [4 /*yield*/, child.doAfterTrigger()];
                    case 4:
                        _d.sent();
                        _d.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    SingleNode.prototype.create = function (data, beforeExecute, afterExecute) {
        var id = (0, uuid_1.generateNewId)();
        (0, assert_1.assert)(!this.id && !this.dirty, 'create前要保证singleNode为空');
        this.operation = {
            operation: {
                id: (0, uuid_1.generateNewId)(),
                action: 'create',
                data: Object.assign({}, data, { id: id }),
            },
            beforeExecute: beforeExecute,
            afterExecute: afterExecute,
        };
        this.id = id;
        this.setDirty();
    };
    SingleNode.prototype.update = function (data, action, beforeExecute, afterExecute) {
        var _a;
        if (!this.operation) {
            // 还是有可能是create
            var operation = {
                id: (0, uuid_1.generateNewId)(),
                action: action || 'update',
                data: data,
            };
            if (this.id) {
                Object.assign(operation, {
                    filter: {
                        id: this.id,
                    },
                });
            }
            this.operation = {
                operation: operation,
                beforeExecute: beforeExecute,
                afterExecute: afterExecute,
            };
        }
        else {
            var operation = this.operation.operation;
            (0, assert_1.assert)(['create', 'update', action].includes(operation.action));
            Object.assign(operation.data, data);
            if (action && operation.action !== action) {
                operation.action = action;
            }
        }
        // 处理外键，如果update的数据中有相应的外键，其子对象上的动作应当被clean掉
        for (var attr in data) {
            if (attr === 'entityId') {
                (0, assert_1.assert)(data.entity, '设置entityId时请将entity也传入');
                if (this.children[data.entity]) {
                    this.children[data.entity].clean();
                }
            }
            else if (((_a = this.schema[this.entity].attributes[attr]) === null || _a === void 0 ? void 0 : _a.type) === 'ref') {
                var refKey = attr.slice(0, attr.length - 2);
                if (this.children[refKey]) {
                    this.children[refKey].clean();
                }
            }
        }
        this.setDirty();
    };
    SingleNode.prototype.remove = function (beforeExecute, afterExecute) {
        var operation = {
            id: (0, uuid_1.generateNewId)(),
            action: 'remove',
            data: {},
            filter: {
                id: this.id,
            },
        };
        this.operation = {
            operation: operation,
            beforeExecute: beforeExecute,
            afterExecute: afterExecute,
        };
        this.setDirty();
    };
    SingleNode.prototype.composeOperations = function () {
        var _a, _b;
        if (this.dirty) {
            var operations = [];
            var operation = this.operation ? (0, lodash_1.cloneDeep)(this.operation.operation) : {
                id: (0, uuid_1.generateNewId)(),
                action: 'update',
                data: {},
                filter: {
                    id: this.id,
                }
            };
            for (var ele in this.children) {
                var ele2 = ele.includes(':') ? ele.slice(0, ele.indexOf(':')) : ele;
                var child = this.children[ele];
                var childOperations = child.composeOperations();
                if (childOperations) {
                    if (child instanceof SingleNode) {
                        (0, assert_1.assert)(childOperations.length === 1);
                        if (!operation.data[ele2]) {
                            Object.assign(operation.data, (_a = {},
                                _a[ele2] = childOperations[0].operation,
                                _a));
                        }
                        else {
                            // 目前应该只允许一种情况，就是父create，子update
                            (0, assert_1.assert)(operation.data[ele2].action === 'create' && childOperations[0].operation.action === 'update');
                            Object.assign(operation.data[ele2].data, childOperations[0].operation.data);
                        }
                    }
                    else {
                        (0, assert_1.assert)(child instanceof ListNode);
                        var childOpers = childOperations.map(function (ele) { return ele.operation; });
                        if (!operation.data[ele2]) {
                            operation.data[ele2] = childOpers;
                        }
                        else {
                            (_b = operation.data[ele2]).push.apply(_b, tslib_1.__spreadArray([], tslib_1.__read(childOpers), false));
                        }
                    }
                }
            }
            operations.push({
                entity: this.entity,
                operation: operation,
            });
            return operations;
        }
    };
    SingleNode.prototype.getProjection = function (context, withDecendants) {
        var _a, _b, _c;
        if (this.parent && this.parent instanceof ListNode) {
            return this.parent.getProjection(context);
        }
        var projection = _super.prototype.getProjection.call(this, context);
        if (projection && withDecendants) {
            for (var k in this.children) {
                if (k.indexOf(':') === -1) {
                    var rel = this.judgeRelation(k);
                    if (rel === 2) {
                        var subProjection = this.children[k].getProjection(context, true);
                        Object.assign(projection, (_a = {
                                entity: 1,
                                entityId: 1
                            },
                            _a[k] = subProjection,
                            _a));
                    }
                    else if (typeof rel === 'string') {
                        var subProjection = this.children[k].getProjection(context, true);
                        Object.assign(projection, (_b = {},
                            _b["".concat(k, "Id")] = 1,
                            _b[k] = subProjection,
                            _b));
                    }
                    else if (!k.endsWith('$$aggr')) {
                        var child = this.children[k];
                        (0, assert_1.assert)(rel instanceof Array && child instanceof ListNode);
                        var subSelection = child.constructSelection();
                        var subEntity = child.getEntity();
                        Object.assign(projection, (_c = {},
                            _c[k] = Object.assign(subSelection, {
                                $entity: subEntity,
                            }),
                            _c));
                    }
                }
            }
        }
        return projection;
    };
    SingleNode.prototype.refresh = function () {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var projection, filter, err_2;
            var _this = this;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // SingleNode如果是ListNode的子结点，则不必refresh（优化，ListNode有义务负责子层对象的数据）
                        if (this.parent && this.parent instanceof ListNode && this.parent.getEntity() === this.getEntity()) {
                            this.publish();
                            return [2 /*return*/];
                        }
                        // 如果是新建，也不用refresh
                        if (((_a = this.operation) === null || _a === void 0 ? void 0 : _a.operation.action) === 'create') {
                            return [2 /*return*/];
                        }
                        projection = this.getProjection(undefined, true);
                        filter = this.getFilter();
                        if (!(projection && filter)) return [3 /*break*/, 4];
                        this.setLoading(true);
                        this.publish();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.cache.refresh(this.entity, {
                                data: projection,
                                filter: filter,
                            }, undefined, undefined, function (_a) {
                                var _b = tslib_1.__read(_a.data, 1), value = _b[0];
                                // 对于modi对象，在此缓存
                                if (_this.schema[_this.entity].toModi && value) {
                                    var modi$entity = value.modi$entity;
                                    _this.modiIds = modi$entity.map(function (ele) { return ele.id; });
                                }
                                // 刷新后所有的更新都应当被丢弃（子层上可能会自动建立了this.create动作）
                                _this.clean();
                                _this.setLoading(false);
                            })];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_2 = _b.sent();
                        this.setLoading(false);
                        throw err_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SingleNode.prototype.clean = function () {
        this.dirty = undefined;
        this.operation = undefined;
        for (var child in this.children) {
            this.children[child].clean();
        }
        this.publish();
    };
    SingleNode.prototype.getFilter = function () {
        return {
            id: this.id,
        };
    };
    /**
     * getParentFilter不能假设一定已经有数据，只能根据当前filter的条件去构造
     * @param childNode
     * @param disableOperation
     * @returns
     */
    SingleNode.prototype.getParentFilter = function (childNode, context) {
        var _a, _b, _c, _d;
        var value = this.getFreshValue(context);
        for (var key in this.children) {
            if (childNode === this.children[key]) {
                var rel = this.judgeRelation(key);
                if (rel === 2) {
                    (0, assert_1.assert)(false, '当前SingleNode应该自主管理id');
                    // 基于entity/entityId的多对一
                    /*  if (value) {
                         // 要么没有行(因为属性不全所以没有返回行，比如从list -> detail)；如果取到了行但此属性为空，则说明一定是singleNode到singleNode的create
                         if (value?.entityId) {
                             assert(value?.entity === this.children[key].getEntity());
                             return {
                                 id: value!.entityId!,
                             };
                         }
                         return;
                     }
                     const filter = this.getFilter();
                     if (filter) {
                         return {
                             id: {
                                 $in: {
                                     entity: this.entity,
                                     data: {
                                         entityId: 1,
                                     },
                                     filter: addFilterSegment(filter, {
                                         entity: childNode.getEntity(),
                                     }),
                                 }
                             },
                         };
                     } */
                }
                else if (typeof rel === 'string') {
                    (0, assert_1.assert)(false, '当前SingleNode应该自主管理id');
                    /* if (value) {
                        // 要么没有行(因为属性不全所以没有返回行，比如从list -> detail)；如果取到了行但此属性为空，则说明一定是singleNode到singleNode的create
                        if (value && value[`${rel}Id`]) {
                            return {
                                id: value[`${rel}Id`],
                            };
                        }
                        return;
                    }
                    const filter = this.getFilter();
                    if (filter) {
                        return {
                            id: {
                                $in: {
                                    entity: this.entity,
                                    data: {
                                        [`${rel}Id`]: 1,
                                    },
                                    filter,
                                },
                            },
                        };
                    } */
                }
                else {
                    (0, assert_1.assert)(rel instanceof Array && !key.endsWith('$$aggr'));
                    if (rel[1]) {
                        // 基于普通外键的一对多
                        if (value) {
                            return _a = {},
                                _a[rel[1]] = value.id,
                                _a;
                        }
                        var filter = this.getFilter();
                        if (filter) {
                            if (filter.id && Object.keys(filter).length === 1) {
                                return _b = {},
                                    _b[rel[1]] = filter.id,
                                    _b;
                            }
                            return _c = {},
                                _c[rel[1].slice(0, rel[1].length - 2)] = filter,
                                _c;
                        }
                    }
                    else {
                        // 基于entity/entityId的一对多 
                        if (value) {
                            return {
                                entity: this.entity,
                                entityId: value.id,
                            };
                        }
                        var filter = this.getFilter();
                        if (filter) {
                            if (filter.id && Object.keys(filter).length === 1) {
                                return {
                                    entity: this.entity,
                                    entityId: filter.id,
                                };
                            }
                            return _d = {},
                                _d[this.entity] = filter,
                                _d;
                        }
                    }
                }
            }
        }
        return;
    };
    return SingleNode;
}(Node));
var VirtualNode = /** @class */ (function (_super) {
    tslib_1.__extends(VirtualNode, _super);
    function VirtualNode(path, parent) {
        var _this = _super.call(this) || this;
        _this.dirty = false;
        _this.executing = false;
        _this.children = {};
        if (parent) {
            parent.addChild(path, _this);
        }
        return _this;
    }
    VirtualNode.prototype.getActiveModies = function (child) {
        return;
    };
    VirtualNode.prototype.setDirty = function () {
        this.dirty = true;
        this.publish();
    };
    VirtualNode.prototype.addChild = function (path, child) {
        // 规范virtualNode子结点的命名路径和类型，entity的singleNode必须被命名为entity或entity:number，ListNode必须被命名为entitys或entitys:number
        (0, assert_1.assert)(!this.children[path]);
        this.children[path] = child;
        if (child instanceof SingleNode || child instanceof ListNode) {
            var entity = child.getEntity();
            if (child instanceof SingleNode) {
                (0, assert_1.assert)(path === entity || path.startsWith("".concat(entity, ":")), "oakPath\u300C".concat(path, "\u300D\u4E0D\u7B26\u5408\u547D\u540D\u89C4\u8303\uFF0C\u8BF7\u4EE5\u300C").concat(entity, ":\u300D\u4E3A\u547D\u540D\u8D77\u59CB\u6807\u8BC6"));
            }
            else {
                (0, assert_1.assert)(path === "".concat(entity, "s") || path.startsWith("".concat(entity, "s:")), "oakPath\u300C".concat(path, "\u300D\u4E0D\u7B26\u5408\u547D\u540D\u89C4\u8303\uFF0C\u8BF7\u4EE5\u300C").concat(entity, "s:\u300D\u4E3A\u547D\u540D\u8D77\u59CB\u6807\u8BC6"));
            }
        }
    };
    VirtualNode.prototype.getChild = function (path) {
        return this.children[path];
    };
    VirtualNode.prototype.getParent = function () {
        return undefined;
    };
    VirtualNode.prototype.destroy = function () {
        for (var k in this.children) {
            this.children[k].destroy();
        }
    };
    VirtualNode.prototype.getFreshValue = function () {
        return undefined;
    };
    VirtualNode.prototype.isDirty = function () {
        return this.dirty;
    };
    VirtualNode.prototype.refresh = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all(Object.keys(this.children).map(function (ele) { return _this.children[ele].refresh(); }))];
                    case 1:
                        _a.sent();
                        this.publish();
                        return [2 /*return*/];
                }
            });
        });
    };
    VirtualNode.prototype.composeOperations = function () {
        /**
         * 当一个virtualNode有多个子结点，而这些子结点的前缀一致时，标识这些子结点其实是指向同一个对象，此时需要合并
         */
        var operationss = [];
        var operationDict = {};
        for (var ele in this.children) {
            var operation = this.children[ele].composeOperations();
            if (operation) {
                var idx = ele.indexOf(':') !== -1 ? ele.slice(0, ele.indexOf(':')) : ele;
                if (operationDict[idx]) {
                    (0, assert_1.assert)(false, '这种情况不应当再出现');
                    // 需要合并这两个子结点的动作       todo 两个子结点指向同一个对象，这种情况应当要消除
                    /* if (this.children[ele] instanceof SingleNode) {
                        // mergeOperationOper(this.children[ele].getEntity(), this.children[ele].getSchema(), operation[0], operationDict[idx][0]);
                    }
                    else {
                        console.warn('发生virtualNode上的list页面的动作merge，请查看');
                        operationDict[idx].push(...operation);
                    } */
                }
                else {
                    operationDict[idx] = operation;
                }
            }
        }
        for (var k in operationDict) {
            operationss.push.apply(operationss, tslib_1.__spreadArray([], tslib_1.__read(operationDict[k]), false));
        }
        return operationss;
    };
    VirtualNode.prototype.setExecuting = function (executing) {
        this.executing = executing;
        this.publish();
    };
    VirtualNode.prototype.isExecuting = function () {
        return this.executing;
    };
    VirtualNode.prototype.isLoading = function () {
        for (var ele in this.children) {
            if (this.children[ele].isLoading()) {
                return true;
            }
        }
        return false;
    };
    VirtualNode.prototype.doBeforeTrigger = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, _b, _i, ele;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = [];
                        for (_b in this.children)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        ele = _a[_i];
                        return [4 /*yield*/, this.children[ele].doBeforeTrigger()];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    VirtualNode.prototype.doAfterTrigger = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, _b, _i, ele;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = [];
                        for (_b in this.children)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        ele = _a[_i];
                        return [4 /*yield*/, this.children[ele].doAfterTrigger()];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    VirtualNode.prototype.clean = function () {
        this.dirty = false;
        for (var ele in this.children) {
            this.children[ele].clean();
        }
    };
    VirtualNode.prototype.checkIfClean = function () {
        for (var k in this.children) {
            if (this.children[k].isDirty()) {
                return;
            }
        }
        this.dirty = false;
    };
    return VirtualNode;
}(Feature_1.Feature));
function analyzePath(path) {
    var idx = path.lastIndexOf('.');
    if (idx !== -1) {
        return {
            parent: path.slice(0, idx),
            path: path.slice(idx + 1),
        };
    }
    return {
        path: path,
    };
}
var RunningTree = /** @class */ (function (_super) {
    tslib_1.__extends(RunningTree, _super);
    function RunningTree(cache, schema, authDict) {
        var _this = _super.call(this) || this;
        // this.aspectWrapper = aspectWrapper;
        _this.cache = cache;
        _this.schema = schema;
        _this.root = {};
        _this.authDict = authDict;
        return _this;
    }
    RunningTree.prototype.createNode = function (options) {
        var entity = options.entity, pagination = options.pagination, fullPath = options.path, filters = options.filters, sorters = options.sorters, projection = options.projection, isList = options.isList, id = options.id, actions = options.actions, cascadeActions = options.cascadeActions;
        var node;
        var _a = analyzePath(fullPath), parent = _a.parent, path = _a.path;
        var parentNode = parent ? this.findNode(parent) : undefined;
        if (this.findNode(fullPath)) {
            // 现在都允许结点不析构
            var node_1 = this.findNode(fullPath);
            if (node_1 instanceof ListNode) {
                (0, assert_1.assert)(isList && node_1.getEntity() === entity);
                if (!node_1.getProjection() && projection) {
                    node_1.setProjection(projection);
                    if (filters) {
                        node_1.setNamedFilters(filters);
                    }
                    if (sorters) {
                        node_1.setNamedSorters(sorters);
                    }
                    if (pagination) {
                        node_1.setPagination(pagination, false); // 创建成功后会统一refresh
                    }
                }
                else if (projection) {
                    // 这里有一个例外是queryPanel这种和父结点共用此结点的抽象组件
                    // assert(false, `创建node时发现path[${fullPath}]已经存在有效的ListNod结点，这种情况不应该存在`);
                }
            }
            else if (node_1 instanceof SingleNode) {
                (0, assert_1.assert)(!isList && node_1.getEntity() === entity);
                if (!node_1.getProjection() && projection) {
                    node_1.setProjection(projection);
                    if (id) {
                        var id2 = node_1.getId();
                        (0, assert_1.assert)(id === id2, "\u91CD\u7528path[".concat(fullPath, "]\u4E0A\u7684singleNode\u65F6\uFF0C\u5176\u4E0A\u6CA1\u6709\u7F6E\u6709\u6548id\uFF0C\u8FD9\u79CD\u60C5\u51B5id\u5E94\u5F53\u7531\u7236\u7ED3\u70B9\u8BBE\u7F6E"));
                    }
                }
                else {
                    // 目前只有一种情况合法，即parentNode是list，列表中的位置移动引起的重用
                    // assert(parentNode instanceof ListNode, `创建node时发现path[${fullPath}]已有有效的SingleNode结点，本情况不应当存在`);
                }
            }
            else {
                // assert(false, `创建node时发现path[${fullPath}]已有有效的VirtualNode结点，本情况不应当存在`);
            }
            return node_1;
        }
        if (entity) {
            if (isList) {
                (0, assert_1.assert)(!(parentNode instanceof ListNode));
                // assert(projection, `页面没有定义投影「${path}」`);
                node = new ListNode(entity, this.schema, this.cache, this.authDict, projection, parentNode, path, filters, sorters, pagination, actions, cascadeActions);
            }
            else {
                node = new SingleNode(entity, this.schema, this.cache, this.authDict, projection, parentNode, // 过编译
                path, id, actions, cascadeActions);
            }
        }
        else {
            (0, assert_1.assert)(!parentNode || parentNode instanceof VirtualNode);
            node = new VirtualNode(path, parentNode);
        }
        if (!parentNode) {
            (0, assert_1.assert)(!parent && !this.root[path]);
            this.root[path] = node;
        }
        return node;
    };
    RunningTree.prototype.findNode = function (path) {
        if (this.root[path]) {
            return this.root[path];
        }
        var paths = path.split('.');
        var node = this.root[paths[0]];
        var iter = 1;
        while (iter < paths.length && node) {
            if (!node) {
                return;
            }
            var childPath = paths[iter];
            iter++;
            node = node.getChild(childPath);
        }
        return node;
    };
    RunningTree.prototype.destroyNode = function (path) {
        var node = this.findNode(path);
        if (node) {
            var childPath = path.slice(path.lastIndexOf('.') + 1);
            var parent_1 = node.getParent();
            if (parent_1 instanceof SingleNode) {
                parent_1.removeChild(childPath);
            }
            else if (parent_1 instanceof ListNode) {
                parent_1.removeChild(childPath);
            }
            else if (!parent_1) {
                (0, assert_1.assert)(this.root.hasOwnProperty(path));
                (0, lodash_1.unset)(this.root, path);
            }
            node.destroy();
        }
    };
    RunningTree.prototype.getFreshValue = function (path) {
        var node = this.findNode(path);
        var paths = path.split('.');
        var root = this.root[paths[0]];
        // todo 判定modi
        var includeModi = path.includes(':next');
        if (node) {
            var context_1 = this.cache.begin();
            (0, assert_1.assert)(node instanceof ListNode || node instanceof SingleNode);
            if (includeModi) {
                var opers2 = node.getActiveModiOperations();
                if (opers2) {
                    this.cache.redoOperation(opers2, context_1);
                }
            }
            var opers = root === null || root === void 0 ? void 0 : root.composeOperations();
            if (opers) {
                this.cache.redoOperation(opers, context_1);
            }
            var value = node.getFreshValue(context_1);
            context_1.rollback();
            return value;
        }
    };
    RunningTree.prototype.isDirty = function (path) {
        var node = this.findNode(path);
        return node ? node.isDirty() : false;
    };
    RunningTree.prototype.addItem = function (path, data, beforeExecute, afterExecute) {
        var node = this.findNode(path);
        (0, assert_1.assert)(node instanceof ListNode);
        return node.addItem(data, beforeExecute, afterExecute);
    };
    RunningTree.prototype.removeItem = function (path, id, beforeExecute, afterExecute) {
        var node = this.findNode(path);
        (0, assert_1.assert)(node instanceof ListNode);
        node.removeItem(id, beforeExecute, afterExecute);
    };
    RunningTree.prototype.updateItem = function (path, data, id, action, beforeExecute, afterExecute) {
        var node = this.findNode(path);
        (0, assert_1.assert)(node instanceof ListNode);
        node.updateItem(data, id, action, beforeExecute, afterExecute);
    };
    RunningTree.prototype.recoverItem = function (path, id) {
        var node = this.findNode(path);
        (0, assert_1.assert)(node instanceof ListNode);
        node.recoverItem(id);
    };
    RunningTree.prototype.resetItem = function (path, id) {
        var node = this.findNode(path);
        (0, assert_1.assert)(node instanceof ListNode);
        node.resetItem(id);
    };
    RunningTree.prototype.create = function (path, data, beforeExecute, afterExecute) {
        var node = this.findNode(path);
        (0, assert_1.assert)(node instanceof SingleNode);
        node.create(data, beforeExecute, afterExecute);
    };
    RunningTree.prototype.update = function (path, data, action, beforeExecute, afterExecute) {
        var node = this.findNode(path);
        (0, assert_1.assert)(node instanceof SingleNode);
        node.update(data, action, beforeExecute, afterExecute);
    };
    RunningTree.prototype.remove = function (path, beforeExecute, afterExecute) {
        var node = this.findNode(path);
        (0, assert_1.assert)(node instanceof SingleNode);
        node.remove(beforeExecute, afterExecute);
    };
    RunningTree.prototype.isLoading = function (path) {
        var node = this.findNode(path);
        return node === null || node === void 0 ? void 0 : node.isLoading();
    };
    RunningTree.prototype.isLoadingMore = function (path) {
        var node = this.findNode(path);
        (0, assert_1.assert)(!node || (node instanceof SingleNode || node instanceof ListNode));
        return node === null || node === void 0 ? void 0 : node.isLoadingMore();
    };
    RunningTree.prototype.isExecuting = function (path) {
        var node = this.findNode(path);
        return node ? node.isExecuting() : false;
    };
    RunningTree.prototype.refresh = function (path) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var node;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        node = this.findNode(path);
                        if (!(node instanceof ListNode)) return [3 /*break*/, 2];
                        return [4 /*yield*/, node.refresh(1, true)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        if (!node) return [3 /*break*/, 4];
                        return [4 /*yield*/, node.refresh()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    RunningTree.prototype.loadMore = function (path) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var node;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        node = this.findNode(path);
                        (0, assert_1.assert)(node instanceof ListNode);
                        return [4 /*yield*/, node.loadMore()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RunningTree.prototype.getPagination = function (path) {
        var node = this.findNode(path);
        (0, assert_1.assert)(node instanceof ListNode);
        return node.getPagination();
    };
    RunningTree.prototype.setId = function (path, id) {
        var node = this.findNode(path);
        (0, assert_1.assert)(node instanceof SingleNode);
        return node.setId(id);
    };
    RunningTree.prototype.unsetId = function (path) {
        var node = this.findNode(path);
        (0, assert_1.assert)(node instanceof SingleNode);
        node.unsetId();
    };
    RunningTree.prototype.getId = function (path) {
        var node = this.findNode(path);
        (0, assert_1.assert)(node instanceof SingleNode);
        return node.getId();
    };
    RunningTree.prototype.setPageSize = function (path, pageSize) {
        var node = this.findNode(path);
        (0, assert_1.assert)(node instanceof ListNode);
        // 切换分页pageSize就重新设置
        return node.setPagination({
            pageSize: pageSize,
            currentPage: 1,
            more: true,
        });
    };
    RunningTree.prototype.setCurrentPage = function (path, currentPage) {
        var node = this.findNode(path);
        (0, assert_1.assert)(node instanceof ListNode);
        return node.setCurrentPage(currentPage);
    };
    RunningTree.prototype.getNamedFilters = function (path) {
        var node = this.findNode(path);
        (0, assert_1.assert)(node instanceof ListNode);
        return node.getNamedFilters();
    };
    RunningTree.prototype.getNamedFilterByName = function (path, name) {
        var node = this.findNode(path);
        (0, assert_1.assert)(node instanceof ListNode);
        return node.getNamedFilterByName(name);
    };
    RunningTree.prototype.setNamedFilters = function (path, filters, refresh) {
        if (refresh === void 0) { refresh = true; }
        var node = this.findNode(path);
        (0, assert_1.assert)(node instanceof ListNode);
        node.setNamedFilters(filters, refresh);
    };
    RunningTree.prototype.addNamedFilter = function (path, filter, refresh) {
        if (refresh === void 0) { refresh = false; }
        var node = this.findNode(path);
        (0, assert_1.assert)(node instanceof ListNode);
        return node.addNamedFilter(filter, refresh);
    };
    RunningTree.prototype.removeNamedFilter = function (path, filter, refresh) {
        if (refresh === void 0) { refresh = false; }
        var node = this.findNode(path);
        (0, assert_1.assert)(node instanceof ListNode);
        return node.removeNamedFilter(filter, refresh);
    };
    RunningTree.prototype.removeNamedFilterByName = function (path, name, refresh) {
        if (refresh === void 0) { refresh = false; }
        var node = this.findNode(path);
        (0, assert_1.assert)(node instanceof ListNode);
        return node.removeNamedFilterByName(name, refresh);
    };
    RunningTree.prototype.getNamedSorters = function (path) {
        var node = this.findNode(path);
        (0, assert_1.assert)(node instanceof ListNode);
        return node.getNamedSorters();
    };
    RunningTree.prototype.getNamedSorterByName = function (path, name) {
        var node = this.findNode(path);
        (0, assert_1.assert)(node instanceof ListNode);
        return node.getNamedSorterByName(name);
    };
    RunningTree.prototype.setNamedSorters = function (path, sorters, refresh) {
        if (refresh === void 0) { refresh = true; }
        var node = this.findNode(path);
        (0, assert_1.assert)(node instanceof ListNode);
        return node.setNamedSorters(sorters, refresh);
    };
    RunningTree.prototype.addNamedSorter = function (path, sorter, refresh) {
        if (refresh === void 0) { refresh = false; }
        var node = this.findNode(path);
        (0, assert_1.assert)(node instanceof ListNode);
        return node.addNamedSorter(sorter, refresh);
    };
    RunningTree.prototype.removeNamedSorter = function (path, sorter, refresh) {
        if (refresh === void 0) { refresh = false; }
        var node = this.findNode(path);
        (0, assert_1.assert)(node instanceof ListNode);
        return node.removeNamedSorter(sorter, refresh);
    };
    RunningTree.prototype.removeNamedSorterByName = function (path, name, refresh) {
        if (refresh === void 0) { refresh = false; }
        var node = this.findNode(path);
        (0, assert_1.assert)(node instanceof ListNode);
        return node.removeNamedSorterByName(name, refresh);
    };
    RunningTree.prototype.getIntrinsticFilters = function (path) {
        var node = this.findNode(path);
        (0, assert_1.assert)(node instanceof ListNode);
        return node.getIntrinsticFilters();
    };
    RunningTree.prototype.tryExecute = function (path) {
        var node = this.findNode(path);
        var operations = node === null || node === void 0 ? void 0 : node.composeOperations();
        if (operations && operations.length > 0) {
            return this.cache.tryRedoOperations(operations);
        }
        return false;
    };
    RunningTree.prototype.getOperations = function (path) {
        var node = this.findNode(path);
        var operations = node.composeOperations();
        return operations;
    };
    RunningTree.prototype.execute = function (path, action) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var node, operations, entities, result, err_3;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        node = this.findNode(path);
                        if (action) {
                            if (node instanceof SingleNode) {
                                node.update({}, action);
                            }
                            else {
                                (0, assert_1.assert)(node instanceof ListNode);
                                (0, assert_1.assert)(false); // 对list的整体action等遇到了再实现
                            }
                        }
                        (0, assert_1.assert)(node.isDirty());
                        node.setExecuting(true);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, node.doBeforeTrigger()];
                    case 2:
                        _a.sent();
                        operations = node.composeOperations();
                        entities = (0, lodash_1.uniq)(operations.filter(function (ele) { return !!ele; }).map(function (ele) { return ele.entity; }));
                        (0, assert_1.assert)(entities.length === 1);
                        return [4 /*yield*/, this.cache.exec('operate', {
                                entity: entities[0],
                                operation: operations
                                    .filter(function (ele) { return !!ele; })
                                    .map(function (ele) { return ele.operation; }),
                            }, function () {
                                // 清空缓存
                                node.clean();
                                node.setExecuting(false);
                            })];
                    case 3:
                        result = _a.sent();
                        return [4 /*yield*/, node.doAfterTrigger()];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, result];
                    case 5:
                        err_3 = _a.sent();
                        node.setExecuting(false);
                        throw err_3;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    RunningTree.prototype.clean = function (path) {
        var node = this.findNode(path);
        node.clean();
        var parent = node.getParent();
        if (parent) {
            parent.checkIfClean();
        }
    };
    RunningTree.prototype.getRoot = function () {
        return this.root;
    };
    RunningTree.prototype.subscribeNode = function (callback, path) {
        var node = this.findNode(path);
        /**
         * 当list上的结点更新路径时，会重复subscribe多条子路径结点，目前的数据结构不能支持在didUpdate的时候进行unsbscribe
         * 这里先将path返回，由结点自主判定是否需要reRender
         * by Xc 20230219
         * 原先用的clearSubscribes，是假设没有结点共用路径，目前看来这个假设不成立
         */
        // node.clearSubscribes();
        return node.subscribe(function () {
            callback(path);
        });
    };
    return RunningTree;
}(Feature_1.Feature));
exports.RunningTree = RunningTree;
