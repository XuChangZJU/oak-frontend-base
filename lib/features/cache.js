"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
var tslib_1 = require("tslib");
var Feature_1 = require("../types/Feature");
var lodash_1 = require("oak-domain/lib/utils/lodash");
var CacheStore_1 = require("../cacheStore/CacheStore");
var Exception_1 = require("oak-domain/lib/types/Exception");
var assert_1 = tslib_1.__importDefault(require("assert"));
var constant_1 = require("../constant/constant");
var filter_1 = require("oak-domain/lib/store/filter");
var DEFAULT_KEEP_FRESH_PERIOD = 600 * 1000; // 10分钟不刷新
;
var Cache = /** @class */ (function (_super) {
    tslib_1.__extends(Cache, _super);
    function Cache(storageSchema, aspectWrapper, frontendContextBuilder, checkers, getFullData, localStorage, savedEntities, keepFreshPeriod) {
        var _this = _super.call(this) || this;
        _this.refreshing = false;
        _this.refreshRecords = {};
        _this.aspectWrapper = aspectWrapper;
        _this.syncEventsCallbacks = [];
        _this.cacheStore = new CacheStore_1.CacheStore(storageSchema);
        _this.contextBuilder = function () { return frontendContextBuilder()(_this.cacheStore); };
        _this.savedEntities = tslib_1.__spreadArray(['actionAuth', 'i18n'], tslib_1.__read((savedEntities || [])), false);
        _this.keepFreshPeriod = keepFreshPeriod || DEFAULT_KEEP_FRESH_PERIOD;
        _this.localStorage = localStorage;
        checkers.forEach(function (checker) { return _this.cacheStore.registerChecker(checker); });
        _this.getFullDataFn = getFullData;
        _this.initSavedLogic();
        return _this;
    }
    /**
     * 处理cache中需要缓存的数据
     */
    Cache.prototype.initSavedLogic = function () {
        var _this = this;
        var data = {};
        this.savedEntities.forEach(function (entity) {
            var key = "".concat(constant_1.LOCAL_STORAGE_KEYS.cacheSaved, ":").concat(entity);
            var cached = _this.localStorage.load(key);
            if (cached) {
                data[entity] = cached;
            }
        });
        this.cacheStore.resetInitialData(data);
        this.cacheStore.onCommit(function (result) {
            var entities = Object.keys(result);
            var referenced = (0, lodash_1.intersection)(entities, _this.savedEntities);
            if (referenced.length > 0) {
                var saved_1 = _this.cacheStore.getCurrentData(referenced);
                Object.keys(saved_1).forEach(function (entity) {
                    var key = "".concat(constant_1.LOCAL_STORAGE_KEYS.cacheSaved, ":").concat(entity);
                    _this.localStorage.save(key, saved_1[entity]);
                });
            }
        });
    };
    Cache.prototype.getSchema = function () {
        return this.cacheStore.getSchema();
    };
    Cache.prototype.getCurrentUserId = function (allowUnloggedIn) {
        var context = this.contextBuilder && this.contextBuilder();
        return context === null || context === void 0 ? void 0 : context.getCurrentUserId(allowUnloggedIn);
    };
    Cache.prototype.exec = function (name, params, callback, dontPublish) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, result, opRecords, message, e_1, opRecord;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.aspectWrapper.exec(name, params)];
                    case 1:
                        _a = _b.sent(), result = _a.result, opRecords = _a.opRecords, message = _a.message;
                        this.refreshing = false;
                        if (opRecords) {
                            this.sync(opRecords);
                        }
                        callback && callback(result, opRecords);
                        if (opRecords && !dontPublish) {
                            this.publish();
                        }
                        return [2 /*return*/, {
                                result: result,
                                message: message,
                            }];
                    case 2:
                        e_1 = _b.sent();
                        // 如果是数据不一致错误，这里可以让用户知道
                        if (e_1 instanceof Exception_1.OakException) {
                            opRecord = e_1.opRecord;
                            if (opRecord) {
                                this.sync([opRecord]);
                                this.publish();
                            }
                        }
                        throw e_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Cache.prototype.getRefreshRecordSize = function () {
        var _this = this;
        var count = 0;
        Object.keys(this.refreshRecords).forEach(function (entity) { return count += Object.keys(_this.refreshRecords[entity]).length; });
        return count;
    };
    Cache.prototype.reduceRefreshRecord = function (now) {
        var _this = this;
        Object.keys(this.refreshRecords).forEach(function (ele) {
            if (!_this.savedEntities.includes(ele)) {
                var outdated = [];
                for (var filter in _this.refreshRecords[ele]) {
                    if (_this.refreshRecords[ele][filter] < now - _this.keepFreshPeriod) {
                        outdated.push(filter);
                    }
                }
                _this.refreshRecords[ele] = (0, lodash_1.omit)(_this.refreshRecords[ele], outdated);
            }
        });
    };
    Cache.prototype.addRefreshRecord = function (entity, filter, now) {
        var _a, _b, _c;
        var _this = this;
        var originTimestamp = this.refreshRecords[entity] && this.refreshRecords[entity][filter];
        if (this.refreshRecords[entity]) {
            Object.assign(this.refreshRecords[entity], (_a = {},
                _a[filter] = now,
                _a));
        }
        else {
            Object.assign(this.refreshRecords, (_b = {},
                _b[entity] = (_c = {},
                    _c[filter] = now,
                    _c),
                _b));
        }
        var count = this.getRefreshRecordSize();
        if (count > 100) {
            count = this.getRefreshRecordSize();
            this.reduceRefreshRecord(now);
            if (count > 100) {
                console.warn('cache中的refreshRecord数量过多，请检查是否因为存在带有Date.now等变量的刷新例程！', this.refreshRecords);
            }
        }
        if (originTimestamp) {
            return function () { return _this.addRefreshRecord(entity, filter, originTimestamp); };
        }
    };
    /**
     * 判定一个refresh行为是否可以应用缓存优化
     * 可以优化的selection必须满足：
     * 1）没有indexFrom和count
     * 2）没要求getCount
     * 3）查询的projection和filter只限定在该对象自身属性上
     * 4）有filter
     * @param entity
     * @param selection
     * @param option
     * @param getCount
     */
    Cache.prototype.canOptimizeRefresh = function (entity, selection, option, getCount) {
        var e_2, _a;
        var _this = this;
        if (getCount || selection.indexFrom || selection.count || selection.randomRange || !selection.filter || (option === null || option === void 0 ? void 0 : option.ignoreKeepFreshRule)) {
            return false;
        }
        var data = selection.data, filter = selection.filter, sorter = selection.sorter;
        // projection中不能有cascade查询或者表达式
        var checkProjection = function (projection) {
            for (var attr in data) {
                var rel = _this.judgeRelation(entity, attr);
                if (typeof rel !== 'number' || ![0, 1].includes(rel)) {
                    return false;
                }
            }
            return true;
        };
        if (!checkProjection(data)) {
            return false;
        }
        // filter中不能有cascade查询或者表达式
        var checkFilter = function (filter2) {
            var e_3, _a;
            for (var attr in filter2) {
                if (['$and', '$or'].includes(attr)) {
                    try {
                        for (var _b = (e_3 = void 0, tslib_1.__values(filter2[attr])), _c = _b.next(); !_c.done; _c = _b.next()) {
                            var f2 = _c.value;
                            if (!checkFilter(f2)) {
                                return false;
                            }
                        }
                    }
                    catch (e_3_1) { e_3 = { error: e_3_1 }; }
                    finally {
                        try {
                            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                        }
                        finally { if (e_3) throw e_3.error; }
                    }
                }
                else if (attr === '$not') {
                    if (!checkFilter(filter2[attr])) {
                        return false;
                    }
                }
                else if (!attr.startsWith('$') || !attr.startsWith('#')) {
                    var rel = _this.judgeRelation(entity, attr);
                    if (typeof rel !== 'number' || ![0, 1].includes(rel)) {
                        return false;
                    }
                }
            }
            return true;
        };
        if (!checkFilter(filter)) {
            return false;
        }
        if (sorter) {
            try {
                for (var sorter_1 = tslib_1.__values(sorter), sorter_1_1 = sorter_1.next(); !sorter_1_1.done; sorter_1_1 = sorter_1.next()) {
                    var s = sorter_1_1.value;
                    if (!checkProjection(s.$attr)) {
                        return false;
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (sorter_1_1 && !sorter_1_1.done && (_a = sorter_1.return)) _a.call(sorter_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
        return true;
    };
    Cache.prototype.filterToKey = function (filter) {
        return JSON.stringify(filter);
    };
    Cache.prototype.refresh = function (entity, selection, option, getCount, callback, dontPublish) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var canOptimize, now, key, undoSetRefreshRecord, filter, data, current, maxUpdateAt_1, ids, filter_2, _a, ids, count, aggr, selection2, data, err_1;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        canOptimize = this.canOptimizeRefresh(entity, selection, option, getCount);
                        now = 0, key = '';
                        if (canOptimize) {
                            filter = selection.filter;
                            (0, assert_1.default)(filter);
                            key = this.filterToKey(filter);
                            now = Date.now();
                            if (this.refreshRecords[entity] && this.refreshRecords[entity][key]) {
                                if (this.refreshRecords[entity][key] > now - this.keepFreshPeriod && this.savedEntities.includes(entity)) {
                                    // 对于savedEntities，同一查询条件不必过于频繁刷新，减少性能开销
                                    if (process.env.NODE_ENV === 'development') {
                                        // console.warn('根据keepFresh规则，省略了一次请求数据的行为', entity, selection);
                                    }
                                    data = this.get(entity, selection);
                                    return [2 /*return*/, {
                                            data: data,
                                        }];
                                }
                                else {
                                    // 对于其它entity或者是过期的savedEntity，可以加上增量条件，只检查上次查询之后有更新的数据（减少网络传输开销）
                                    if (!this.savedEntities.includes(entity) && process.env.NODE_ENV === 'development') {
                                        console.log('对象的查询可能可以被缓存，请查看代码逻辑', entity);
                                    }
                                    selection.filter = (0, filter_1.combineFilters)(entity, this.getSchema(), [selection.filter, {
                                            $$updateAt$$: {
                                                $gte: this.refreshRecords[entity][key]
                                            }
                                        }]);
                                }
                            }
                            else if (this.savedEntities.includes(entity)) {
                                current = this.get(entity, {
                                    data: {
                                        id: 1,
                                        $$updateAt$$: 1,
                                    },
                                    filter: filter,
                                });
                                if (current.length > 0) {
                                    maxUpdateAt_1 = 0;
                                    ids = current.map(function (row) {
                                        if (typeof row.$$updateAt$$ === 'number' && row.$$updateAt$$ > maxUpdateAt_1) {
                                            maxUpdateAt_1 = row.$$updateAt$$;
                                        }
                                        return row.id;
                                    });
                                    filter_2 = {
                                        $or: [
                                            {
                                                id: {
                                                    $nin: ids,
                                                },
                                            },
                                            {
                                                $$updateAt$$: {
                                                    $gte: maxUpdateAt_1,
                                                },
                                            }
                                        ],
                                    };
                                    selection.filter = (0, filter_1.combineFilters)(entity, this.getSchema(), [filter_2, selection.filter]);
                                }
                            }
                            undoSetRefreshRecord = this.addRefreshRecord(entity, key, now);
                        }
                        this.refreshing = true;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.exec('select', {
                                entity: entity,
                                selection: selection,
                                option: option,
                                getCount: getCount,
                            }, callback, dontPublish)];
                    case 2:
                        _a = (_b.sent()).result, ids = _a.ids, count = _a.count, aggr = _a.aggr;
                        if (canOptimize) {
                        }
                        selection2 = Object.assign({}, selection, {
                            filter: {
                                id: {
                                    $in: ids,
                                }
                            }
                        });
                        data = this.get(entity, selection2);
                        if (aggr) {
                            (0, lodash_1.merge)(data, aggr);
                        }
                        return [2 /*return*/, {
                                data: data,
                                count: count,
                            }];
                    case 3:
                        err_1 = _b.sent();
                        this.refreshing = false;
                        undoSetRefreshRecord && undoSetRefreshRecord();
                        throw err_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Cache.prototype.aggregate = function (entity, aggregation, option) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var result;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.aspectWrapper.exec('aggregate', {
                            entity: entity,
                            aggregation: aggregation,
                            option: option,
                        })];
                    case 1:
                        result = (_a.sent()).result;
                        return [2 /*return*/, result];
                }
            });
        });
    };
    Cache.prototype.operate = function (entity, operation, option, callback) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var result;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.refreshing = true;
                        return [4 /*yield*/, this.exec('operate', {
                                entity: entity,
                                operation: operation,
                                option: option,
                            }, callback)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    Cache.prototype.count = function (entity, selection, option, callback) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var result;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.exec('count', {
                            entity: entity,
                            selection: selection,
                            option: option,
                        }, callback)];
                    case 1:
                        result = (_a.sent()).result;
                        return [2 /*return*/, result];
                }
            });
        });
    };
    Cache.prototype.sync = function (records) {
        // sync会异步并发的调用，不能用this.context;
        var context = this.contextBuilder();
        this.cacheStore.sync(records, context);
        // 唤起同步注册的回调
        this.syncEventsCallbacks.map(function (ele) { return ele(records); });
    };
    /**
     * 前端缓存做operation只可能是测试权限，必然回滚
     * @param entity
     * @param operation
     * @returns
     */
    Cache.prototype.tryRedoOperations = function (operations) {
        var e_4, _a;
        var context = this.contextBuilder();
        context.begin();
        try {
            try {
                for (var operations_1 = tslib_1.__values(operations), operations_1_1 = operations_1.next(); !operations_1_1.done; operations_1_1 = operations_1.next()) {
                    var oper = operations_1_1.value;
                    var entity = oper.entity, operation = oper.operation;
                    this.cacheStore.operate(entity, operation, context, {
                        dontCollect: true,
                        dontCreateOper: true,
                        dontCreateModi: true,
                    });
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (operations_1_1 && !operations_1_1.done && (_a = operations_1.return)) _a.call(operations_1);
                }
                finally { if (e_4) throw e_4.error; }
            }
            context.rollback();
            return true;
        }
        catch (err) {
            context.rollback();
            if (!(err instanceof Exception_1.OakUserException)) {
                throw err;
            }
            return err;
        }
    };
    Cache.prototype.checkOperation = function (entity, action, data, filter, checkerTypes) {
        var context = this.contextBuilder();
        context.begin();
        var operation = {
            action: action,
            filter: filter,
            data: data
        };
        try {
            this.cacheStore.check(entity, operation, context, checkerTypes);
            context.rollback();
            return true;
        }
        catch (err) {
            context.rollback();
            if (!(err instanceof Exception_1.OakUserException)) {
                throw err;
            }
            return false;
        }
    };
    Cache.prototype.redoOperation = function (opers, context) {
        var _this = this;
        opers.forEach(function (oper) {
            var entity = oper.entity, operation = oper.operation;
            _this.cacheStore.operate(entity, operation, context, {
                dontCollect: true,
                dontCreateOper: true,
                blockTrigger: true,
                dontCreateModi: true,
            });
        });
        return;
    };
    Cache.prototype.getInner = function (entity, selection, context, allowMiss) {
        var _this = this;
        try {
            var result = this.cacheStore.select(entity, selection, context, {
                dontCollect: true,
                includedDeleted: true,
            });
            return result;
        }
        catch (err) {
            if (err instanceof Exception_1.OakRowUnexistedException) {
                if (!this.refreshing && !allowMiss) {
                    var missedRows_1 = err.getRows();
                    this.refreshing = true;
                    this.exec('fetchRows', missedRows_1, function (result, opRecords) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                        var _a, _b, record, d, missedRows_2, missedRows_2_1, mr;
                        var e_5, _c, e_6, _d;
                        return tslib_1.__generator(this, function (_e) {
                            try {
                                // missedRows理论上一定要取到，不能为空集。否则就是程序员有遗漏
                                for (_a = tslib_1.__values(opRecords), _b = _a.next(); !_b.done; _b = _a.next()) {
                                    record = _b.value;
                                    d = record.d;
                                    (0, assert_1.default)(Object.keys(d).length > 0, '在通过fetchRow取不一致数据时返回了空数据，请拿该程序员祭天。');
                                    try {
                                        for (missedRows_2 = (e_6 = void 0, tslib_1.__values(missedRows_1)), missedRows_2_1 = missedRows_2.next(); !missedRows_2_1.done; missedRows_2_1 = missedRows_2.next()) {
                                            mr = missedRows_2_1.value;
                                            (0, assert_1.default)(Object.keys(d[mr.entity]).length > 0, "\u5728\u901A\u8FC7fetchRow\u53D6\u4E0D\u4E00\u81F4\u6570\u636E\u65F6\u8FD4\u56DE\u4E86\u7A7A\u6570\u636E\uFF0C\u8BF7\u62FF\u8BE5\u7A0B\u5E8F\u5458\u796D\u5929\u3002entity\u662F".concat(mr.entity));
                                        }
                                    }
                                    catch (e_6_1) { e_6 = { error: e_6_1 }; }
                                    finally {
                                        try {
                                            if (missedRows_2_1 && !missedRows_2_1.done && (_d = missedRows_2.return)) _d.call(missedRows_2);
                                        }
                                        finally { if (e_6) throw e_6.error; }
                                    }
                                }
                            }
                            catch (e_5_1) { e_5 = { error: e_5_1 }; }
                            finally {
                                try {
                                    if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                                }
                                finally { if (e_5) throw e_5.error; }
                            }
                            return [2 /*return*/];
                        });
                    }); });
                }
                return [];
            }
            else {
                throw err;
            }
        }
    };
    Cache.prototype.get = function (entity, selection, context, allowMiss) {
        var context2 = context || this.contextBuilder();
        return this.getInner(entity, selection, context2, allowMiss);
    };
    Cache.prototype.judgeRelation = function (entity, attr) {
        return this.cacheStore.judgeRelation(entity, attr);
    };
    Cache.prototype.bindOnSync = function (callback) {
        this.syncEventsCallbacks.push(callback);
    };
    Cache.prototype.unbindOnSync = function (callback) {
        (0, lodash_1.pull)(this.syncEventsCallbacks, callback);
    };
    Cache.prototype.getCachedData = function () {
        return this.cacheStore.getCurrentData();
    };
    Cache.prototype.getFullData = function () {
        return this.getFullDataFn();
    };
    Cache.prototype.begin = function () {
        var context = this.contextBuilder();
        context.begin();
        return context;
    };
    Cache.prototype.commit = function (context) {
        context.commit();
    };
    Cache.prototype.rollback = function (context) {
        context.rollback();
    };
    return Cache;
}(Feature_1.Feature));
exports.Cache = Cache;
