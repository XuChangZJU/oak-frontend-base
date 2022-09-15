"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
var tslib_1 = require("tslib");
var selection_1 = require("oak-domain/lib/store/selection");
var Feature_1 = require("../types/Feature");
var lodash_1 = require("oak-domain/lib/utils/lodash");
var concurrent_1 = require("oak-domain/lib/utils/concurrent");
var Exception_1 = require("oak-domain/lib/types/Exception");
var Cache = /** @class */ (function (_super) {
    tslib_1.__extends(Cache, _super);
    function Cache(aspectWrapper) {
        var _this = _super.call(this, aspectWrapper) || this;
        _this.syncEventsCallbacks = [];
        _this.syncLock = new concurrent_1.RWLock();
        _this.initLock = new concurrent_1.RWLock();
        _this.initLock.acquire('X');
        return _this;
    }
    /**
     * 目前context和cache会形成循环依赖，这里不太好处理，只能先让contextBuilder后注入
     * @param contextBuilder
     */
    Cache.prototype.init = function (contextBuilder, store) {
        var _this = this;
        this.contextBuilder = contextBuilder;
        this.cacheStore = store;
        // 在这里把wrapper的返回opRecords截取到并同步到cache中，因为现在init过程的更改，所以必须在这里替换，不太好的设计
        var wrapper = this.getAspectWrapper();
        var exec = wrapper.exec;
        wrapper.exec = function (name, params) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var _a, result, opRecords;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, exec(name, params)];
                    case 1:
                        _a = _b.sent(), result = _a.result, opRecords = _a.opRecords;
                        return [4 /*yield*/, this.sync(opRecords)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, {
                                result: result,
                                opRecords: opRecords,
                            }];
                }
            });
        }); };
        this.initLock.release();
    };
    Cache.prototype.refresh = function (entity, selection, option, getCount) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var result;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initLock.acquire('S')];
                    case 1:
                        _a.sent();
                        (0, selection_1.reinforceSelection)(this.cacheStore.getSchema(), entity, selection);
                        return [4 /*yield*/, this.getAspectWrapper().exec('select', {
                                entity: entity,
                                selection: selection,
                                option: option,
                                getCount: getCount,
                            })];
                    case 2:
                        result = (_a.sent()).result;
                        this.initLock.release();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    Cache.prototype.operate = function (entity, operation, option) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var result;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initLock.acquire('S')];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.getAspectWrapper().exec('operate', {
                                entity: entity,
                                operation: operation,
                                option: option,
                            })];
                    case 2:
                        result = (_a.sent()).result;
                        this.initLock.release();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    Cache.prototype.sync = function (records) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var context, result;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        context = this.contextBuilder();
                        return [4 /*yield*/, this.initLock.acquire('S')];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.syncLock.acquire('X')];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.cacheStore.sync(records, context)];
                    case 3:
                        _a.sent();
                        this.syncLock.release();
                        this.initLock.release();
                        result = this.syncEventsCallbacks.map(function (ele) { return ele(records); });
                        return [4 /*yield*/, Promise.all(result)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 前端缓存做operation只可能是测试权限，必然回滚
     * @param entity
     * @param operation
     * @param scene
     * @param commit
     * @param option
     * @returns
     */
    Cache.prototype.testOperation = function (entity, operation) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var context, err_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        context = this.contextBuilder();
                        return [4 /*yield*/, context.begin()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.initLock.acquire('S')];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 6, , 8]);
                        return [4 /*yield*/, this.cacheStore.operate(entity, operation, context, {
                                dontCollect: true,
                                dontCreateOper: true,
                            })];
                    case 4:
                        _a.sent();
                        this.initLock.release();
                        return [4 /*yield*/, context.rollback()];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 6:
                        err_1 = _a.sent();
                        this.initLock.release();
                        return [4 /*yield*/, context.rollback()];
                    case 7:
                        _a.sent();
                        throw err_1;
                    case 8: return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * 尝试在cache中重做一些动作，然后选择重做后的数据（为了实现modi）
     * @param entity
     * @param projection
     * @param opers
     */
    Cache.prototype.tryRedoOperations = function (entity, selection, opers) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var result, context, opers_1, opers_1_1, oper, e_1_1, err_2, missedRows;
            var e_1, _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        context = this.contextBuilder();
                        return [4 /*yield*/, context.begin()];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, this.initLock.acquire('S')];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 8, 9, 10]);
                        opers_1 = tslib_1.__values(opers), opers_1_1 = opers_1.next();
                        _b.label = 4;
                    case 4:
                        if (!!opers_1_1.done) return [3 /*break*/, 7];
                        oper = opers_1_1.value;
                        return [4 /*yield*/, this.cacheStore.operate(oper.entity, oper.operation, context, {
                                dontCollect: true,
                                dontCreateOper: true,
                                blockTrigger: true,
                            })];
                    case 5:
                        _b.sent();
                        _b.label = 6;
                    case 6:
                        opers_1_1 = opers_1.next();
                        return [3 /*break*/, 4];
                    case 7: return [3 /*break*/, 10];
                    case 8:
                        e_1_1 = _b.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 10];
                    case 9:
                        try {
                            if (opers_1_1 && !opers_1_1.done && (_a = opers_1.return)) _a.call(opers_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 10:
                        if (!true) return [3 /*break*/, 20];
                        _b.label = 11;
                    case 11:
                        _b.trys.push([11, 14, , 19]);
                        return [4 /*yield*/, this.cacheStore.select(entity, selection, context, {
                                dontCollect: true,
                            })];
                    case 12:
                        result = _b.sent();
                        return [4 /*yield*/, context.rollback()];
                    case 13:
                        _b.sent();
                        this.initLock.release();
                        return [2 /*return*/, result];
                    case 14:
                        err_2 = _b.sent();
                        if (!(err_2 instanceof Exception_1.OakRowUnexistedException)) return [3 /*break*/, 16];
                        missedRows = err_2.getRows();
                        return [4 /*yield*/, this.getAspectWrapper().exec('fetchRows', missedRows)];
                    case 15:
                        _b.sent();
                        return [3 /*break*/, 18];
                    case 16:
                        this.initLock.release();
                        return [4 /*yield*/, context.rollback()];
                    case 17:
                        _b.sent();
                        throw err_2;
                    case 18: return [3 /*break*/, 19];
                    case 19: return [3 /*break*/, 10];
                    case 20: return [2 /*return*/];
                }
            });
        });
    };
    Cache.prototype.get = function (entity, selection, params) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var context, result;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        context = this.contextBuilder();
                        return [4 /*yield*/, this.cacheStore.select(entity, selection, context, {})];
                    case 1:
                        result = (_a.sent()).result;
                        return [2 /*return*/, result];
                }
            });
        });
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
    tslib_1.__decorate([
        Feature_1.Action
    ], Cache.prototype, "refresh", null);
    tslib_1.__decorate([
        Feature_1.Action
    ], Cache.prototype, "operate", null);
    return Cache;
}(Feature_1.Feature));
exports.Cache = Cache;
