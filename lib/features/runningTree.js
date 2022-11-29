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
var Node = /** @class */ (function (_super) {
    tslib_1.__extends(Node, _super);
    function Node(entity, schema, cache, projection, parent, path) {
        var _this = _super.call(this) || this;
        _this.entity = entity;
        _this.schema = schema;
        _this.cache = cache;
        _this.projection = projection;
        _this.parent = parent;
        _this.dirty = undefined;
        _this.loading = false;
        _this.loadingMore = false;
        _this.executing = false;
        _this.modiIds = undefined;
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
    Node.prototype.getActiveModies = function (child) {
        var childPath = this.getChildPath(child);
        if (childPath.includes(':next')) {
            var modiIds = this.modiIds;
            // 如果是需要modi的路径，在这里应该就可以返回了，目前应该不存在modi嵌套modi
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
                return modies;
            }
            return [];
        }
        var toModi = this.schema[this.entity].toModi;
        if (toModi) {
            // 如果这就是一个toModi的对象，则不用再向上查找了
            return;
        }
        if (this.parent) {
            return this.parent.getActiveModies(this);
        }
        return;
    };
    Node.prototype.setDirty = function () {
        if (!this.dirty) {
            this.dirty = true;
            if (this.parent) {
                this.parent.setDirty();
            }
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
    Node.prototype.getProjection = function () {
        return typeof this.projection === 'function' ? this.projection() : (0, lodash_1.cloneDeep)(this.projection);
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
function mergeOperationData(entity, schema, from, into) {
    var _loop_1 = function (attr) {
        var e_1, _a;
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
                /**
                 * 两个一对多的list要合并，直接合并list就可以了，前端设计上应该不可能出现两个一对多的list相交的case
                 * $extraFile$XXX:1     $extraFile$XXX:2
                 */
                // (into[attr] as unknown as ED[keyof ED]['Operation'][]).push(...(from[attr] as unknown as ED[keyof ED]['Operation'][]));
                var _b = tslib_1.__read(rel, 1), entity2_1 = _b[0];
                var mergeInner = function (item) {
                    var e_2, _a;
                    var _b = findOperationToMerge(entity2_1, schema, item, into[attr]), index = _b.index, eliminated = _b.eliminated;
                    if (!index) {
                        into[attr].push(item);
                    }
                    else {
                        var result2 = mergeOperationOper(entity2_1, schema, item, index);
                        if (result2) {
                            (0, lodash_1.pull)(into[attr], index);
                        }
                    }
                    try {
                        for (var eliminated_1 = (e_2 = void 0, tslib_1.__values(eliminated)), eliminated_1_1 = eliminated_1.next(); !eliminated_1_1.done; eliminated_1_1 = eliminated_1.next()) {
                            var eli = eliminated_1_1.value;
                            (0, lodash_1.pull)(into[attr], eli);
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (eliminated_1_1 && !eliminated_1_1.done && (_a = eliminated_1.return)) _a.call(eliminated_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                };
                if (from[attr] instanceof Array) {
                    try {
                        for (var _c = (e_1 = void 0, tslib_1.__values(from[attr])), _d = _c.next(); !_d.done; _d = _c.next()) {
                            var operation = _d.value;
                            mergeInner(operation);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                }
                else {
                    (0, assert_1.assert)(false); // 前台感觉是跑不出这个case的
                    mergeInner(from[attr]);
                }
            }
            else {
                into[attr] = from[attr];
            }
        }
    };
    for (var attr in from) {
        _loop_1(attr);
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
    var e_3, _a, e_4, _b;
    var action = from.action, data = from.data, filter = from.filter;
    var dataTo = into.data;
    if (action === 'create') {
        (0, assert_1.assert)(into.action === 'create');
        /**
         * 前端的页面设计，如果要merge两个create动作，要么都是single，要么都是array
         * 不应该出现array和single并存的case
         */
        if (dataTo instanceof Array) {
            (0, assert_1.assert)(data instanceof Array);
            data.forEach(function (ele) { return (0, assert_1.assert)(ele.id); });
            dataTo.push.apply(dataTo, tslib_1.__spreadArray([], tslib_1.__read(data), false));
        }
        else {
            (0, assert_1.assert)(!(data instanceof Array));
            mergeOperationData(entity, schema, data, dataTo);
        }
        return false;
    }
    else if (action === 'remove') {
        (0, assert_1.assert)(into.action === 'create');
        // create和remove动作相抵消
        var operData = into.data;
        if (operData instanceof Array) {
            try {
                for (var operData_1 = tslib_1.__values(operData), operData_1_1 = operData_1.next(); !operData_1_1.done; operData_1_1 = operData_1.next()) {
                    var operData2 = operData_1_1.value;
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
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (operData_1_1 && !operData_1_1.done && (_a = operData_1.return)) _a.call(operData_1);
                }
                finally { if (e_3) throw e_3.error; }
            }
        }
        else {
            // 当前action都是update
            if (operData.id === filter.id) {
                return true;
            }
        }
    }
    else {
        (0, assert_1.assert)(into.action !== 'remove');
        if (into.action === 'create') {
            var operData = into.data;
            if (operData instanceof Array) {
                try {
                    for (var operData_2 = tslib_1.__values(operData), operData_2_1 = operData_2.next(); !operData_2_1.done; operData_2_1 = operData_2.next()) {
                        var operData2 = operData_2_1.value;
                        if (operData2.id === filter.id) {
                            mergeOperationData(entity, schema, data, operData2);
                            return false;
                        }
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (operData_2_1 && !operData_2_1.done && (_b = operData_2.return)) _b.call(operData_2);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
            }
            else {
                if (operData.id === filter.id) {
                    mergeOperationData(entity, schema, data, operData);
                    return false;
                }
            }
        }
        else {
            mergeOperationData(entity, schema, data, dataTo);
            if (action !== 'update') {
                (0, assert_1.assert)(into.action === 'update' || into.action === action);
                if (process.env.NODE_ENV === 'development') {
                    console.warn("\u5408\u5E76\u4E86".concat(action, "\u5230update\u52A8\u4F5C\uFF0C\u8BF7\u786E\u8BA4\u5408\u7406\u6027"));
                }
                into.action = action;
            }
            return false;
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
    var e_5, _a, e_6, _b, e_7, _c;
    var action = from.action, filter = from.filter;
    var eliminated = [];
    if (action === 'create') {
        // action不可能和当前已经的某个动作发生merge
        return {
            index: undefined,
            eliminated: eliminated,
        };
    }
    try {
        for (var existed_1 = tslib_1.__values(existed), existed_1_1 = existed_1.next(); !existed_1_1.done; existed_1_1 = existed_1.next()) {
            var toOperation = existed_1_1.value;
            if (action === toOperation.action) {
                switch (action) {
                    case 'create': {
                        // 两个create不可能merge，如果是many to one，则不用走到这里判断
                        break;
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
                            for (var operData_3 = (e_6 = void 0, tslib_1.__values(operData)), operData_3_1 = operData_3.next(); !operData_3_1.done; operData_3_1 = operData_3.next()) {
                                var operData2 = operData_3_1.value;
                                if (operData2.id === filter.id) {
                                    return {
                                        index: toOperation,
                                        eliminated: eliminated,
                                    };
                                }
                            }
                        }
                        catch (e_6_1) { e_6 = { error: e_6_1 }; }
                        finally {
                            try {
                                if (operData_3_1 && !operData_3_1.done && (_b = operData_3.return)) _b.call(operData_3);
                            }
                            finally { if (e_6) throw e_6.error; }
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
                                for (var operData_4 = (e_7 = void 0, tslib_1.__values(operData)), operData_4_1 = operData_4.next(); !operData_4_1.done; operData_4_1 = operData_4.next()) {
                                    var operData2 = operData_4_1.value;
                                    if (operData2.id === filter.id) {
                                        return {
                                            index: toOperation,
                                            eliminated: eliminated,
                                        };
                                    }
                                }
                            }
                            catch (e_7_1) { e_7 = { error: e_7_1 }; }
                            finally {
                                try {
                                    if (operData_4_1 && !operData_4_1.done && (_c = operData_4.return)) _c.call(operData_4);
                                }
                                finally { if (e_7) throw e_7.error; }
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
    catch (e_5_1) { e_5 = { error: e_5_1 }; }
    finally {
        try {
            if (existed_1_1 && !existed_1_1.done && (_a = existed_1.return)) _a.call(existed_1);
        }
        finally { if (e_5) throw e_5.error; }
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
    var e_8, _a;
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
    var _loop_2 = function (eli) {
        var origin_2 = existed.find(function (ele) { return ele.oper === eli; });
        (0, lodash_1.pull)(existed, origin_2);
    };
    try {
        for (var eliminated_2 = tslib_1.__values(eliminated), eliminated_2_1 = eliminated_2.next(); !eliminated_2_1.done; eliminated_2_1 = eliminated_2.next()) {
            var eli = eliminated_2_1.value;
            _loop_2(eli);
        }
    }
    catch (e_8_1) { e_8 = { error: e_8_1 }; }
    finally {
        try {
            if (eliminated_2_1 && !eliminated_2_1.done && (_a = eliminated_2.return)) _a.call(eliminated_2);
        }
        finally { if (e_8) throw e_8.error; }
    }
    return !!index;
}
var ListNode = /** @class */ (function (_super) {
    tslib_1.__extends(ListNode, _super);
    function ListNode(entity, schema, cache, projection, parent, path, filters, sorters, pagination) {
        var _this = _super.call(this, entity, schema, cache, projection, parent, path) || this;
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
        var e_9, _a;
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
        catch (e_9_1) { e_9 = { error: e_9_1 }; }
        finally {
            try {
                if (records_1_1 && !records_1_1.done && (_a = records_1.return)) _a.call(records_1);
            }
            finally { if (e_9) throw e_9.error; }
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
            var result = this.cache.get(this.getEntity(), {
                data: {
                    id: 1,
                },
                filter: filter,
                sorter: sorter
            });
            this.ids = result.map(function (ele) { return ele.id; });
            // 此时有可能原来的children上的id发生了变化
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
    ListNode.prototype.setPagination = function (pagination) {
        var newPagination = Object.assign(this.pagination, pagination);
        this.pagination = newPagination;
        this.refresh();
    };
    ListNode.prototype.getChild = function (path) {
        return this.children[path];
    };
    ListNode.prototype.getChildren = function () {
        return this.children;
    };
    ListNode.prototype.addChild = function (path, node) {
        (0, assert_1.assert)(!this.children[path]);
        (0, assert_1.assert)(path.length > 10, 'List的path改成了id');
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
    ListNode.prototype.getFreshValue = function () {
        var _this = this;
        // 在createOperation中的数据也是要返回的
        var createdIds = [];
        for (var k in this.updates) {
            var operation = this.updates[k].operation;
            if (operation.action === 'create') {
                var data = operation.data;
                (0, assert_1.assert)(!(data instanceof Array));
                createdIds.push(data.id);
            }
        }
        // 如果本结点是在modi路径上，需要将modi更新之后再得到后项
        var modies = this.parent && this.parent.getActiveModies(this);
        var operations = modies ? (0, modi_1.createOperationsFromModies)(modies) : [];
        operations.push.apply(operations, tslib_1.__spreadArray([], tslib_1.__read(Object.keys(this.updates).map(function (ele) { return ({
            entity: _this.entity,
            operation: _this.updates[ele].operation,
        }); })), false));
        // 如果有modi，则不能以ids作为当前对象，需要向上层获得filter应用了modi之后再找过
        var selection = this.constructSelection(true);
        if (selection.validParentFilter || createdIds.length > 0) {
            if (undefined === modies) {
                Object.assign(selection, {
                    filter: {
                        id: {
                            $in: createdIds.concat(this.ids || []),
                        }
                    }
                });
            }
            else if (createdIds.length > 0) {
                var filter = selection.filter;
                Object.assign(selection, {
                    filter: (0, filter_1.combineFilters)([filter, { id: { $in: createdIds } }].filter(function (ele) { return !!ele; }), true),
                });
            }
            var result = this.cache.tryRedoOperationsThenSelect(this.entity, selection, operations, this.isLoading() || this.isLoadingMore());
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
        if (this.updates[id] && this.updates[id].operation.action === 'create') {
            // 如果是新增项，在这里抵消
            (0, lodash_1.unset)(this.updates, id);
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
    /**
     * 目前只支持根据itemId进行更新
     * @param data
     * @param id
     * @param beforeExecute
     * @param afterExecute
     */
    ListNode.prototype.updateItem = function (data, id, action, beforeExecute, afterExecute) {
        (0, assert_1.assert)(Object.keys(this.children).length === 0, "\u66F4\u65B0\u5B50\u7ED3\u70B9\u5E94\u8BE5\u843D\u5728\u76F8\u5E94\u7684component\u4E0A");
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
        var _this = this;
        if (!this.dirty) {
            return;
        }
        var childOperations = {};
        for (var id in this.children) {
            var childOperation = this.children[id].composeOperations();
            if (childOperation) {
                (0, assert_1.assert)(childOperation.length === 1);
                childOperations[id] = childOperation[0].operation;
            }
        }
        var operations = [];
        for (var id in this.updates) {
            var operation = (0, lodash_1.cloneDeep)(this.updates[id].operation);
            if (childOperations[id]) {
                var childOperation = childOperations[id];
                // 在list有operation在singleNode上也有目前只允许一种情况，即list上create，在single上update
                (0, assert_1.assert)(operation.action === 'create' && childOperation.action === 'update');
                Object.assign(operation.data, childOperation.data);
                (0, lodash_1.unset)(childOperations, id);
            }
            operations.push(operation);
        }
        operations.push.apply(operations, tslib_1.__spreadArray([], tslib_1.__read(Object.values(childOperations)), false));
        return operations.map(function (ele) { return Object.assign({
            operation: ele,
            entity: _this.entity,
        }); });
    };
    ListNode.prototype.getProjection = function () {
        var projection = _super.prototype.getProjection.call(this);
        // List必须自主决定Projection
        /* if (this.children.length > 0) {
            const subProjection = await this.children[0].getProjection();
            return merge(projection, subProjection);
        } */
        return projection;
    };
    ListNode.prototype.constructSelection = function (withParent) {
        var _a = this, filters = _a.filters, sorters = _a.sorters;
        var data = this.getProjection();
        var validParentFilter = true;
        (0, assert_1.assert)(data, "取数据时找不到projection信息");
        var sorterArr = sorters.map(function (ele) {
            var sorter = ele.sorter;
            if (typeof sorter === 'function') {
                return sorter();
            }
            return sorter;
        }).filter(function (ele) { return !!ele; });
        var filterArr = filters.map(function (ele) {
            var filter = ele.filter;
            if (typeof filter === 'function') {
                return filter();
            }
            return filter;
        });
        if (withParent && this.parent) {
            if (this.parent instanceof SingleNode) {
                var filterOfParent = this.parent.getParentFilter(this);
                if (filterOfParent) {
                    filterArr.push(filterOfParent);
                }
                else {
                    // 说明有父结点但是却没有相应的约束，此时不应该去refresh(是一个insert动作)
                    validParentFilter = false;
                }
            }
        }
        var filters2 = filterArr.filter(function (ele) { return !!ele; });
        var filter = filters2.length > 0 ? (0, filter_1.combineFilters)(filters2) : {};
        return {
            data: data,
            filter: filter,
            sorter: sorterArr,
            validParentFilter: validParentFilter,
        };
    };
    ListNode.prototype.refresh = function (pageNumber, getCount, append) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, entity, pagination, currentPage, pageSize, currentPage3, _b, projection, filter, sorter, validParentFilter, err_1;
            var _this = this;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this, entity = _a.entity, pagination = _a.pagination;
                        currentPage = pagination.currentPage, pageSize = pagination.pageSize;
                        currentPage3 = typeof pageNumber === 'number' ? pageNumber - 1 : currentPage - 1;
                        _b = this.constructSelection(true), projection = _b.data, filter = _b.filter, sorter = _b.sorter, validParentFilter = _b.validParentFilter;
                        (0, assert_1.assert)(projection, "\u9875\u9762\u6CA1\u6709\u5B9A\u4E49\u6295\u5F71\u300CListNode, ".concat(this.entity, "\u300D"));
                        if (!validParentFilter) return [3 /*break*/, 4];
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
    return ListNode;
}(Node));
var SingleNode = /** @class */ (function (_super) {
    tslib_1.__extends(SingleNode, _super);
    function SingleNode(entity, schema, cache, projection, parent, path, id) {
        var _this = _super.call(this, entity, schema, cache, projection, parent, path) || this;
        _this.children = {};
        if (id) {
            _this.id = id;
        }
        else {
            // 若没有父结点上的filter，则一定是create动作
            var filter = _this.tryGetParentFilter();
            if (!filter) {
                _this.create({});
            }
        }
        return _this;
    }
    SingleNode.prototype.tryGetParentFilter = function () {
        var parent = this.getParent();
        if (parent instanceof SingleNode) {
            var filter = parent.getParentFilter(this);
            return filter;
        }
        else if (parent instanceof ListNode) {
            return parent.getParentFilter(this);
        }
    };
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
        this.id = id;
        this.refresh();
    };
    SingleNode.prototype.unsetId = function () {
        this.id = undefined;
        this.publish();
    };
    // 最好用getFreshValue取值
    SingleNode.prototype.getId = function () {
        if (this.id) {
            return this.id;
        }
        var value = this.getFreshValue();
        return value === null || value === void 0 ? void 0 : value.id;
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
    SingleNode.prototype.getFreshValue = function (disableOperation) {
        var projection = this.getProjection(false);
        // 如果本结点是在modi路径上，需要将modi更新之后再得到后项
        var modies = this.parent && this.parent.getActiveModies(this);
        var operations = modies ? (0, modi_1.createOperationsFromModies)(modies) : [];
        var filter = this.getFilter();
        if (filter) {
            if (!disableOperation && this.operation) {
                operations.push({
                    entity: this.entity,
                    operation: this.operation.operation,
                });
            }
            var result = this.cache.tryRedoOperationsThenSelect(this.entity, {
                data: projection,
                filter: filter,
            }, operations, this.isLoading());
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
        this.operation = {
            operation: {
                id: (0, uuid_1.generateNewId)(),
                action: 'create',
                data: Object.assign({}, data, { id: id }),
            },
            beforeExecute: beforeExecute,
            afterExecute: afterExecute,
        };
        this.setDirty();
    };
    SingleNode.prototype.update = function (data, action, beforeExecute, afterExecute) {
        if (!this.operation) {
            // 还是有可能是create
            var isCreate = !this.id && !this.tryGetParentFilter();
            var operation = isCreate ? {
                id: (0, uuid_1.generateNewId)(),
                action: 'create',
                data: Object.assign({}, data, {
                    id: (0, uuid_1.generateNewId)(),
                }),
            } : {
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
        this.setDirty();
    };
    SingleNode.prototype.remove = function (beforeExecute, afterExecute) {
        var operation = {
            id: (0, uuid_1.generateNewId)(),
            action: 'remove',
            data: {},
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
        this.setDirty();
    };
    SingleNode.prototype.composeOperations = function () {
        var _a, _b;
        if (!this.dirty) {
            return;
        }
        if (!this.operation) {
            var operation_1 = {
                id: (0, uuid_1.generateNewId)(),
                action: 'update',
                data: {},
            };
            if (this.id) {
                Object.assign(operation_1, {
                    filter: {
                        id: this.id,
                    }
                });
            }
            this.operation = {
                operation: operation_1,
            };
        }
        var operation = (0, lodash_1.cloneDeep)(this.operation.operation);
        if (this.id && !operation.filter) {
            Object.assign(operation, {
                filter: {
                    id: this.id,
                }
            });
        }
        for (var ele in this.children) {
            var child = this.children[ele];
            var childOperations = child.composeOperations();
            var sliceIdx = ele.indexOf(':');
            var ele2 = sliceIdx > 0 ? ele.slice(0, sliceIdx) : ele;
            if (childOperations) {
                if (child instanceof SingleNode) {
                    (0, assert_1.assert)(childOperations.length === 1);
                    (0, assert_1.assert)(!operation.data[ele2]); // 多对一的子结点不应该有多项
                    Object.assign(operation.data, (_a = {},
                        _a[ele2] = childOperations[0].operation,
                        _a));
                }
                else {
                    (0, assert_1.assert)(child instanceof ListNode);
                    var childOpers = childOperations.map(function (ele) { return ele.operation; });
                    if (operation.data[ele2]) {
                        (_b = operation.data[ele2]).push.apply(_b, tslib_1.__spreadArray([], tslib_1.__read(childOpers), false));
                    }
                    else {
                        operation.data[ele2] = childOpers;
                    }
                }
            }
        }
        return [{
                entity: this.entity,
                operation: operation,
            }];
    };
    SingleNode.prototype.getProjection = function (withDecendants) {
        var _a, _b, _c;
        if (this.parent && this.parent instanceof ListNode) {
            return this.parent.getProjection();
        }
        var projection = _super.prototype.getProjection.call(this);
        if (withDecendants) {
            for (var k in this.children) {
                if (k.indexOf(':') === -1) {
                    var rel = this.judgeRelation(k);
                    if (rel === 2) {
                        var subProjection = this.children[k].getProjection(true);
                        Object.assign(projection, (_a = {
                                entity: 1,
                                entityId: 1
                            },
                            _a[k] = subProjection,
                            _a));
                    }
                    else if (typeof rel === 'string') {
                        var subProjection = this.children[k].getProjection(true);
                        Object.assign(projection, (_b = {},
                            _b["".concat(k, "Id")] = 1,
                            _b[k] = subProjection,
                            _b));
                    }
                    else {
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
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var projection, filter, err_2;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        projection = this.getProjection();
                        (0, assert_1.assert)(projection, "\u9875\u9762\u6CA1\u6709\u5B9A\u4E49\u6295\u5F71\u300CSingleNode, ".concat(this.entity, "\u300D"));
                        filter = this.getFilter(true);
                        if (!filter) return [3 /*break*/, 4];
                        this.setLoading(true);
                        this.publish();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
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
                                _this.setLoading(false);
                            })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_2 = _a.sent();
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
    SingleNode.prototype.getFilter = function (disableOperation) {
        if (this.id) {
            return {
                id: this.id,
            };
        }
        if (!disableOperation && this.operation && this.operation.operation.action === 'create') {
            return {
                id: this.operation.operation.data.id,
            };
        }
        var parentFilter = this.tryGetParentFilter();
        return parentFilter;
    };
    /**
     * getParentFilter不能假设一定已经有数据，只能根据当前filter的条件去构造
     * @param childNode
     * @param disableOperation
     * @returns
     */
    SingleNode.prototype.getParentFilter = function (childNode) {
        var _a, _b, _c;
        var filter = this.getFilter(true);
        for (var key in this.children) {
            if (childNode === this.children[key]) {
                var sliceIdx = key.indexOf(':');
                var key2 = sliceIdx > 0 ? key.slice(0, sliceIdx) : key;
                // 此时如果operation中有相关的外键被设置则直接返回
                var operationData = undefined;
                if (this.operation) {
                    var _d = this.operation.operation, action = _d.action, data = _d.data;
                    if (action !== 'remove') {
                        operationData = data;
                    }
                }
                var rel = this.judgeRelation(key2);
                if (rel === 2) {
                    // 基于entity/entityId的多对一
                    if (operationData === null || operationData === void 0 ? void 0 : operationData.entityId) {
                        return {
                            id: operationData.entityId,
                        };
                    }
                    else if (filter) {
                        return {
                            id: {
                                $in: {
                                    entity: this.entity,
                                    data: {
                                        entityId: 1,
                                    },
                                    filter: (0, filter_1.addFilterSegment)(filter, {
                                        entity: childNode.getEntity(),
                                    }),
                                }
                            },
                        };
                    }
                    else {
                        return;
                    }
                }
                else if (typeof rel === 'string') {
                    if (operationData && operationData["".concat(rel, "Id")]) {
                        return {
                            id: operationData["".concat(rel, "Id")],
                        };
                    }
                    else if (filter) {
                        return {
                            id: {
                                $in: {
                                    entity: this.entity,
                                    data: (_a = {},
                                        _a["".concat(rel, "Id")] = 1,
                                        _a),
                                    filter: filter,
                                },
                            },
                        };
                    }
                    else {
                        return;
                    }
                }
                else {
                    (0, assert_1.assert)(rel instanceof Array);
                    if (filter) {
                        if (rel[1]) {
                            // 基于普通外键的一对多
                            return _b = {},
                                _b[rel[1].slice(0, rel[1].length - 2)] = filter,
                                _b;
                        }
                        else {
                            // 基于entity/entityId的一对多
                            return _c = {},
                                _c[this.entity] = filter,
                                _c;
                        }
                    }
                    else {
                        return;
                    }
                }
            }
        }
        (0, assert_1.assert)(false);
    };
    return SingleNode;
}(Node));
var VirtualNode = /** @class */ (function (_super) {
    tslib_1.__extends(VirtualNode, _super);
    function VirtualNode() {
        var _this = _super.call(this) || this;
        _this.dirty = false;
        _this.children = {};
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
        var entity = child.getEntity();
        if (child instanceof SingleNode) {
            (0, assert_1.assert)(path === entity || path.startsWith("".concat(entity, ":")), "oakPath\u300C".concat(path, "\u300D\u4E0D\u7B26\u5408\u547D\u540D\u89C4\u8303\uFF0C\u8BF7\u4EE5\u300C").concat(entity, "\u300D\u4E3A\u547D\u540D\u8D77\u59CB\u6807\u8BC6"));
        }
        else {
            (0, assert_1.assert)(path === "".concat(entity, "s") || path.startsWith("".concat(entity, "s:")), "oakPath\u300C".concat(path, "\u300D\u4E0D\u7B26\u5408\u547D\u540D\u89C4\u8303\uFF0C\u8BF7\u4EE5\u300C").concat(entity, "s\u300D\u4E3A\u547D\u540D\u8D77\u59CB\u6807\u8BC6"));
        }
        this.children[path] = child;
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
        var _a;
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
                    // 需要合并这两个子结点的动作       todo 两个子结点指向同一个对象，这种情况应当要消除
                    if (this.children[ele] instanceof SingleNode) {
                        // mergeOperationOper(this.children[ele].getEntity(), this.children[ele].getSchema(), operation[0], operationDict[idx][0]);
                    }
                    else {
                        console.warn('发生virtualNode上的list页面的动作merge，请查看');
                        (_a = operationDict[idx]).push.apply(_a, tslib_1.__spreadArray([], tslib_1.__read(operation), false));
                    }
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
        for (var ele in this.children) {
            this.children[ele].setExecuting(executing);
        }
        this.publish();
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
    function RunningTree(aspectWrapper, cache, schema) {
        var _this = _super.call(this) || this;
        _this.aspectWrapper = aspectWrapper;
        _this.cache = cache;
        _this.schema = schema;
        _this.root = {};
        return _this;
    }
    RunningTree.prototype.createNode = function (options) {
        var entity = options.entity, pagination = options.pagination, fullPath = options.path, filters = options.filters, sorters = options.sorters, projection = options.projection, isList = options.isList, id = options.id;
        var node;
        var _a = analyzePath(fullPath), parent = _a.parent, path = _a.path;
        var parentNode = parent ? this.findNode(parent) : undefined;
        if (this.findNode(fullPath)) {
            // 目前只有一种情况合法，即parentNode是list，列表中的位置移动引起的重用
            if (parentNode instanceof ListNode) {
            }
            else if (process.env.NODE_ENV === 'development') {
                console.error("\u521B\u5EFAnode\u65F6\u53D1\u73B0\u5DF2\u6709\u7ED3\u70B9\uFF0C\u4E0D\u80FD\u91CD\u7528\u3002\u300C".concat(fullPath, "\u300D"));
            }
            return this.findNode(fullPath);
        }
        if (entity) {
            if (isList) {
                (0, assert_1.assert)(!(parentNode instanceof ListNode));
                (0, assert_1.assert)(projection, "\u9875\u9762\u6CA1\u6709\u5B9A\u4E49\u6295\u5F71\u300C".concat(path, "\u300D"));
                node = new ListNode(entity, this.schema, this.cache, projection, parentNode, path, filters, sorters, pagination);
            }
            else {
                node = new SingleNode(entity, this.schema, this.cache, projection, parentNode, // 过编译
                path, id);
            }
        }
        else {
            node = new VirtualNode();
            (0, assert_1.assert)(!parentNode);
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
        var value = node && node.getFreshValue();
        return value;
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
    RunningTree.prototype.create = function (path, data, beforeExecute, afterExecute) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var node;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        node = this.findNode(path);
                        (0, assert_1.assert)(node instanceof SingleNode);
                        return [4 /*yield*/, node.create(data, beforeExecute, afterExecute)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
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
        (0, assert_1.assert)(node && (node instanceof SingleNode || node instanceof ListNode));
        return node.isLoading();
    };
    RunningTree.prototype.isLoadingMore = function (path) {
        var node = this.findNode(path);
        (0, assert_1.assert)(node && (node instanceof SingleNode || node instanceof ListNode));
        return node.isLoadingMore();
    };
    RunningTree.prototype.isExecuting = function (path) {
        var node = this.findNode(path);
        (0, assert_1.assert)(node && (node instanceof SingleNode || node instanceof ListNode));
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
                        if (!node) return [3 /*break*/, 4];
                        // 有无entity的case不创建结点
                        return [4 /*yield*/, node.refresh()];
                    case 3:
                        // 有无entity的case不创建结点
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
    RunningTree.prototype.tryExecute = function (path) {
        var node = this.findNode(path);
        var operations = node.composeOperations();
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
            var node, operations, entities, err_3;
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
                        operations = (node.composeOperations());
                        entities = (0, lodash_1.uniq)(operations.filter(function (ele) { return !!ele; }).map(function (ele) { return ele.entity; }));
                        (0, assert_1.assert)(entities.length === 1);
                        return [4 /*yield*/, this.cache.exec('operate', {
                                entity: entities[0],
                                operation: operations.filter(function (ele) { return !!ele; }).map(function (ele) { return ele.operation; }),
                            }, function () {
                                // 清空缓存
                                node.clean();
                                node.setExecuting(false);
                            })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, node.doAfterTrigger()];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, operations];
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
        node.clearSubscribes(); // 每个node只会与一个组件相关联，在list中可能会切换node与组件的关系，这里先clear掉  by Xc
        return node.subscribe(callback);
    };
    return RunningTree;
}(Feature_1.Feature));
exports.RunningTree = RunningTree;
