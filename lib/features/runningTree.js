"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunningTree = void 0;
var tslib_1 = require("tslib");
var assert_1 = require("oak-domain/lib/utils/assert");
var lodash_1 = require("oak-domain/lib/utils/lodash");
var filter_1 = require("oak-domain/lib/store/filter");
var relation_1 = require("oak-domain/lib/store/relation");
var Feature_1 = require("../types/Feature");
var Node = /** @class */ (function () {
    function Node(entity, schema, cache, projection, parent) {
        this.entity = entity;
        this.schema = schema;
        this.cache = cache;
        this.projection = projection;
        this.parent = parent;
        this.dirty = undefined;
        this.loading = false;
        this.loadingMore = false;
        this.executing = false;
        this.operations = [];
        this.modiIds = [];
    }
    Node.prototype.getEntity = function () {
        return this.entity;
    };
    /**
     * 这个函数从某个结点向父亲查询，看所在路径上是否有需要被应用的modi
     */
    Node.prototype.getModiIds = function (child) {
        var childPath = this.getChildPath(child);
        if (childPath.includes(':')) {
            var modiIds = this.modiIds;
            // 如果是需要modi的路径，在这里应该就可以返回了，目前应该不存在modi嵌套modi
            return modiIds;
        }
        var toModi = this.schema[this.entity].toModi;
        if (toModi) {
            // 如果这就是一个toModi的对象，则不用再向上查找了
            return [];
        }
        if (this.parent) {
            return this.parent.getModiIds(this);
        }
        return [];
    };
    Node.prototype.setDirty = function () {
        if (!this.dirty) {
            this.dirty = true;
            if (this.parent) {
                this.parent.setDirty();
            }
        }
    };
    Node.prototype.isDirty = function () {
        return !!this.dirty;
    };
    Node.prototype.isLoading = function () {
        return this.loading;
    };
    Node.prototype.isLoadingMore = function () {
        return this.loadingMore;
    };
    Node.prototype.isExecuting = function () {
        return this.executing;
    };
    Node.prototype.setExecuting = function (executing) {
        this.executing = executing;
    };
    Node.prototype.getParent = function () {
        return this.parent;
    };
    Node.prototype.getProjection = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(typeof this.projection === 'function')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.projection()];
                    case 1:
                        _a = _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = (0, lodash_1.cloneDeep)(this.projection);
                        _b.label = 3;
                    case 3: return [2 /*return*/, _a];
                }
            });
        });
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
}());
var DEFAULT_PAGINATION = {
    currentPage: 1,
    pageSize: 20,
    append: true,
    more: true,
};
function mergeOperationData(entity, schema, from, into) {
    for (var attr in from) {
        if (!into[attr]) {
            into[attr] = from[attr];
        }
        else {
            var rel = (0, relation_1.judgeRelation)(schema, entity, attr);
            if (rel === 2) {
                /**
                 * 多对一的关系，这里不可能from是remove吧
                 */
                var result = mergeOperationOper(attr, schema, from[attr], into[attr]);
                (0, assert_1.assert)(!result);
            }
            else if (typeof rel === 'string') {
                var result = mergeOperationOper(rel, schema, from[attr], into[attr]);
                (0, assert_1.assert)(!result);
            }
            else if (rel instanceof Array) {
                // 这种情况还不是很清楚，感觉不太可能跑的到 by Xc
                (0, assert_1.assert)(false);
                /* const [entity2] = rel;
                const {
                    index,
                    eliminated,
                } = findOperationToMerge(entity2, schema, from[attr] as any, into[attr] as any);
                if (!index) {
                    (into[attr] as any).push(from[attr]);
                }
                else {
                    const result2 = mergeOperationOper(entity2, schema, from[attr] as any, index);
                    if (result2) {
                        pull(from[attr] as any, index);
                    }
                } */
            }
            else {
                into[attr] = from[attr];
            }
        }
    }
}
/**
 * 确定两个Operation要merge
 * @param entity
 * @param schema
 * @param from
 * @param into
 */
function mergeOperationOper(entity, schema, from, into) {
    var e_1, _a, e_2, _b;
    var action = from.action, data = from.data, filter = from.filter;
    var dataTo = into.data;
    if (action === into.action) {
        switch (action) {
            case 'create': {
                if (dataTo instanceof Array) {
                    if (data instanceof Array) {
                        data.forEach(function (ele) { return (0, assert_1.assert)(ele.id); });
                        dataTo.push.apply(dataTo, tslib_1.__spreadArray([], tslib_1.__read(data), false));
                    }
                    else {
                        (0, assert_1.assert)(data.id);
                        dataTo.push(data);
                    }
                }
                else if (!(data instanceof Array) && !data.id) {
                    // 特殊情况，其实就是单次create
                    mergeOperationData(entity, schema, data, dataTo);
                }
                else {
                    var data3 = [dataTo];
                    if (data instanceof Array) {
                        data3.push.apply(data3, tslib_1.__spreadArray([], tslib_1.__read(data), false));
                    }
                    else {
                        data3.push(data);
                    }
                    Object.assign(into, {
                        data: data3,
                    });
                }
                return false;
            }
            default: {
                mergeOperationData(entity, schema, data, dataTo);
                return false;
            }
        }
    }
    else {
        if (action === 'update' && into.action === 'create') {
            // 更新刚create的数据，直接加在上面
            var operData = into.data;
            if (operData instanceof Array) {
                try {
                    for (var operData_1 = tslib_1.__values(operData), operData_1_1 = operData_1.next(); !operData_1_1.done; operData_1_1 = operData_1.next()) {
                        var operData2 = operData_1_1.value;
                        if (operData2.id === filter.id) {
                            mergeOperationData(entity, schema, data, operData2);
                            return false;
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (operData_1_1 && !operData_1_1.done && (_a = operData_1.return)) _a.call(operData_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            else {
                if (operData.id === filter.id) {
                    mergeOperationData(entity, schema, data, operData);
                    return false;
                }
            }
        }
        else if (action === 'remove') {
            (0, assert_1.assert)(into.action === 'create');
            // create和remove动作相抵消
            var operData = into.data;
            if (operData instanceof Array) {
                try {
                    for (var operData_2 = tslib_1.__values(operData), operData_2_1 = operData_2.next(); !operData_2_1.done; operData_2_1 = operData_2.next()) {
                        var operData2 = operData_2_1.value;
                        if (operData2.id === filter.id) {
                            if (operData.length > 0) {
                                Object.assign(into, {
                                    data: (0, lodash_1.pull)(operData, operData2)
                                });
                                return false;
                            }
                            else {
                                return true;
                            }
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (operData_2_1 && !operData_2_1.done && (_b = operData_2.return)) _b.call(operData_2);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
            else {
                if (operData.id === filter.id) {
                    return true;
                }
            }
        }
    }
    (0, assert_1.assert)(false); // merge必须成功
}
function mergeOperationTrigger(from, to) {
    var be1 = from.beforeExecute, ae1 = from.afterExecute;
    if (be1) {
        (0, assert_1.assert)(!to.beforeExecute);
        to.beforeExecute = be1;
    }
    if (ae1) {
        (0, assert_1.assert)(!to.afterExecute);
        to.afterExecute = ae1;
    }
}
function findOperationToMerge(entity, schema, from, existed) {
    var e_3, _a, e_4, _b, e_5, _c;
    var action = from.action, filter = from.filter;
    var eliminated = [];
    try {
        for (var existed_1 = tslib_1.__values(existed), existed_1_1 = existed_1.next(); !existed_1_1.done; existed_1_1 = existed_1.next()) {
            var toOperation = existed_1_1.value;
            if (action === toOperation.action) {
                switch (action) {
                    case 'create': {
                        return {
                            index: toOperation,
                            eliminated: eliminated,
                        };
                    }
                    default: {
                        // update/remove只合并filter完全相同的项
                        var filter2 = toOperation.filter, data2 = toOperation.data;
                        (0, assert_1.assert)(filter && filter2, '更新动作目前应该都有谓词条件');
                        if ((0, filter_1.same)(entity, schema, filter, filter2)) {
                            return {
                                index: toOperation,
                                eliminated: eliminated,
                            };
                        }
                    }
                }
            }
            else {
                if (action === 'update' && toOperation.action === 'create') {
                    // 更新刚create的数据，直接加在上面
                    var operData = toOperation.data;
                    if (operData instanceof Array) {
                        try {
                            for (var operData_3 = (e_4 = void 0, tslib_1.__values(operData)), operData_3_1 = operData_3.next(); !operData_3_1.done; operData_3_1 = operData_3.next()) {
                                var operData2 = operData_3_1.value;
                                if (operData2.id === filter.id) {
                                    return {
                                        index: toOperation,
                                        eliminated: eliminated,
                                    };
                                }
                            }
                        }
                        catch (e_4_1) { e_4 = { error: e_4_1 }; }
                        finally {
                            try {
                                if (operData_3_1 && !operData_3_1.done && (_b = operData_3.return)) _b.call(operData_3);
                            }
                            finally { if (e_4) throw e_4.error; }
                        }
                    }
                    else {
                        if (operData.id === filter.id) {
                            return {
                                index: toOperation,
                                eliminated: eliminated,
                            };
                        }
                    }
                }
                else if (action === 'remove') {
                    if (toOperation.action === 'create') {
                        // create和remove动作相抵消
                        var operData = toOperation.data;
                        if (operData instanceof Array) {
                            try {
                                for (var operData_4 = (e_5 = void 0, tslib_1.__values(operData)), operData_4_1 = operData_4.next(); !operData_4_1.done; operData_4_1 = operData_4.next()) {
                                    var operData2 = operData_4_1.value;
                                    if (operData2.id === filter.id) {
                                        return {
                                            index: toOperation,
                                            eliminated: eliminated,
                                        };
                                    }
                                }
                            }
                            catch (e_5_1) { e_5 = { error: e_5_1 }; }
                            finally {
                                try {
                                    if (operData_4_1 && !operData_4_1.done && (_c = operData_4.return)) _c.call(operData_4);
                                }
                                finally { if (e_5) throw e_5.error; }
                            }
                        }
                        else {
                            if (operData.id === filter.id) {
                                return {
                                    index: toOperation,
                                    eliminated: eliminated,
                                };
                            }
                        }
                    }
                    else {
                        // update，此时把相同id的update直接去掉
                        var operFilter = toOperation.filter;
                        if ((filter === null || filter === void 0 ? void 0 : filter.id) === (operFilter === null || operFilter === void 0 ? void 0 : operFilter.id)) {
                            eliminated.push(toOperation);
                        }
                    }
                }
            }
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (existed_1_1 && !existed_1_1.done && (_a = existed_1.return)) _a.call(existed_1);
        }
        finally { if (e_3) throw e_3.error; }
    }
    // 到这儿说明merge不了
    return {
        index: undefined,
        eliminated: eliminated,
    };
}
/**
 * 尝试将operation行为merge到现有的operation中去
 * @param operation
 * @param existed
 * @return 是否merge成功
 */
function tryMergeOperationToExisted(entity, schema, operation, existed) {
    var e_6, _a;
    var oper = operation.oper;
    // 有动作的operation是不能合并的
    var existedOperations = existed.filter(function (ele) { return !ele.afterExecute && !ele.beforeExecute; }).map(function (ele) { return ele.oper; });
    var _b = findOperationToMerge(entity, schema, oper, existedOperations), index = _b.index, eliminated = _b.eliminated;
    if (index) {
        // 可以合并
        var origin_1 = existed.find(function (ele) { return ele.oper === index; });
        (0, assert_1.assert)(origin_1);
        var result = mergeOperationOper(entity, schema, oper, index);
        if (result) {
            // 说明相互抵消了
            (0, lodash_1.pull)(existed, origin_1);
        }
        else {
            mergeOperationTrigger(operation, origin_1);
        }
    }
    var _loop_1 = function (eli) {
        var origin_2 = existed.find(function (ele) { return ele.oper === eli; });
        (0, lodash_1.pull)(existed, origin_2);
    };
    try {
        for (var eliminated_1 = tslib_1.__values(eliminated), eliminated_1_1 = eliminated_1.next(); !eliminated_1_1.done; eliminated_1_1 = eliminated_1.next()) {
            var eli = eliminated_1_1.value;
            _loop_1(eli);
        }
    }
    catch (e_6_1) { e_6 = { error: e_6_1 }; }
    finally {
        try {
            if (eliminated_1_1 && !eliminated_1_1.done && (_a = eliminated_1.return)) _a.call(eliminated_1);
        }
        finally { if (e_6) throw e_6.error; }
    }
    return !!index;
}
var ListNode = /** @class */ (function (_super) {
    tslib_1.__extends(ListNode, _super);
    function ListNode(entity, schema, cache, projection, projectionShape, parent, filters, sorters, pagination) {
        var _this = _super.call(this, entity, schema, cache, projection, parent) || this;
        _this.children = [];
        _this.filters = filters || [];
        _this.sorters = sorters || [];
        _this.pagination = pagination || DEFAULT_PAGINATION;
        _this.ids = [];
        _this.syncHandler = function (records) { return _this.onCacheSync(records); };
        _this.cache.bindOnSync(_this.syncHandler);
        return _this;
    }
    ListNode.prototype.getChildPath = function (child) {
        var e_7, _a;
        var idx = 0;
        try {
            for (var _b = tslib_1.__values(this.children), _c = _b.next(); !_c.done; _c = _b.next()) {
                var child2 = _c.value;
                if (child === child2) {
                    return "".concat(idx);
                }
                idx++;
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_7) throw e_7.error; }
        }
        (0, assert_1.assert)(false);
    };
    ListNode.prototype.onCacheSync = function (records) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var createdIds, records_1, records_1_1, record, a, _a, e, d, id, currentIds, _b, sorter, filters, filter, value;
            var e_8, _c;
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        // 只需要处理insert
                        if (this.loading) {
                            return [2 /*return*/];
                        }
                        createdIds = [];
                        try {
                            for (records_1 = tslib_1.__values(records), records_1_1 = records_1.next(); !records_1_1.done; records_1_1 = records_1.next()) {
                                record = records_1_1.value;
                                a = record.a;
                                switch (a) {
                                    case 'c': {
                                        _a = record, e = _a.e, d = _a.d;
                                        if (e === this.entity) {
                                            if (d instanceof Array) {
                                                d.forEach(function (dd) {
                                                    var id = dd.id;
                                                    createdIds.push(id);
                                                });
                                            }
                                            else {
                                                id = d.id;
                                                createdIds.push(id);
                                            }
                                        }
                                        break;
                                    }
                                    default: {
                                        break;
                                    }
                                }
                            }
                        }
                        catch (e_8_1) { e_8 = { error: e_8_1 }; }
                        finally {
                            try {
                                if (records_1_1 && !records_1_1.done && (_c = records_1.return)) _c.call(records_1);
                            }
                            finally { if (e_8) throw e_8.error; }
                        }
                        if (!(createdIds.length > 0)) return [3 /*break*/, 3];
                        currentIds = this.ids;
                        return [4 /*yield*/, this.constructSelection(true)];
                    case 1:
                        _b = _d.sent(), sorter = _b.sorter, filters = _b.filters;
                        filters.push({
                            id: {
                                $in: currentIds.concat(createdIds),
                            },
                        });
                        filter = (0, filter_1.combineFilters)(filters);
                        return [4 /*yield*/, this.cache.get(this.entity, {
                                data: {
                                    id: 1,
                                },
                                filter: filter,
                                sorter: sorter,
                            }, { obscure: true })];
                    case 2:
                        value = _d.sent();
                        this.ids = (value.map(function (ele) { return ele.id; }));
                        _d.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ListNode.prototype.destroy = function () {
        var e_9, _a;
        this.cache.unbindOnSync(this.syncHandler);
        try {
            for (var _b = tslib_1.__values(this.children), _c = _b.next(); !_c.done; _c = _b.next()) {
                var child = _c.value;
                child.destroy();
            }
        }
        catch (e_9_1) { e_9 = { error: e_9_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_9) throw e_9.error; }
        }
    };
    ListNode.prototype.getPagination = function () {
        return this.pagination;
    };
    ListNode.prototype.setPagination = function (pagination) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var newPagination;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        newPagination = Object.assign(this.pagination, pagination);
                        this.pagination = newPagination;
                        return [4 /*yield*/, this.refresh()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ListNode.prototype.getChild = function (path, newBorn) {
        var idx = parseInt(path, 10);
        (0, assert_1.assert)(typeof idx === 'number');
        (0, assert_1.assert)(idx < this.children.length);
        return this.children[idx];
    };
    ListNode.prototype.getChildren = function () {
        return this.children;
    };
    ListNode.prototype.addChild = function (path, node) {
        var idx = parseInt(path, 10);
        (0, assert_1.assert)(typeof idx === 'number');
        this.children[idx] = node;
    };
    ListNode.prototype.removeChild = function (path) {
        var idx = parseInt(path, 10);
        (0, assert_1.assert)(typeof idx === 'number');
        this.children.splice(idx, 1);
    };
    ListNode.prototype.getNamedFilters = function () {
        return this.filters;
    };
    ListNode.prototype.getNamedFilterByName = function (name) {
        var filter = this.filters.find(function (ele) { return ele['#name'] === name; });
        return filter;
    };
    ListNode.prototype.setNamedFilters = function (filters, refresh) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.filters = filters;
                        if (!refresh) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.refresh(1, true)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    ListNode.prototype.addNamedFilter = function (filter, refresh) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var fIndex;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fIndex = this.filters.findIndex(function (ele) { return filter['#name'] && ele['#name'] === filter['#name']; });
                        if (fIndex >= 0) {
                            this.filters.splice(fIndex, 1, filter);
                        }
                        else {
                            this.filters.push(filter);
                        }
                        if (!refresh) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.refresh(1, true)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    ListNode.prototype.removeNamedFilter = function (filter, refresh) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var fIndex;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fIndex = this.filters.findIndex(function (ele) { return filter['#name'] && ele['#name'] === filter['#name']; });
                        if (fIndex >= 0) {
                            this.filters.splice(fIndex, 1);
                        }
                        if (!refresh) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.refresh(1, true)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    ListNode.prototype.removeNamedFilterByName = function (name, refresh) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var fIndex;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fIndex = this.filters.findIndex(function (ele) { return ele['#name'] === name; });
                        if (fIndex >= 0) {
                            this.filters.splice(fIndex, 1);
                        }
                        if (!refresh) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.refresh(1, true)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    ListNode.prototype.getNamedSorters = function () {
        return this.sorters;
    };
    ListNode.prototype.getNamedSorterByName = function (name) {
        var sorter = this.sorters.find(function (ele) { return ele['#name'] === name; });
        return sorter;
    };
    ListNode.prototype.setNamedSorters = function (sorters, refresh) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.sorters = sorters;
                        if (!refresh) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.refresh(1, true)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    ListNode.prototype.addNamedSorter = function (sorter, refresh) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var fIndex;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fIndex = this.sorters.findIndex(function (ele) { return sorter['#name'] && ele['#name'] === sorter['#name']; });
                        if (fIndex >= 0) {
                            this.sorters.splice(fIndex, 1, sorter);
                        }
                        else {
                            this.sorters.push(sorter);
                        }
                        if (!refresh) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.refresh(1, true)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    ListNode.prototype.removeNamedSorter = function (sorter, refresh) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var fIndex;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fIndex = this.sorters.findIndex(function (ele) { return sorter['#name'] && ele['#name'] === sorter['#name']; });
                        if (fIndex >= 0) {
                            this.sorters.splice(fIndex, 1);
                        }
                        if (!refresh) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.refresh(1, true)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    ListNode.prototype.removeNamedSorterByName = function (name, refresh) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var fIndex;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fIndex = this.sorters.findIndex(function (ele) { return ele['#name'] === name; });
                        if (fIndex >= 0) {
                            this.sorters.splice(fIndex, 1);
                        }
                        if (!refresh) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.refresh(1, true)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    ListNode.prototype.getFreshValue = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var projection, _a, ids, _b, _c, operation, oper, data, modiIds, operations, result;
            var e_10, _d;
            var _this = this;
            return tslib_1.__generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!(typeof this.projection === 'function')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.projection()];
                    case 1:
                        _a = _e.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = this.projection;
                        _e.label = 3;
                    case 3:
                        projection = _a;
                        ids = tslib_1.__spreadArray([], tslib_1.__read(this.ids), false);
                        try {
                            for (_b = tslib_1.__values(this.operations), _c = _b.next(); !_c.done; _c = _b.next()) {
                                operation = _c.value;
                                oper = operation.oper;
                                if (oper.action === 'create') {
                                    data = oper.data;
                                    if (data instanceof Array) {
                                        ids.push.apply(ids, tslib_1.__spreadArray([], tslib_1.__read(data.map(function (ele) { return ele.id; })), false));
                                    }
                                    else {
                                        ids.push(data.id);
                                    }
                                }
                            }
                        }
                        catch (e_10_1) { e_10 = { error: e_10_1 }; }
                        finally {
                            try {
                                if (_c && !_c.done && (_d = _b.return)) _d.call(_b);
                            }
                            finally { if (e_10) throw e_10.error; }
                        }
                        modiIds = this.parent ? this.parent.getModiIds(this) : [];
                        operations = modiIds.map(function (ele) { return ({
                            entity: 'modi',
                            operation: {
                                action: 'apply',
                                data: {},
                                filter: {
                                    id: ele,
                                },
                            }
                        }); });
                        operations.push.apply(operations, tslib_1.__spreadArray([], tslib_1.__read(this.operations.map(function (ele) { return ({
                            entity: _this.entity,
                            operation: ele.oper,
                        }); })), false));
                        return [4 /*yield*/, this.cache.tryRedoOperationsThenSelect(this.entity, {
                                data: projection,
                                filter: {
                                    id: {
                                        $in: ids,
                                    }
                                },
                            }, operations)];
                    case 4:
                        result = (_e.sent()).result;
                        return [2 /*return*/, result];
                }
            });
        });
    };
    ListNode.prototype.addOperation = function (oper, beforeExecute, afterExecute) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var operation, merged, _a, _b, _c;
            var _d;
            return tslib_1.__generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        operation = {
                            oper: oper,
                            beforeExecute: beforeExecute,
                            afterExecute: afterExecute,
                        };
                        merged = tryMergeOperationToExisted(this.entity, this.schema, operation, this.operations);
                        if (!!merged) return [3 /*break*/, 2];
                        _b = (_a = Object).assign;
                        _c = [oper];
                        _d = {};
                        return [4 /*yield*/, generateNewId()];
                    case 1:
                        _b.apply(_a, _c.concat([(_d.id = _e.sent(), _d)]));
                        this.operations.push(operation);
                        _e.label = 2;
                    case 2:
                        this.setDirty();
                        return [2 /*return*/];
                }
            });
        });
    };
    ListNode.prototype.doBeforeTrigger = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, _b, operation, e_11_1, _c, _d, child, e_12_1;
            var e_11, _e, e_12, _f;
            return tslib_1.__generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _g.trys.push([0, 5, 6, 7]);
                        _a = tslib_1.__values(this.operations), _b = _a.next();
                        _g.label = 1;
                    case 1:
                        if (!!_b.done) return [3 /*break*/, 4];
                        operation = _b.value;
                        if (!operation.beforeExecute) return [3 /*break*/, 3];
                        return [4 /*yield*/, operation.beforeExecute()];
                    case 2:
                        _g.sent();
                        _g.label = 3;
                    case 3:
                        _b = _a.next();
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 7];
                    case 5:
                        e_11_1 = _g.sent();
                        e_11 = { error: e_11_1 };
                        return [3 /*break*/, 7];
                    case 6:
                        try {
                            if (_b && !_b.done && (_e = _a.return)) _e.call(_a);
                        }
                        finally { if (e_11) throw e_11.error; }
                        return [7 /*endfinally*/];
                    case 7:
                        _g.trys.push([7, 12, 13, 14]);
                        _c = tslib_1.__values(this.children), _d = _c.next();
                        _g.label = 8;
                    case 8:
                        if (!!_d.done) return [3 /*break*/, 11];
                        child = _d.value;
                        return [4 /*yield*/, child.doBeforeTrigger()];
                    case 9:
                        _g.sent();
                        _g.label = 10;
                    case 10:
                        _d = _c.next();
                        return [3 /*break*/, 8];
                    case 11: return [3 /*break*/, 14];
                    case 12:
                        e_12_1 = _g.sent();
                        e_12 = { error: e_12_1 };
                        return [3 /*break*/, 14];
                    case 13:
                        try {
                            if (_d && !_d.done && (_f = _c.return)) _f.call(_c);
                        }
                        finally { if (e_12) throw e_12.error; }
                        return [7 /*endfinally*/];
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    ListNode.prototype.doAfterTrigger = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, _b, operation, e_13_1, _c, _d, child, e_14_1;
            var e_13, _e, e_14, _f;
            return tslib_1.__generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _g.trys.push([0, 5, 6, 7]);
                        _a = tslib_1.__values(this.operations), _b = _a.next();
                        _g.label = 1;
                    case 1:
                        if (!!_b.done) return [3 /*break*/, 4];
                        operation = _b.value;
                        if (!operation.afterExecute) return [3 /*break*/, 3];
                        return [4 /*yield*/, operation.afterExecute()];
                    case 2:
                        _g.sent();
                        _g.label = 3;
                    case 3:
                        _b = _a.next();
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 7];
                    case 5:
                        e_13_1 = _g.sent();
                        e_13 = { error: e_13_1 };
                        return [3 /*break*/, 7];
                    case 6:
                        try {
                            if (_b && !_b.done && (_e = _a.return)) _e.call(_a);
                        }
                        finally { if (e_13) throw e_13.error; }
                        return [7 /*endfinally*/];
                    case 7:
                        _g.trys.push([7, 12, 13, 14]);
                        _c = tslib_1.__values(this.children), _d = _c.next();
                        _g.label = 8;
                    case 8:
                        if (!!_d.done) return [3 /*break*/, 11];
                        child = _d.value;
                        return [4 /*yield*/, child.doAfterTrigger()];
                    case 9:
                        _g.sent();
                        _g.label = 10;
                    case 10:
                        _d = _c.next();
                        return [3 /*break*/, 8];
                    case 11: return [3 /*break*/, 14];
                    case 12:
                        e_14_1 = _g.sent();
                        e_14 = { error: e_14_1 };
                        return [3 /*break*/, 14];
                    case 13:
                        try {
                            if (_d && !_d.done && (_f = _c.return)) _f.call(_c);
                        }
                        finally { if (e_14) throw e_14.error; }
                        return [7 /*endfinally*/];
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    ListNode.prototype.composeOperations = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var childOperations, operations, childOperations_1, childOperations_1_1, oper, _a, index, eliminated, result, eliminated_2, eliminated_2_1, eli;
            var e_15, _b, e_16, _c;
            var _this = this;
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!this.dirty) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, Promise.all(this.children.map(function (ele) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                var subOper;
                                return tslib_1.__generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, ele.composeOperations()];
                                        case 1:
                                            subOper = _a.sent();
                                            if (subOper) {
                                                return [2 /*return*/, subOper[0]];
                                            }
                                            return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 1:
                        childOperations = _d.sent();
                        operations = (0, lodash_1.cloneDeep)(this.operations.map(function (ele) { return ele.oper; }));
                        try {
                            for (childOperations_1 = tslib_1.__values(childOperations), childOperations_1_1 = childOperations_1.next(); !childOperations_1_1.done; childOperations_1_1 = childOperations_1.next()) {
                                oper = childOperations_1_1.value;
                                if (oper) {
                                    _a = findOperationToMerge(this.entity, this.schema, oper, operations), index = _a.index, eliminated = _a.eliminated;
                                    if (index) {
                                        result = mergeOperationOper(this.entity, this.schema, oper, index);
                                        if (result) {
                                            // 说明相互抵消了
                                            (0, lodash_1.pull)(operations, index);
                                        }
                                        else {
                                        }
                                    }
                                    else {
                                        operations.push(oper);
                                    }
                                    try {
                                        for (eliminated_2 = (e_16 = void 0, tslib_1.__values(eliminated)), eliminated_2_1 = eliminated_2.next(); !eliminated_2_1.done; eliminated_2_1 = eliminated_2.next()) {
                                            eli = eliminated_2_1.value;
                                            if (eli) {
                                                (0, lodash_1.pull)(operations, eli);
                                            }
                                        }
                                    }
                                    catch (e_16_1) { e_16 = { error: e_16_1 }; }
                                    finally {
                                        try {
                                            if (eliminated_2_1 && !eliminated_2_1.done && (_c = eliminated_2.return)) _c.call(eliminated_2);
                                        }
                                        finally { if (e_16) throw e_16.error; }
                                    }
                                }
                            }
                        }
                        catch (e_15_1) { e_15 = { error: e_15_1 }; }
                        finally {
                            try {
                                if (childOperations_1_1 && !childOperations_1_1.done && (_b = childOperations_1.return)) _b.call(childOperations_1);
                            }
                            finally { if (e_15) throw e_15.error; }
                        }
                        return [4 /*yield*/, repairOperations(this.entity, this.schema, operations)];
                    case 2:
                        _d.sent();
                        return [2 /*return*/, operations];
                }
            });
        });
    };
    ListNode.prototype.getProjection = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var projection, subProjection;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _super.prototype.getProjection.call(this)];
                    case 1:
                        projection = _a.sent();
                        if (!(this.children.length > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.children[0].getProjection()];
                    case 2:
                        subProjection = _a.sent();
                        return [2 /*return*/, (0, lodash_1.merge)(projection, subProjection)];
                    case 3: return [2 /*return*/, projection];
                }
            });
        });
    };
    ListNode.prototype.constructSelection = function (withParent) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _b, filters, sorters, data, sorterArr, filterArr, filterOfParent;
            var _this = this;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = this, filters = _b.filters, sorters = _b.sorters;
                        return [4 /*yield*/, this.getProjection()];
                    case 1:
                        data = _c.sent();
                        (0, assert_1.assert)(data, "取数据时找不到projection信息");
                        return [4 /*yield*/, Promise.all(sorters.map(function (ele) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                var sorter;
                                return tslib_1.__generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            sorter = ele.sorter;
                                            if (!(typeof sorter === 'function')) return [3 /*break*/, 2];
                                            return [4 /*yield*/, sorter()];
                                        case 1: return [2 /*return*/, _a.sent()];
                                        case 2: return [2 /*return*/, sorter];
                                    }
                                });
                            }); }))];
                    case 2:
                        sorterArr = (_c.sent()).filter(function (ele) { return !!ele; });
                        return [4 /*yield*/, Promise.all(filters.map(function (ele) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                var filter;
                                return tslib_1.__generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            filter = ele.filter;
                                            if (!(typeof filter === 'function')) return [3 /*break*/, 2];
                                            return [4 /*yield*/, filter()];
                                        case 1: return [2 /*return*/, _a.sent()];
                                        case 2: return [2 /*return*/, filter];
                                    }
                                });
                            }); }))];
                    case 3:
                        filterArr = _c.sent();
                        if (withParent) {
                            filterOfParent = (_a = this.parent) === null || _a === void 0 ? void 0 : _a.getOtmFilter(this);
                            if (filterOfParent) {
                                filterArr.push(filterOfParent);
                            }
                        }
                        return [2 /*return*/, {
                                data: data,
                                filters: filterArr.filter(function (ele) { return !!ele; }),
                                sorter: sorterArr,
                            }];
                }
            });
        });
    };
    ListNode.prototype.refresh = function (pageNumber, getCount, append) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, entity, pagination, currentPage, pageSize, currentPage3, _b, projection, filters, sorter, _c, data, count, ids, err_1;
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = this, entity = _a.entity, pagination = _a.pagination;
                        currentPage = pagination.currentPage, pageSize = pagination.pageSize;
                        if (append) {
                            this.loadingMore = true;
                        }
                        else {
                            this.loading = true;
                        }
                        currentPage3 = typeof pageNumber === 'number' ? pageNumber - 1 : currentPage - 1;
                        return [4 /*yield*/, this.constructSelection(true)];
                    case 1:
                        _b = _d.sent(), projection = _b.data, filters = _b.filters, sorter = _b.sorter;
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.cache.refresh(entity, {
                                data: projection,
                                filter: filters.length > 0
                                    ? (0, filter_1.combineFilters)(filters)
                                    : undefined,
                                sorter: sorter,
                                indexFrom: currentPage3 * pageSize,
                                count: pageSize,
                            }, undefined, getCount)];
                    case 3:
                        _c = _d.sent(), data = _c.data, count = _c.count;
                        this.pagination.currentPage = currentPage3 + 1;
                        this.pagination.more = data.length === pageSize;
                        if (append) {
                            this.loadingMore = false;
                        }
                        else {
                            this.loading = false;
                        }
                        if (getCount) {
                            this.pagination.total = count;
                        }
                        ids = data.map(function (ele) { return ele.id; });
                        if (append) {
                            this.ids = this.ids.concat(ids);
                        }
                        else {
                            this.ids = ids;
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        err_1 = _d.sent();
                        if (append) {
                            this.loadingMore = false;
                        }
                        else {
                            this.loading = false;
                        }
                        throw err_1;
                    case 5: return [2 /*return*/];
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
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.refresh(currentPage, undefined, append)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ListNode.prototype.clean = function () {
        var e_17, _a;
        this.dirty = undefined;
        this.operations = [];
        try {
            for (var _b = tslib_1.__values(this.children), _c = _b.next(); !_c.done; _c = _b.next()) {
                var child = _c.value;
                child.clean();
            }
        }
        catch (e_17_1) { e_17 = { error: e_17_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_17) throw e_17.error; }
        }
    };
    return ListNode;
}(Node));
var SingleNode = /** @class */ (function (_super) {
    tslib_1.__extends(SingleNode, _super);
    function SingleNode(entity, schema, cache, projection, projectionShape, parent) {
        var _this = _super.call(this, entity, schema, cache, projection, parent) || this;
        _this.children = {};
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
    SingleNode.prototype.destroy = function () {
        for (var k in this.children) {
            this.children[k].destroy();
        }
    };
    SingleNode.prototype.getChild = function (path) {
        return this.children[path];
    };
    SingleNode.prototype.setId = function (id) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.id = id;
                        return [4 /*yield*/, this.refresh()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
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
    /* async setValue(value: SelectRowShape<ED[T]['OpSchema'], ED[T]['Selection']['data']> | undefined) {
        let value2 = value && Object.assign({}, value);
        this.id = value2 && value2.id as string;
        const attrs = Object.keys(this.children);
        if (attrs.includes('modi$entity')) {
            // 说明这个对象关联了modi，所以这个对象的子对象必须要显示modi应用后的值，同时将当前的值记录在attr:prev属性
            if (value2) {
                if (value2.modi$entity && value2.modi$entity.length > 0) {
                    const entityOperations = createOperationsFromModies(value2.modi$entity as any);
                    const { projection, id, entity } = this;
                    const projection2 = typeof projection === 'function' ? await projection() : projection;

                    const { result: [value3] } = await this.cache.tryRedoOperations(entity, {
                        data: projection2,
                        filter: {
                            id: id!,
                        } as any,
                    }, entityOperations);

                    for (const attr in value3) {
                        if (attr !== 'modi$entity' && this.children[attr]) {
                            // 如果有子结点，就用modi应用后的结点替代原来的结点，
                            Object.assign(value2, {
                                [attr]: value3[attr],
                                [`${attr}:prev`]: value2[attr],
                            });
                        }
                    }
                }
            }
        }
        for (const attr of attrs) {
            const node = this.children[attr];
            if (value2 && value2[attr]) {
                await node.setValue(value2[attr] as any);
                if (node instanceof ListNode) {
                    const rel = this.judgeRelation(attr);
                    assert(rel instanceof Array);
                    const filter = rel[1] ? {
                        [rel[1]]: value2.id!,
                    } : {
                        entityId: value2.id!,
                    };

                    node.removeNamedFilterByName('inherent:parentId');
                    node.addNamedFilter({
                        filter,
                        "#name": 'inherent:parentId',
                    });
                }
            }
            else {
                await node.setValue(undefined);
            }
        }
        this.value = value2;
        this.refreshValue();
    } */
    SingleNode.prototype.getFreshValue = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var projection, _a, modiIds, operations, _b, operation, id, result;
            var _this = this;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!(typeof this.projection === 'function')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.projection()];
                    case 1:
                        _a = _c.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = this.projection;
                        _c.label = 3;
                    case 3:
                        projection = _a;
                        modiIds = this.parent ? this.parent.getModiIds(this) : [];
                        operations = modiIds.map(function (ele) { return ({
                            entity: 'modi',
                            operation: {
                                action: 'apply',
                                data: {},
                                filter: {
                                    id: ele,
                                },
                            }
                        }); });
                        _b = tslib_1.__read(this.operations, 1), operation = _b[0];
                        id = this.id;
                        if ((operation === null || operation === void 0 ? void 0 : operation.oper.action) === 'create') {
                            id = operation.oper.data.id;
                        }
                        operations.push.apply(operations, tslib_1.__spreadArray([], tslib_1.__read(this.operations.map(function (ele) { return ({
                            entity: _this.entity,
                            operation: ele.oper,
                        }); })), false));
                        return [4 /*yield*/, this.cache.tryRedoOperationsThenSelect(this.entity, {
                                data: projection,
                                filter: {
                                    id: id,
                                },
                            }, operations)];
                    case 4:
                        result = (_c.sent()).result;
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    SingleNode.prototype.doBeforeTrigger = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, _b, operation, e_18_1, _c, _d, _i, k, child;
            var e_18, _e;
            return tslib_1.__generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 5, 6, 7]);
                        _a = tslib_1.__values(this.operations), _b = _a.next();
                        _f.label = 1;
                    case 1:
                        if (!!_b.done) return [3 /*break*/, 4];
                        operation = _b.value;
                        if (!operation.beforeExecute) return [3 /*break*/, 3];
                        return [4 /*yield*/, operation.beforeExecute()];
                    case 2:
                        _f.sent();
                        _f.label = 3;
                    case 3:
                        _b = _a.next();
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 7];
                    case 5:
                        e_18_1 = _f.sent();
                        e_18 = { error: e_18_1 };
                        return [3 /*break*/, 7];
                    case 6:
                        try {
                            if (_b && !_b.done && (_e = _a.return)) _e.call(_a);
                        }
                        finally { if (e_18) throw e_18.error; }
                        return [7 /*endfinally*/];
                    case 7:
                        _c = [];
                        for (_d in this.children)
                            _c.push(_d);
                        _i = 0;
                        _f.label = 8;
                    case 8:
                        if (!(_i < _c.length)) return [3 /*break*/, 11];
                        k = _c[_i];
                        child = this.children[k];
                        return [4 /*yield*/, child.doBeforeTrigger()];
                    case 9:
                        _f.sent();
                        _f.label = 10;
                    case 10:
                        _i++;
                        return [3 /*break*/, 8];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    SingleNode.prototype.doAfterTrigger = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, _b, operation, e_19_1, _c, _d, _i, k, child;
            var e_19, _e;
            return tslib_1.__generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 5, 6, 7]);
                        _a = tslib_1.__values(this.operations), _b = _a.next();
                        _f.label = 1;
                    case 1:
                        if (!!_b.done) return [3 /*break*/, 4];
                        operation = _b.value;
                        if (!operation.afterExecute) return [3 /*break*/, 3];
                        return [4 /*yield*/, operation.afterExecute()];
                    case 2:
                        _f.sent();
                        _f.label = 3;
                    case 3:
                        _b = _a.next();
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 7];
                    case 5:
                        e_19_1 = _f.sent();
                        e_19 = { error: e_19_1 };
                        return [3 /*break*/, 7];
                    case 6:
                        try {
                            if (_b && !_b.done && (_e = _a.return)) _e.call(_a);
                        }
                        finally { if (e_19) throw e_19.error; }
                        return [7 /*endfinally*/];
                    case 7:
                        _c = [];
                        for (_d in this.children)
                            _c.push(_d);
                        _i = 0;
                        _f.label = 8;
                    case 8:
                        if (!(_i < _c.length)) return [3 /*break*/, 11];
                        k = _c[_i];
                        child = this.children[k];
                        return [4 /*yield*/, child.doAfterTrigger()];
                    case 9:
                        _f.sent();
                        _f.label = 10;
                    case 10:
                        _i++;
                        return [3 /*break*/, 8];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    SingleNode.prototype.addOperation = function (oper, beforeExecute, afterExecute) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var operation, _a, _b, _c, _d, _e, _f, _g, current;
            var _h, _j;
            return tslib_1.__generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        if (oper.action !== 'create') {
                            (0, assert_1.assert)(this.id);
                            if (!oper.filter) {
                                Object.assign(oper, {
                                    filter: {
                                        id: this.id,
                                    },
                                });
                            }
                            else {
                                (0, assert_1.assert)(oper.filter.id === this.id);
                            }
                        }
                        operation = {
                            oper: oper,
                            beforeExecute: beforeExecute,
                            afterExecute: afterExecute,
                        };
                        if (!(this.operations.length === 0)) return [3 /*break*/, 4];
                        if (!(oper.action === 'create')) return [3 /*break*/, 2];
                        _b = (_a = Object).assign;
                        _c = [oper.data];
                        _h = {};
                        return [4 /*yield*/, generateNewId()];
                    case 1:
                        _b.apply(_a, _c.concat([(_h.id = _k.sent(),
                                _h)]));
                        _k.label = 2;
                    case 2:
                        _e = (_d = Object).assign;
                        _f = [oper];
                        _j = {};
                        return [4 /*yield*/, generateNewId()];
                    case 3:
                        _e.apply(_d, _f.concat([(_j.id = _k.sent(), _j)]));
                        this.operations.push(operation);
                        return [3 /*break*/, 5];
                    case 4:
                        _g = tslib_1.__read(this.operations, 1), current = _g[0];
                        Object.assign(current.oper.data, oper.data);
                        mergeOperationTrigger(operation, current);
                        _k.label = 5;
                    case 5:
                        this.setDirty();
                        return [2 /*return*/];
                }
            });
        });
    };
    SingleNode.prototype.composeOperations = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var childOperations, operations, _a, _b, _c, _d, childOperations_2, childOperations_2_1, oper;
            var _e, _f, e_20, _g;
            var _this = this;
            return tslib_1.__generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        if (!this.dirty) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, Promise.all(Object.keys(this.children).map(function (ele) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                var child, childOperations, subOper, sliceIdx, ele2;
                                var _a, _b;
                                return tslib_1.__generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            child = this.children[ele];
                                            return [4 /*yield*/, child.composeOperations()];
                                        case 1:
                                            childOperations = _c.sent();
                                            if (childOperations) {
                                                if (child instanceof SingleNode) {
                                                    subOper = childOperations[0];
                                                }
                                                else {
                                                    (0, assert_1.assert)(child instanceof ListNode);
                                                    subOper = childOperations;
                                                }
                                            }
                                            if (subOper) {
                                                sliceIdx = ele.indexOf(':');
                                                ele2 = sliceIdx > 0 ? ele.slice(0, sliceIdx) : ele;
                                                if (this.id) {
                                                    return [2 /*return*/, {
                                                            oper: {
                                                                id: 'dummy',
                                                                action: 'update',
                                                                data: (_a = {},
                                                                    _a[ele2] = subOper,
                                                                    _a),
                                                                filter: {
                                                                    id: this.id,
                                                                }
                                                            },
                                                        }];
                                                }
                                                else {
                                                    return [2 /*return*/, {
                                                            id: 'dummy',
                                                            action: 'create',
                                                            data: (_b = {},
                                                                _b[ele2] = subOper,
                                                                _b),
                                                        }];
                                                }
                                            }
                                            return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 1:
                        childOperations = _h.sent();
                        operations = [];
                        if (!(this.operations.length > 0)) return [3 /*break*/, 2];
                        (0, assert_1.assert)(this.operations.length === 1);
                        // 这里不能直接改this.operations，只能克隆一个新的
                        operations.push((0, lodash_1.cloneDeep)(this.operations[0].oper));
                        return [3 /*break*/, 6];
                    case 2:
                        if (!this.id) return [3 /*break*/, 4];
                        _b = (_a = operations).push;
                        _e = {};
                        return [4 /*yield*/, generateNewId()];
                    case 3:
                        _b.apply(_a, [(_e.id = _h.sent(),
                                _e.action = 'update',
                                _e.data = {},
                                _e.filter = {
                                    id: this.id,
                                },
                                _e)]);
                        return [3 /*break*/, 6];
                    case 4:
                        _d = (_c = operations).push;
                        _f = {};
                        return [4 /*yield*/, generateNewId()];
                    case 5:
                        _d.apply(_c, [(_f.id = _h.sent(),
                                _f.action = 'create',
                                _f.data = {},
                                _f)]);
                        _h.label = 6;
                    case 6:
                        try {
                            for (childOperations_2 = tslib_1.__values(childOperations), childOperations_2_1 = childOperations_2.next(); !childOperations_2_1.done; childOperations_2_1 = childOperations_2.next()) {
                                oper = childOperations_2_1.value;
                                if (oper) {
                                    mergeOperationOper(this.entity, this.schema, oper, operations[0]); // SingleNode貌似不可能不merge成功
                                }
                            }
                        }
                        catch (e_20_1) { e_20 = { error: e_20_1 }; }
                        finally {
                            try {
                                if (childOperations_2_1 && !childOperations_2_1.done && (_g = childOperations_2.return)) _g.call(childOperations_2);
                            }
                            finally { if (e_20) throw e_20.error; }
                        }
                        return [4 /*yield*/, repairOperations(this.entity, this.schema, operations)];
                    case 7:
                        _h.sent();
                        return [2 /*return*/, operations];
                }
            });
        });
    };
    SingleNode.prototype.getProjection = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var projection, _a, _b, _i, k, rel, subProjection, child, subSelection, subEntity;
            var _c, _d;
            return tslib_1.__generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, _super.prototype.getProjection.call(this)];
                    case 1:
                        projection = _e.sent();
                        _a = [];
                        for (_b in this.children)
                            _a.push(_b);
                        _i = 0;
                        _e.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 7];
                        k = _a[_i];
                        if (!(k.indexOf(':') === -1)) return [3 /*break*/, 6];
                        rel = this.judgeRelation(k);
                        if (!(rel === 2 || typeof rel === 'string')) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.children[k].getProjection()];
                    case 3:
                        subProjection = _e.sent();
                        Object.assign(projection, (_c = {},
                            _c[k] = subProjection,
                            _c));
                        return [3 /*break*/, 6];
                    case 4:
                        child = this.children[k];
                        (0, assert_1.assert)(rel instanceof Array && child instanceof ListNode);
                        return [4 /*yield*/, child.constructSelection()];
                    case 5:
                        subSelection = _e.sent();
                        subEntity = child.getEntity();
                        Object.assign(projection, (_d = {},
                            _d[k] = Object.assign(subSelection, {
                                $entity: subEntity,
                            }),
                            _d));
                        _e.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7: return [2 /*return*/, projection];
                }
            });
        });
    };
    SingleNode.prototype.refresh = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var projection, _a, value, modi$entity, err_2;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getProjection()];
                    case 1:
                        projection = _b.sent();
                        if (!this.id) return [3 /*break*/, 5];
                        this.loading = true;
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.cache.refresh(this.entity, {
                                data: projection,
                                filter: {
                                    id: this.id,
                                },
                            })];
                    case 3:
                        _a = tslib_1.__read.apply(void 0, [(_b.sent()).data, 1]), value = _a[0];
                        // 对于modi对象，在此缓存
                        if (this.schema[this.entity].toModi) {
                            modi$entity = value.modi$entity;
                            this.modiIds = modi$entity.map(function (ele) { return ele.id; });
                        }
                        this.loading = false;
                        return [3 /*break*/, 5];
                    case 4:
                        err_2 = _b.sent();
                        this.loading = false;
                        throw err_2;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SingleNode.prototype.clean = function () {
        this.dirty = undefined;
        this.operations = [];
        for (var child in this.children) {
            this.children[child].clean();
        }
    };
    SingleNode.prototype.getOtmFilter = function (childNode) {
        var _a;
        for (var key in this.children) {
            if (childNode === this.children[key]) {
                var sliceIdx = key.indexOf(':');
                var key2 = sliceIdx > 0 ? key.slice(0, sliceIdx) : key;
                var rel = this.judgeRelation(key2);
                (0, assert_1.assert)(rel instanceof Array);
                if (rel[1]) {
                    // 基于普通外键的一对多
                    return _a = {},
                        _a[rel[1]] = this.id,
                        _a;
                }
                else {
                    // 基于entity/entityId的一对多
                    return {
                        entity: this.entity,
                        entityId: this.id,
                    };
                }
            }
        }
        (0, assert_1.assert)(false);
    };
    return SingleNode;
}(Node));
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
function repairOperations(entity, schema, operations) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        function repairData(entity2, data) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _a, _b, _i, attr, rel;
                return tslib_1.__generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _a = [];
                            for (_b in data)
                                _a.push(_b);
                            _i = 0;
                            _c.label = 1;
                        case 1:
                            if (!(_i < _a.length)) return [3 /*break*/, 8];
                            attr = _a[_i];
                            rel = (0, relation_1.judgeRelation)(schema, entity2, attr);
                            if (!(rel === 2)) return [3 /*break*/, 3];
                            return [4 /*yield*/, repairOperations(attr, schema, [data[attr]])];
                        case 2:
                            _c.sent();
                            return [3 /*break*/, 7];
                        case 3:
                            if (!(typeof rel === 'string')) return [3 /*break*/, 5];
                            return [4 /*yield*/, repairOperations(rel, schema, [data[attr]])];
                        case 4:
                            _c.sent();
                            return [3 /*break*/, 7];
                        case 5:
                            if (!(rel instanceof Array)) return [3 /*break*/, 7];
                            return [4 /*yield*/, repairOperations(rel[0], schema, data[attr] instanceof Array ? data[attr] : [data[attr]])];
                        case 6:
                            _c.sent();
                            _c.label = 7;
                        case 7:
                            _i++;
                            return [3 /*break*/, 1];
                        case 8: return [2 /*return*/];
                    }
                });
            });
        }
        var operations_1, operations_1_1, operation, _a, data, data_1, data_1_1, d, e_21_1, e_22_1;
        var e_22, _b, e_21, _c;
        return tslib_1.__generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 16, 17, 18]);
                    operations_1 = tslib_1.__values(operations), operations_1_1 = operations_1.next();
                    _d.label = 1;
                case 1:
                    if (!!operations_1_1.done) return [3 /*break*/, 15];
                    operation = operations_1_1.value;
                    if (!!operation.id) return [3 /*break*/, 3];
                    _a = operation;
                    return [4 /*yield*/, generateNewId()];
                case 2:
                    _a.id = _d.sent();
                    _d.label = 3;
                case 3:
                    data = operation.data;
                    if (!(data instanceof Array)) return [3 /*break*/, 12];
                    _d.label = 4;
                case 4:
                    _d.trys.push([4, 9, 10, 11]);
                    data_1 = (e_21 = void 0, tslib_1.__values(data)), data_1_1 = data_1.next();
                    _d.label = 5;
                case 5:
                    if (!!data_1_1.done) return [3 /*break*/, 8];
                    d = data_1_1.value;
                    return [4 /*yield*/, repairData(entity, d)];
                case 6:
                    _d.sent();
                    _d.label = 7;
                case 7:
                    data_1_1 = data_1.next();
                    return [3 /*break*/, 5];
                case 8: return [3 /*break*/, 11];
                case 9:
                    e_21_1 = _d.sent();
                    e_21 = { error: e_21_1 };
                    return [3 /*break*/, 11];
                case 10:
                    try {
                        if (data_1_1 && !data_1_1.done && (_c = data_1.return)) _c.call(data_1);
                    }
                    finally { if (e_21) throw e_21.error; }
                    return [7 /*endfinally*/];
                case 11: return [3 /*break*/, 14];
                case 12: return [4 /*yield*/, repairData(entity, data)];
                case 13:
                    _d.sent();
                    _d.label = 14;
                case 14:
                    operations_1_1 = operations_1.next();
                    return [3 /*break*/, 1];
                case 15: return [3 /*break*/, 18];
                case 16:
                    e_22_1 = _d.sent();
                    e_22 = { error: e_22_1 };
                    return [3 /*break*/, 18];
                case 17:
                    try {
                        if (operations_1_1 && !operations_1_1.done && (_b = operations_1.return)) _b.call(operations_1);
                    }
                    finally { if (e_22) throw e_22.error; }
                    return [7 /*endfinally*/];
                case 18: return [2 /*return*/];
            }
        });
    });
}
var RunningTree = /** @class */ (function (_super) {
    tslib_1.__extends(RunningTree, _super);
    function RunningTree(aspectWrapper, cache, schema) {
        var _this = _super.call(this, aspectWrapper) || this;
        _this.cache = cache;
        _this.schema = schema;
        _this.root = {};
        return _this;
    }
    RunningTree.prototype.createNode = function (options) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var entity, pagination, fullPath, filters, sorters, projection, isList, isPicker, id, node, _a, parent, path, parentNode, projectionShape, _b;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        entity = options.entity, pagination = options.pagination, fullPath = options.path, filters = options.filters, sorters = options.sorters, projection = options.projection, isList = options.isList, isPicker = options.isPicker, id = options.id;
                        _a = analyzePath(fullPath), parent = _a.parent, path = _a.path;
                        parentNode = parent ? this.findNode(parent) : undefined;
                        if (!(typeof projection === 'function')) return [3 /*break*/, 2];
                        return [4 /*yield*/, projection()];
                    case 1:
                        _b = _c.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _b = projection;
                        _c.label = 3;
                    case 3:
                        projectionShape = _b;
                        if (isList) {
                            node = new ListNode(entity, this.schema, this.cache, projection, projectionShape, parentNode, filters, sorters, pagination);
                        }
                        else {
                            node = new SingleNode(entity, this.schema, this.cache, projection, projectionShape, parentNode);
                        }
                        if (parentNode) {
                            parentNode.addChild(path, node);
                        }
                        else {
                            (0, assert_1.assert)(!parent && !this.root[path]);
                            this.root[path] = node;
                        }
                        return [2 /*return*/, node];
                }
            });
        });
    };
    RunningTree.prototype.findNode = function (path) {
        if (this.root[path]) {
            return this.root[path];
        }
        var paths = path.split('.');
        var node = this.root[paths[0]];
        var iter = 1;
        while (iter < paths.length && node) {
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
        var value = node && node.getFreshValue();
        return value;
    };
    RunningTree.prototype.isDirty = function (path) {
        var node = this.findNode(path);
        return node ? node.isDirty() : false;
    };
    RunningTree.prototype.addOperation = function (path, operation, beforeExecute, afterExecute) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var node;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        node = this.findNode(path);
                        (0, assert_1.assert)(node);
                        return [4 /*yield*/, node.addOperation(operation, beforeExecute, afterExecute)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RunningTree.prototype.isLoading = function (path) {
        var node = this.findNode(path);
        return node.isLoading();
    };
    RunningTree.prototype.isLoadingMore = function (path) {
        var node = this.findNode(path);
        return node.isLoadingMore();
    };
    RunningTree.prototype.isExecuting = function (path) {
        var node = this.findNode(path);
        return node.isExecuting();
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
                        (0, assert_1.assert)(node instanceof SingleNode);
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
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var node;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        node = this.findNode(path);
                        (0, assert_1.assert)(node instanceof ListNode);
                        return [4 /*yield*/, node.setNamedFilters(filters, refresh)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RunningTree.prototype.addNamedFilter = function (path, filter, refresh) {
        if (refresh === void 0) { refresh = false; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var node;
            return tslib_1.__generator(this, function (_a) {
                node = this.findNode(path);
                (0, assert_1.assert)(node instanceof ListNode);
                return [2 /*return*/, node.addNamedFilter(filter, refresh)];
            });
        });
    };
    RunningTree.prototype.removeNamedFilter = function (path, filter, refresh) {
        if (refresh === void 0) { refresh = false; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var node;
            return tslib_1.__generator(this, function (_a) {
                node = this.findNode(path);
                (0, assert_1.assert)(node instanceof ListNode);
                return [2 /*return*/, node.removeNamedFilter(filter, refresh)];
            });
        });
    };
    RunningTree.prototype.removeNamedFilterByName = function (path, name, refresh) {
        if (refresh === void 0) { refresh = false; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var node;
            return tslib_1.__generator(this, function (_a) {
                node = this.findNode(path);
                (0, assert_1.assert)(node instanceof ListNode);
                return [2 /*return*/, node.removeNamedFilterByName(name, refresh)];
            });
        });
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
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var node;
            return tslib_1.__generator(this, function (_a) {
                node = this.findNode(path);
                (0, assert_1.assert)(node instanceof ListNode);
                return [2 /*return*/, node.setNamedSorters(sorters, refresh)];
            });
        });
    };
    RunningTree.prototype.addNamedSorter = function (path, sorter, refresh) {
        if (refresh === void 0) { refresh = false; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var node;
            return tslib_1.__generator(this, function (_a) {
                node = this.findNode(path);
                (0, assert_1.assert)(node instanceof ListNode);
                return [2 /*return*/, node.addNamedSorter(sorter, refresh)];
            });
        });
    };
    RunningTree.prototype.removeNamedSorter = function (path, sorter, refresh) {
        if (refresh === void 0) { refresh = false; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var node;
            return tslib_1.__generator(this, function (_a) {
                node = this.findNode(path);
                (0, assert_1.assert)(node instanceof ListNode);
                return [2 /*return*/, node.removeNamedSorter(sorter, refresh)];
            });
        });
    };
    RunningTree.prototype.removeNamedSorterByName = function (path, name, refresh) {
        if (refresh === void 0) { refresh = false; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var node;
            return tslib_1.__generator(this, function (_a) {
                node = this.findNode(path);
                (0, assert_1.assert)(node instanceof ListNode);
                return [2 /*return*/, node.removeNamedSorterByName(name, refresh)];
            });
        });
    };
    RunningTree.prototype.tryExecute = function (path) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var node, operations;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        node = this.findNode(path);
                        return [4 /*yield*/, node.composeOperations()];
                    case 1:
                        operations = _a.sent();
                        if (!operations) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.cache.tryRedoOperations(node.getEntity(), operations)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3: return [2 /*return*/, false];
                }
            });
        });
    };
    RunningTree.prototype.execute = function (path) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var node, operations, err_3;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        node = this.findNode(path);
                        (0, assert_1.assert)(node.isDirty());
                        node.setExecuting(true);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, node.doBeforeTrigger()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, node.composeOperations()];
                    case 3:
                        operations = _a.sent();
                        return [4 /*yield*/, this.getAspectWrapper().exec('operate', {
                                entity: node.getEntity(),
                                operation: operations.filter(function (ele) { return !!ele; }),
                            })];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, node.doAfterTrigger()];
                    case 5:
                        _a.sent();
                        // 清空缓存
                        node.clean();
                        node.setExecuting(false);
                        return [2 /*return*/, operations];
                    case 6:
                        err_3 = _a.sent();
                        node.setExecuting(false);
                        throw err_3;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    RunningTree.prototype.clean = function (path) {
        var node = this.findNode(path);
        node.clean();
    };
    RunningTree.prototype.getRoot = function () {
        return this.root;
    };
    tslib_1.__decorate([
        Feature_1.Action
    ], RunningTree.prototype, "addOperation", null);
    tslib_1.__decorate([
        Feature_1.Action
    ], RunningTree.prototype, "refresh", null);
    tslib_1.__decorate([
        Feature_1.Action
    ], RunningTree.prototype, "loadMore", null);
    tslib_1.__decorate([
        Feature_1.Action
    ], RunningTree.prototype, "setId", null);
    tslib_1.__decorate([
        Feature_1.Action
    ], RunningTree.prototype, "setPageSize", null);
    tslib_1.__decorate([
        Feature_1.Action
    ], RunningTree.prototype, "setCurrentPage", null);
    tslib_1.__decorate([
        Feature_1.Action
    ], RunningTree.prototype, "setNamedFilters", null);
    tslib_1.__decorate([
        Feature_1.Action
    ], RunningTree.prototype, "addNamedFilter", null);
    tslib_1.__decorate([
        Feature_1.Action
    ], RunningTree.prototype, "removeNamedFilter", null);
    tslib_1.__decorate([
        Feature_1.Action
    ], RunningTree.prototype, "removeNamedFilterByName", null);
    tslib_1.__decorate([
        Feature_1.Action
    ], RunningTree.prototype, "setNamedSorters", null);
    tslib_1.__decorate([
        Feature_1.Action
    ], RunningTree.prototype, "addNamedSorter", null);
    tslib_1.__decorate([
        Feature_1.Action
    ], RunningTree.prototype, "removeNamedSorter", null);
    tslib_1.__decorate([
        Feature_1.Action
    ], RunningTree.prototype, "removeNamedSorterByName", null);
    tslib_1.__decorate([
        Feature_1.Action
    ], RunningTree.prototype, "execute", null);
    tslib_1.__decorate([
        Feature_1.Action
    ], RunningTree.prototype, "clean", null);
    return RunningTree;
}(Feature_1.Feature));
exports.RunningTree = RunningTree;
