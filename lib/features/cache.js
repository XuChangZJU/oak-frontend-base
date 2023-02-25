"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
var tslib_1 = require("tslib");
var Feature_1 = require("../types/Feature");
var lodash_1 = require("oak-domain/lib/utils/lodash");
var Exception_1 = require("oak-domain/lib/types/Exception");
var assert_1 = tslib_1.__importDefault(require("assert"));
var Cache = /** @class */ (function (_super) {
    tslib_1.__extends(Cache, _super);
    function Cache(aspectWrapper, contextBuilder, store) {
        var _this = _super.call(this) || this;
        _this.aspectWrapper = aspectWrapper;
        _this.syncEventsCallbacks = [];
        _this.contextBuilder = contextBuilder;
        _this.cacheStore = store;
        return _this;
        // 在这里把wrapper的返回opRecords截取到并同步到cache中
        /* const { exec } = aspectWrapper;
        aspectWrapper.exec = async <T extends keyof AD>(
            name: T,
            params: any
        ) => {
            const { result, opRecords } = await exec(name, params);
            this.sync(opRecords);
            return {
                result,
                opRecords,
            };
        }; */
    }
    Cache.prototype.getSchema = function () {
        return this.cacheStore.getSchema();
    };
    Cache.prototype.exec = function (name, params, callback) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, result, opRecords, message, e_1, opRecord;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.aspectWrapper.exec(name, params)];
                    case 1:
                        _a = _b.sent(), result = _a.result, opRecords = _a.opRecords, message = _a.message;
                        callback && callback(result, opRecords);
                        if (opRecords) {
                            this.sync(opRecords);
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
                            }
                        }
                        throw e_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Cache.prototype.refresh = function (entity, selection, option, getCount, callback) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var result;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.exec('select', {
                            entity: entity,
                            selection: selection,
                            option: option,
                            getCount: getCount,
                        }, callback)];
                    case 1:
                        result = (_a.sent()).result;
                        return [2 /*return*/, result];
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
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.exec('operate', {
                            entity: entity,
                            operation: operation,
                            option: option,
                        }, callback)];
                    case 1: return [2 /*return*/, _a.sent()];
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
        this.publish();
    };
    /**
     * 前端缓存做operation只可能是测试权限，必然回滚
     * @param entity
     * @param operation
     * @returns
     */
    Cache.prototype.tryRedoOperations = function (operations) {
        var e_2, _a;
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
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (operations_1_1 && !operations_1_1.done && (_a = operations_1.return)) _a.call(operations_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            context.rollback();
            return true;
        }
        catch (err) {
            context.rollback();
            return err;
        }
    };
    Cache.prototype.checkOperation = function (entity, action, data, filter, checkerTypes) {
        var context = this.contextBuilder();
        context.begin();
        var operation = {
            action: action,
            filter: filter,
            data: data,
        };
        try {
            this.cacheStore.check(entity, operation, context, checkerTypes);
            context.rollback();
            return true;
        }
        catch (err) {
            context.rollback();
            return false;
        }
    };
    /**
     * 尝试在cache中重做一些动作，然后选择重做后的数据（为了实现modi）
     * @param entity
     * @param selection
     * @param opers
     */
    Cache.prototype.tryRedoOperationsThenSelect = function (entity, selection, opers, allowMiss) {
        var e_3, _a;
        var context = this.contextBuilder();
        context.begin();
        try {
            try {
                for (var opers_1 = tslib_1.__values(opers), opers_1_1 = opers_1.next(); !opers_1_1.done; opers_1_1 = opers_1.next()) {
                    var oper = opers_1_1.value;
                    this.cacheStore.operate(oper.entity, (0, lodash_1.cloneDeep)(oper.operation), context, {
                        dontCollect: true,
                        dontCreateOper: true,
                        blockTrigger: true,
                        dontCreateModi: true,
                    });
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (opers_1_1 && !opers_1_1.done && (_a = opers_1.return)) _a.call(opers_1);
                }
                finally { if (e_3) throw e_3.error; }
            }
            // 这个场景下要把可能刚刚delete的行返回
            var result = this.getInner(entity, selection, context, allowMiss, true);
            context.rollback();
            return result;
        }
        catch (err) {
            context.rollback();
            throw err;
        }
    };
    Cache.prototype.getInner = function (entity, selection, context, allowMiss, includedDeleted) {
        var _this = this;
        try {
            var result = this.cacheStore.select(entity, selection, context, {
                dontCollect: true,
                includedDeleted: includedDeleted || undefined,
            });
            return result;
        }
        catch (err) {
            if (err instanceof Exception_1.OakRowUnexistedException) {
                if (!allowMiss) {
                    var missedRows_1 = err.getRows();
                    this.exec('fetchRows', missedRows_1, function (result, opRecords) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                        var _a, _b, record, d, missedRows_2, missedRows_2_1, mr;
                        var e_4, _c, e_5, _d;
                        return tslib_1.__generator(this, function (_e) {
                            try {
                                // missedRows理论上一定要取到，不能为空集。否则就是程序员有遗漏
                                for (_a = tslib_1.__values(opRecords), _b = _a.next(); !_b.done; _b = _a.next()) {
                                    record = _b.value;
                                    d = record.d;
                                    (0, assert_1.default)(Object.keys(d).length > 0, '在通过fetchRow取不一致数据时返回了空数据，请拿该程序员祭天。');
                                    try {
                                        for (missedRows_2 = (e_5 = void 0, tslib_1.__values(missedRows_1)), missedRows_2_1 = missedRows_2.next(); !missedRows_2_1.done; missedRows_2_1 = missedRows_2.next()) {
                                            mr = missedRows_2_1.value;
                                            (0, assert_1.default)(Object.keys(d[mr.entity]).length > 0, "\u5728\u901A\u8FC7fetchRow\u53D6\u4E0D\u4E00\u81F4\u6570\u636E\u65F6\u8FD4\u56DE\u4E86\u7A7A\u6570\u636E\uFF0C\u8BF7\u62FF\u8BE5\u7A0B\u5E8F\u5458\u796D\u5929\u3002entity\u662F".concat(mr.entity));
                                        }
                                    }
                                    catch (e_5_1) { e_5 = { error: e_5_1 }; }
                                    finally {
                                        try {
                                            if (missedRows_2_1 && !missedRows_2_1.done && (_d = missedRows_2.return)) _d.call(missedRows_2);
                                        }
                                        finally { if (e_5) throw e_5.error; }
                                    }
                                }
                            }
                            catch (e_4_1) { e_4 = { error: e_4_1 }; }
                            finally {
                                try {
                                    if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                                }
                                finally { if (e_4) throw e_4.error; }
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
    Cache.prototype.get = function (entity, selection, allowMiss) {
        var context = this.contextBuilder();
        return this.getInner(entity, selection, context, allowMiss);
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
        return this.cacheStore.getFullData();
    };
    Cache.prototype.resetInitialData = function () {
        return this.cacheStore.resetInitialData();
    };
    return Cache;
}(Feature_1.Feature));
exports.Cache = Cache;
