"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheStore = void 0;
var tslib_1 = require("tslib");
var TriggerExecutor_1 = require("oak-domain/lib/store/TriggerExecutor");
var oak_memory_tree_store_1 = require("oak-memory-tree-store");
var assert_1 = tslib_1.__importDefault(require("assert"));
;
var CacheStore = /** @class */ (function (_super) {
    tslib_1.__extends(CacheStore, _super);
    function CacheStore(storageSchema, contextBuilder, getFullDataFn, resetInitialDataFn) {
        var _this = _super.call(this, storageSchema) || this;
        _this.executor = new TriggerExecutor_1.TriggerExecutor(function () { return tslib_1.__awaiter(_this, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
            return [2 /*return*/, contextBuilder()(this)];
        }); }); });
        _this.getFullDataFn = getFullDataFn;
        _this.resetInitialDataFn = resetInitialDataFn;
        return _this;
    }
    CacheStore.prototype.operate = function (entity, operation, context, option) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var autoCommit, result, err_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        autoCommit = !context.getCurrentTxnId();
                        if (!autoCommit) return [3 /*break*/, 2];
                        return [4 /*yield*/, context.begin()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 8, , 11]);
                        if (!!option.blockTrigger) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.executor.preOperation(entity, operation, context, option)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [4 /*yield*/, _super.prototype.operate.call(this, entity, operation, context, option)];
                    case 5:
                        result = _a.sent();
                        if (!!option.blockTrigger) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.executor.postOperation(entity, operation, context, option)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [3 /*break*/, 11];
                    case 8:
                        err_1 = _a.sent();
                        if (!autoCommit) return [3 /*break*/, 10];
                        return [4 /*yield*/, context.rollback()];
                    case 9:
                        _a.sent();
                        _a.label = 10;
                    case 10: throw err_1;
                    case 11:
                        if (!autoCommit) return [3 /*break*/, 13];
                        return [4 /*yield*/, context.commit()];
                    case 12:
                        _a.sent();
                        _a.label = 13;
                    case 13: return [2 /*return*/, result];
                }
            });
        });
    };
    CacheStore.prototype.sync = function (opRecords, context) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var autoCommit, result, err_2;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        autoCommit = !context.getCurrentTxnId();
                        if (!autoCommit) return [3 /*break*/, 2];
                        return [4 /*yield*/, context.begin()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 7]);
                        return [4 /*yield*/, _super.prototype.sync.call(this, opRecords, context, {})];
                    case 3:
                        result = _a.sent();
                        return [3 /*break*/, 7];
                    case 4:
                        err_2 = _a.sent();
                        if (!autoCommit) return [3 /*break*/, 6];
                        return [4 /*yield*/, context.rollback()];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: throw err_2;
                    case 7:
                        if (!autoCommit) return [3 /*break*/, 9];
                        return [4 /*yield*/, context.commit()];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9: return [2 /*return*/, result];
                }
            });
        });
    };
    CacheStore.prototype.check = function (entity, operation, context, checkerTypes) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var action, checkers, checkers_1, checkers_1_1, checker, e_1_1;
            var e_1, _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        action = operation.action;
                        checkers = this.executor.getCheckers(entity, action, checkerTypes);
                        (0, assert_1.default)(context.getCurrentTxnId());
                        if (!checkers) return [3 /*break*/, 8];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, 7, 8]);
                        checkers_1 = tslib_1.__values(checkers), checkers_1_1 = checkers_1.next();
                        _b.label = 2;
                    case 2:
                        if (!!checkers_1_1.done) return [3 /*break*/, 5];
                        checker = checkers_1_1.value;
                        return [4 /*yield*/, checker.fn({ operation: operation }, context, {})];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        checkers_1_1 = checkers_1.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_1_1 = _b.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (checkers_1_1 && !checkers_1_1.done && (_a = checkers_1.return)) _a.call(checkers_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    CacheStore.prototype.select = function (entity, selection, context, option) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var autoCommit, result, err_3;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        autoCommit = !context.getCurrentTxnId();
                        if (!autoCommit) return [3 /*break*/, 2];
                        return [4 /*yield*/, context.begin()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 7]);
                        return [4 /*yield*/, _super.prototype.select.call(this, entity, selection, context, option)];
                    case 3:
                        result = _a.sent();
                        return [3 /*break*/, 7];
                    case 4:
                        err_3 = _a.sent();
                        if (!autoCommit) return [3 /*break*/, 6];
                        return [4 /*yield*/, context.rollback()];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: throw err_3;
                    case 7:
                        if (!autoCommit) return [3 /*break*/, 9];
                        return [4 /*yield*/, context.commit()];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9: return [2 /*return*/, result];
                }
            });
        });
    };
    CacheStore.prototype.registerChecker = function (checker) {
        this.executor.registerChecker(checker);
    };
    /**
     * 这个函数是在debug下用来获取debugStore的数据，release下不能使用
     * @returns
     */
    CacheStore.prototype.getFullData = function () {
        return this.getFullDataFn();
    };
    /**
     * 这个函数是在debug下用来初始化debugStore的数据，release下不能使用
     * @returns
     */
    CacheStore.prototype.resetInitialData = function () {
        return this.resetInitialDataFn();
    };
    return CacheStore;
}(oak_memory_tree_store_1.TreeStore));
exports.CacheStore = CacheStore;
