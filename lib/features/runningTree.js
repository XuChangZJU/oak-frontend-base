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
    currentPage: 0,
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
                var result = mergeOperation(attr, schema, from[attr], [into[attr]]);
                (0, assert_1.assert)(result);
            }
            else if (typeof rel === 'string') {
                var result = mergeOperation(rel, schema, from[attr], [into[attr]]);
                (0, assert_1.assert)(result);
            }
            else if (rel instanceof Array) {
                var _a = tslib_1.__read(rel, 1), entity2 = _a[0];
                var result = mergeOperation(entity2, schema, from[attr], [into[attr]]);
                (0, assert_1.assert)(result);
            }
            else {
                into[attr] = from[attr];
            }
        }
    }
}
function mergeOperationTrigger(from, to) {
    var _this = this;
    var be1 = from.beforeExecute, ae1 = from.afterExecute;
    var be2 = to.beforeExecute, ae2 = to.afterExecute;
    if (be1) {
        if (be2) {
            to.beforeExecute = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, be1()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, be2()];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); };
        }
        else {
            to.beforeExecute = be1;
        }
    }
    if (ae1) {
        if (ae2) {
            to.afterExecute = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, ae1()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, ae2()];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); };
        }
        else {
            to.afterExecute = ae1;
        }
    }
}
/**
 * 尝试将operation行为merge到现有的operation中去
 * @param operation
 * @param operations
 * @return 是否merge成功
 */
function mergeOperation(entity, schema, operation, operations) {
    var e_1, _a, e_2, _b, e_3, _c;
    var oper = operation.oper;
    var action = oper.action, data = oper.data;
    var idx = 0;
    var result = false;
    try {
        for (var operations_1 = tslib_1.__values(operations), operations_1_1 = operations_1.next(); !operations_1_1.done; operations_1_1 = operations_1.next()) {
            var operIter = operations_1_1.value;
            var oper2 = operIter.oper;
            if (action === oper2.action) {
                switch (action) {
                    case 'create': {
                        var data2 = oper2.data;
                        if (data2 instanceof Array) {
                            if (data instanceof Array) {
                                data2.push.apply(data2, tslib_1.__spreadArray([], tslib_1.__read(data), false));
                            }
                            else {
                                data2.push(data);
                            }
                        }
                        else {
                            var data3 = [data2];
                            if (data instanceof Array) {
                                data3.push.apply(data3, tslib_1.__spreadArray([], tslib_1.__read(data), false));
                            }
                            else {
                                data3.push(data);
                            }
                            Object.assign(oper2, {
                                data: data3,
                            });
                        }
                        // 如果需要，merge execute事件
                        mergeOperationTrigger(operation, operIter);
                        return true;
                    }
                    default: {
                        // update/remove只合并filter完全相同的项
                        var filter2 = oper2.filter, data2 = oper2.data;
                        var filter = oper.filter;
                        (0, assert_1.assert)(filter && filter2, '更新动作目前应该都有谓词条件');
                        if ((0, filter_1.same)(entity, schema, filter, filter2)) {
                            mergeOperationData(entity, schema, data, data2);
                            mergeOperationTrigger(operation, operIter);
                            return true;
                        }
                    }
                }
            }
            else {
                var data_1 = oper.data, filter = oper.filter;
                if (action === 'update' && oper2.action === 'create') {
                    // 更新刚create的数据，直接加在上面
                    var operData = oper2.data;
                    if (operData instanceof Array) {
                        try {
                            for (var operData_1 = (e_2 = void 0, tslib_1.__values(operData)), operData_1_1 = operData_1.next(); !operData_1_1.done; operData_1_1 = operData_1.next()) {
                                var operData2 = operData_1_1.value;
                                if (operData2.id === filter.id) {
                                    mergeOperationData(entity, schema, data_1, operData2);
                                    mergeOperationTrigger(operation, operIter);
                                    return true;
                                }
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (operData_1_1 && !operData_1_1.done && (_b = operData_1.return)) _b.call(operData_1);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                    }
                    else {
                        if (operData.id === filter.id) {
                            mergeOperationData(entity, schema, data_1, operData);
                            mergeOperationTrigger(operation, operIter);
                            return true;
                        }
                    }
                }
                else if (action === 'remove') {
                    if (oper2.action === 'create') {
                        // create和remove动作相抵消
                        var operData = oper2.data;
                        if (operData instanceof Array) {
                            try {
                                for (var operData_2 = (e_3 = void 0, tslib_1.__values(operData)), operData_2_1 = operData_2.next(); !operData_2_1.done; operData_2_1 = operData_2.next()) {
                                    var operData2 = operData_2_1.value;
                                    if (operData2.id === filter.id) {
                                        if (operData.length > 0) {
                                            Object.assign(operIter, {
                                                data: (0, lodash_1.pull)(operData, operData2)
                                            });
                                        }
                                        else {
                                            operations.splice(idx, 1);
                                        }
                                        result = true;
                                    }
                                }
                            }
                            catch (e_3_1) { e_3 = { error: e_3_1 }; }
                            finally {
                                try {
                                    if (operData_2_1 && !operData_2_1.done && (_c = operData_2.return)) _c.call(operData_2);
                                }
                                finally { if (e_3) throw e_3.error; }
                            }
                        }
                        else {
                            if (operData.id === filter.id) {
                                operations.splice(idx, 1);
                                result = true;
                            }
                        }
                    }
                    else {
                        // update，此时把相同id的update直接去掉
                        var operFilter = oper2.filter;
                        if ((filter === null || filter === void 0 ? void 0 : filter.id) === (operFilter === null || operFilter === void 0 ? void 0 : operFilter.id)) {
                            operations.splice(idx, 1);
                            continue; // 这里不能返回true
                        }
                    }
                }
            }
            idx++;
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (operations_1_1 && !operations_1_1.done && (_a = operations_1.return)) _a.call(operations_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return result;
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
        var e_4, _a;
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
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
        (0, assert_1.assert)(false);
    };
    ListNode.prototype.onCacheSync = function (records) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var createdIds, records_1, records_1_1, record, a, _a, e, d, id, currentIds, _b, sorter, filters, filter, value;
            var e_5, _c;
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
                        catch (e_5_1) { e_5 = { error: e_5_1 }; }
                        finally {
                            try {
                                if (records_1_1 && !records_1_1.done && (_c = records_1.return)) _c.call(records_1);
                            }
                            finally { if (e_5) throw e_5.error; }
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
        var e_6, _a;
        this.cache.unbindOnSync(this.syncHandler);
        try {
            for (var _b = tslib_1.__values(this.children), _c = _b.next(); !_c.done; _c = _b.next()) {
                var child = _c.value;
                child.destroy();
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_6) throw e_6.error; }
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
                        return [4 /*yield*/, this.refresh(0, true)];
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
                        return [4 /*yield*/, this.refresh(0, true)];
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
                        return [4 /*yield*/, this.refresh(0, true)];
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
                        return [4 /*yield*/, this.refresh(0, true)];
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
                        return [4 /*yield*/, this.refresh(0, true)];
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
                        return [4 /*yield*/, this.refresh(0, true)];
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
                        return [4 /*yield*/, this.refresh(0, true)];
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
                        return [4 /*yield*/, this.refresh(0, true)];
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
            var e_7, _d;
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
                        catch (e_7_1) { e_7 = { error: e_7_1 }; }
                        finally {
                            try {
                                if (_c && !_c.done && (_d = _b.return)) _d.call(_b);
                            }
                            finally { if (e_7) throw e_7.error; }
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
            var operation, _a, _b, _c, merged;
            var _d, _e;
            return tslib_1.__generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _d = {};
                        _b = (_a = Object).assign;
                        _c = [oper];
                        _e = {};
                        return [4 /*yield*/, generateNewId()];
                    case 1:
                        operation = (_d.oper = _b.apply(_a, _c.concat([(_e.id = _f.sent(), _e)])),
                            _d.beforeExecute = beforeExecute,
                            _d.afterExecute = afterExecute,
                            _d);
                        merged = mergeOperation(this.entity, this.schema, operation, this.operations);
                        if (!merged) {
                            this.operations.push(operation);
                        }
                        this.setDirty();
                        return [2 /*return*/];
                }
            });
        });
    };
    ListNode.prototype.composeOperations = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var childOperations, operations, childOperations_1, childOperations_1_1, oper, merged;
            var e_8, _a;
            var _this = this;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.dirty) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, Promise.all(this.children.map(function (ele) { return tslib_1.__awaiter(_this, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, ele.composeOperations()];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); }))];
                    case 1:
                        childOperations = _b.sent();
                        operations = [];
                        try {
                            for (childOperations_1 = tslib_1.__values(childOperations), childOperations_1_1 = childOperations_1.next(); !childOperations_1_1.done; childOperations_1_1 = childOperations_1.next()) {
                                oper = childOperations_1_1.value;
                                if (oper) {
                                    merged = this.operations.length > 0 && mergeOperation(this.entity, this.schema, oper[0], this.operations);
                                    if (!merged) {
                                        operations.push(oper[0]);
                                    }
                                }
                            }
                        }
                        catch (e_8_1) { e_8 = { error: e_8_1 }; }
                        finally {
                            try {
                                if (childOperations_1_1 && !childOperations_1_1.done && (_a = childOperations_1.return)) _a.call(childOperations_1);
                            }
                            finally { if (e_8) throw e_8.error; }
                        }
                        operations.push.apply(operations, tslib_1.__spreadArray([], tslib_1.__read(this.operations), false));
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
                        currentPage3 = typeof pageNumber === 'number' ? pageNumber : currentPage;
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
                        this.pagination.currentPage = currentPage;
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
        var e_9, _a;
        this.dirty = undefined;
        this.operations = [];
        try {
            for (var _b = tslib_1.__values(this.children), _c = _b.next(); !_c.done; _c = _b.next()) {
                var child = _c.value;
                child.clean();
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
            var projection, _a, modiIds, operations, result;
            var _this = this;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(typeof this.projection === 'function')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.projection()];
                    case 1:
                        _a = _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = this.projection;
                        _b.label = 3;
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
                        operations.push.apply(operations, tslib_1.__spreadArray([], tslib_1.__read(this.operations.map(function (ele) { return ({
                            entity: _this.entity,
                            operation: ele.oper,
                        }); })), false));
                        return [4 /*yield*/, this.cache.tryRedoOperationsThenSelect(this.entity, {
                                data: projection,
                                filter: {
                                    id: this.id,
                                },
                            }, operations)];
                    case 4:
                        result = (_b.sent()).result;
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    SingleNode.prototype.addOperation = function (oper, beforeExecute, afterExecute) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var operation, merged, _a, _b, _c;
            var _d;
            return tslib_1.__generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
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
                        operation = {
                            oper: oper,
                            beforeExecute: beforeExecute,
                            afterExecute: afterExecute,
                        };
                        merged = mergeOperation(this.entity, this.schema, operation, this.operations);
                        if (!!merged) return [3 /*break*/, 2];
                        (0, assert_1.assert)(this.operations.length === 0); // singleNode上的merge应该不可能失败（所有的操作都是基于id的）
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
    SingleNode.prototype.composeOperations = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var childOperations, operations, _a, _b, childOperations_2, childOperations_2_1, oper, merged;
            var _c, _d, e_10, _e;
            var _this = this;
            return tslib_1.__generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        if (!this.dirty) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, Promise.all(Object.keys(this.children).map(function (ele) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                var child, childOperations, subOper, subBe, subAe, sliceIdx, ele2;
                                var _a;
                                var _this = this;
                                return tslib_1.__generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            child = this.children[ele];
                                            return [4 /*yield*/, child.composeOperations()];
                                        case 1:
                                            childOperations = _b.sent();
                                            if (childOperations) {
                                                if (child instanceof SingleNode) {
                                                    subOper = childOperations[0].oper;
                                                    subBe = childOperations[0].beforeExecute;
                                                    subAe = childOperations[0].afterExecute;
                                                }
                                                else {
                                                    (0, assert_1.assert)(child instanceof ListNode);
                                                    subOper = childOperations.map(function (ele) { return ele.oper; });
                                                    subBe = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                                        var childOperations_3, childOperations_3_1, o, _a, e_11_1;
                                                        var e_11, _b;
                                                        return tslib_1.__generator(this, function (_c) {
                                                            switch (_c.label) {
                                                                case 0:
                                                                    _c.trys.push([0, 6, 7, 8]);
                                                                    childOperations_3 = tslib_1.__values(childOperations), childOperations_3_1 = childOperations_3.next();
                                                                    _c.label = 1;
                                                                case 1:
                                                                    if (!!childOperations_3_1.done) return [3 /*break*/, 5];
                                                                    o = childOperations_3_1.value;
                                                                    _a = o.beforeExecute;
                                                                    if (!_a) return [3 /*break*/, 3];
                                                                    return [4 /*yield*/, o.beforeExecute()];
                                                                case 2:
                                                                    _a = (_c.sent());
                                                                    _c.label = 3;
                                                                case 3:
                                                                    _a;
                                                                    _c.label = 4;
                                                                case 4:
                                                                    childOperations_3_1 = childOperations_3.next();
                                                                    return [3 /*break*/, 1];
                                                                case 5: return [3 /*break*/, 8];
                                                                case 6:
                                                                    e_11_1 = _c.sent();
                                                                    e_11 = { error: e_11_1 };
                                                                    return [3 /*break*/, 8];
                                                                case 7:
                                                                    try {
                                                                        if (childOperations_3_1 && !childOperations_3_1.done && (_b = childOperations_3.return)) _b.call(childOperations_3);
                                                                    }
                                                                    finally { if (e_11) throw e_11.error; }
                                                                    return [7 /*endfinally*/];
                                                                case 8: return [2 /*return*/];
                                                            }
                                                        });
                                                    }); };
                                                    subAe = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                                        var childOperations_4, childOperations_4_1, o, _a, e_12_1;
                                                        var e_12, _b;
                                                        return tslib_1.__generator(this, function (_c) {
                                                            switch (_c.label) {
                                                                case 0:
                                                                    _c.trys.push([0, 6, 7, 8]);
                                                                    childOperations_4 = tslib_1.__values(childOperations), childOperations_4_1 = childOperations_4.next();
                                                                    _c.label = 1;
                                                                case 1:
                                                                    if (!!childOperations_4_1.done) return [3 /*break*/, 5];
                                                                    o = childOperations_4_1.value;
                                                                    _a = o.afterExecute;
                                                                    if (!_a) return [3 /*break*/, 3];
                                                                    return [4 /*yield*/, o.afterExecute()];
                                                                case 2:
                                                                    _a = (_c.sent());
                                                                    _c.label = 3;
                                                                case 3:
                                                                    _a;
                                                                    _c.label = 4;
                                                                case 4:
                                                                    childOperations_4_1 = childOperations_4.next();
                                                                    return [3 /*break*/, 1];
                                                                case 5: return [3 /*break*/, 8];
                                                                case 6:
                                                                    e_12_1 = _c.sent();
                                                                    e_12 = { error: e_12_1 };
                                                                    return [3 /*break*/, 8];
                                                                case 7:
                                                                    try {
                                                                        if (childOperations_4_1 && !childOperations_4_1.done && (_b = childOperations_4.return)) _b.call(childOperations_4);
                                                                    }
                                                                    finally { if (e_12) throw e_12.error; }
                                                                    return [7 /*endfinally*/];
                                                                case 8: return [2 /*return*/];
                                                            }
                                                        });
                                                    }); };
                                                }
                                            }
                                            sliceIdx = ele.indexOf(':');
                                            ele2 = sliceIdx > 0 ? ele.slice(0, sliceIdx) : ele;
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
                                                    beforeExecute: subBe,
                                                    afterExecute: subAe,
                                                }];
                                    }
                                });
                            }); }))];
                    case 1:
                        childOperations = _f.sent();
                        operations = [];
                        if (!(this.operations.length > 0)) return [3 /*break*/, 2];
                        (0, assert_1.assert)(this.operations.length === 1);
                        operations.push(this.operations[0]);
                        return [3 /*break*/, 4];
                    case 2:
                        _b = (_a = operations).push;
                        _c = {};
                        _d = {};
                        return [4 /*yield*/, generateNewId()];
                    case 3:
                        _b.apply(_a, [(_c.oper = (_d.id = _f.sent(),
                                _d.action = 'update',
                                _d.data = {},
                                _d.filter = {
                                    id: this.id,
                                },
                                _d),
                                _c)]);
                        _f.label = 4;
                    case 4:
                        try {
                            for (childOperations_2 = tslib_1.__values(childOperations), childOperations_2_1 = childOperations_2.next(); !childOperations_2_1.done; childOperations_2_1 = childOperations_2.next()) {
                                oper = childOperations_2_1.value;
                                merged = mergeOperation(this.entity, this.schema, oper, operations);
                                (0, assert_1.assert)(merged); // SingleNode貌似不可能不merge成功
                            }
                        }
                        catch (e_10_1) { e_10 = { error: e_10_1 }; }
                        finally {
                            try {
                                if (childOperations_2_1 && !childOperations_2_1.done && (_e = childOperations_2.return)) _e.call(childOperations_2);
                            }
                            finally { if (e_10) throw e_10.error; }
                        }
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
                        if (isList) {
                            node.refresh();
                        }
                        else if (id) {
                            node.setId(id);
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
                        return [4 /*yield*/, node.refresh(0, true)];
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
                node = this.findNode(path);
                (0, assert_1.assert)(node instanceof ListNode);
                node.setNamedFilters(filters, refresh);
                return [2 /*return*/];
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
                node.addNamedFilter(filter, refresh);
                return [2 /*return*/];
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
                node.removeNamedFilter(filter, refresh);
                return [2 /*return*/];
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
                node.removeNamedFilterByName(name, refresh);
                return [2 /*return*/];
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
                node.setNamedSorters(sorters, refresh);
                return [2 /*return*/];
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
                node.addNamedSorter(sorter, refresh);
                return [2 /*return*/];
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
                node.removeNamedSorter(sorter, refresh);
                return [2 /*return*/];
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
                node.removeNamedSorterByName(name, refresh);
                return [2 /*return*/];
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
                        return [4 /*yield*/, this.cache.tryRedoOperations(node.getEntity(), operations.map(function (ele) { return ele.oper; }))];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    RunningTree.prototype.execute = function (path) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var node, operations, operations_2, operations_2_1, operation, _a, e_13_1, operations_3, operations_3_1, operation, _b, e_14_1, err_3;
            var e_13, _c, e_14, _d;
            return tslib_1.__generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        node = this.findNode(path);
                        if (!node.isDirty()) {
                            return [2 /*return*/];
                        }
                        node.setExecuting(true);
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 22, , 23]);
                        return [4 /*yield*/, node.composeOperations()];
                    case 2:
                        operations = _e.sent();
                        _e.label = 3;
                    case 3:
                        _e.trys.push([3, 9, 10, 11]);
                        operations_2 = tslib_1.__values(operations), operations_2_1 = operations_2.next();
                        _e.label = 4;
                    case 4:
                        if (!!operations_2_1.done) return [3 /*break*/, 8];
                        operation = operations_2_1.value;
                        _a = operation.beforeExecute;
                        if (!_a) return [3 /*break*/, 6];
                        return [4 /*yield*/, operation.beforeExecute()];
                    case 5:
                        _a = (_e.sent());
                        _e.label = 6;
                    case 6:
                        _a;
                        _e.label = 7;
                    case 7:
                        operations_2_1 = operations_2.next();
                        return [3 /*break*/, 4];
                    case 8: return [3 /*break*/, 11];
                    case 9:
                        e_13_1 = _e.sent();
                        e_13 = { error: e_13_1 };
                        return [3 /*break*/, 11];
                    case 10:
                        try {
                            if (operations_2_1 && !operations_2_1.done && (_c = operations_2.return)) _c.call(operations_2);
                        }
                        finally { if (e_13) throw e_13.error; }
                        return [7 /*endfinally*/];
                    case 11: return [4 /*yield*/, this.getAspectWrapper().exec('operate', {
                            entity: node.getEntity(),
                            operation: operations.map(function (ele) { return ele.oper; }),
                        })];
                    case 12:
                        _e.sent();
                        _e.label = 13;
                    case 13:
                        _e.trys.push([13, 19, 20, 21]);
                        operations_3 = tslib_1.__values(operations), operations_3_1 = operations_3.next();
                        _e.label = 14;
                    case 14:
                        if (!!operations_3_1.done) return [3 /*break*/, 18];
                        operation = operations_3_1.value;
                        _b = operation.afterExecute;
                        if (!_b) return [3 /*break*/, 16];
                        return [4 /*yield*/, operation.afterExecute()];
                    case 15:
                        _b = (_e.sent());
                        _e.label = 16;
                    case 16:
                        _b;
                        _e.label = 17;
                    case 17:
                        operations_3_1 = operations_3.next();
                        return [3 /*break*/, 14];
                    case 18: return [3 /*break*/, 21];
                    case 19:
                        e_14_1 = _e.sent();
                        e_14 = { error: e_14_1 };
                        return [3 /*break*/, 21];
                    case 20:
                        try {
                            if (operations_3_1 && !operations_3_1.done && (_d = operations_3.return)) _d.call(operations_3);
                        }
                        finally { if (e_14) throw e_14.error; }
                        return [7 /*endfinally*/];
                    case 21:
                        // 清空缓存
                        node.clean();
                        node.setExecuting(false);
                        return [2 /*return*/];
                    case 22:
                        err_3 = _e.sent();
                        node.setExecuting(false);
                        throw err_3;
                    case 23: return [2 /*return*/];
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
