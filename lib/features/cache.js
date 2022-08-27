"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
var tslib_1 = require("tslib");
var Feature_1 = require("../types/Feature");
var lodash_1 = require("oak-domain/lib/utils/lodash");
var concurrent_1 = require("oak-domain/lib/utils/concurrent");
var Cache = /** @class */ (function (_super) {
    tslib_1.__extends(Cache, _super);
    function Cache(aspectWrapper, context, cacheStore, contextBuilder) {
        var _this = _super.call(this, aspectWrapper) || this;
        _this.cacheStore = cacheStore;
        _this.context = context;
        _this.syncEventsCallbacks = [];
        _this.contextBuilder = contextBuilder;
        _this.syncLock = new concurrent_1.RWLock();
        // 在这里把wrapper的返回opRecords截取到并同步到cache中
        var exec = aspectWrapper.exec;
        aspectWrapper.exec = function (name, params) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
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
        return _this;
    }
    Cache.prototype.refresh = function (entity, selection, option, getCount) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var result;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAspectWrapper().exec('select', {
                            entity: entity,
                            selection: selection,
                            option: option,
                            getCount: getCount,
                        })];
                    case 1:
                        result = (_a.sent()).result;
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
                    case 0: return [4 /*yield*/, this.getAspectWrapper().exec('operate', {
                            entity: entity,
                            operation: operation,
                            option: option,
                        })];
                    case 1:
                        result = (_a.sent()).result;
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
                        return [4 /*yield*/, this.syncLock.acquire('X')];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.cacheStore.sync(records, context)];
                    case 2:
                        _a.sent();
                        this.syncLock.release();
                        result = this.syncEventsCallbacks.map(function (ele) { return ele(records); });
                        return [4 /*yield*/, Promise.all(result)];
                    case 3:
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
            var result, err_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.context.begin()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 5, , 7]);
                        return [4 /*yield*/, this.cacheStore.operate(entity, operation, this.context, {
                                dontCollect: true,
                                dontCreateOper: true,
                            })];
                    case 3:
                        result = _a.sent();
                        return [4 /*yield*/, this.context.rollback()];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 5:
                        err_1 = _a.sent();
                        return [4 /*yield*/, this.context.rollback()];
                    case 6:
                        _a.sent();
                        throw err_1;
                    case 7: return [2 /*return*/, result];
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
            var result, opers_1, opers_1_1, oper, e_1_1, err_2;
            var e_1, _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.context.begin()];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 13, , 15]);
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 8, 9, 10]);
                        opers_1 = tslib_1.__values(opers), opers_1_1 = opers_1.next();
                        _b.label = 4;
                    case 4:
                        if (!!opers_1_1.done) return [3 /*break*/, 7];
                        oper = opers_1_1.value;
                        return [4 /*yield*/, this.cacheStore.operate(oper.entity, oper.operation, this.context, {
                                dontCollect: true,
                                dontCreateOper: true,
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
                    case 10: return [4 /*yield*/, this.cacheStore.select(entity, selection, this.context, {
                            dontCollect: true,
                        })];
                    case 11:
                        result = _b.sent();
                        return [4 /*yield*/, this.context.rollback()];
                    case 12:
                        _b.sent();
                        return [3 /*break*/, 15];
                    case 13:
                        err_2 = _b.sent();
                        return [4 /*yield*/, this.context.rollback()];
                    case 14:
                        _b.sent();
                        throw err_2;
                    case 15: return [2 /*return*/, result];
                }
            });
        });
    };
    Cache.prototype.get = function (entity, selection, params) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var result;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.cacheStore.select(entity, selection, this.context, {})];
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
        return this.cacheStore;
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
