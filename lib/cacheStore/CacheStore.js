"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheStore = void 0;
var tslib_1 = require("tslib");
var TriggerExecutor_1 = require("oak-domain/lib/store/TriggerExecutor");
var oak_memory_tree_store_1 = require("oak-memory-tree-store");
var CacheStore = /** @class */ (function (_super) {
    tslib_1.__extends(CacheStore, _super);
    function CacheStore(storageSchema, contextBuilder, getFullDataFn, resetInitialDataFn) {
        var _this = _super.call(this, storageSchema) || this;
        _this.executor = new TriggerExecutor_1.TriggerExecutor(function (cxtStr) { return tslib_1.__awaiter(_this, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
            return [2 /*return*/, contextBuilder(cxtStr)(this)];
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
                        _a.trys.push([2, 6, , 8]);
                        return [4 /*yield*/, this.executor.preOperation(entity, operation, context)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, _super.prototype.operate.call(this, entity, operation, context, option)];
                    case 4:
                        result = _a.sent();
                        return [4 /*yield*/, this.executor.postOperation(entity, operation, context)];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 6:
                        err_1 = _a.sent();
                        return [4 /*yield*/, context.rollback()];
                    case 7:
                        _a.sent();
                        throw err_1;
                    case 8:
                        if (!autoCommit) return [3 /*break*/, 10];
                        return [4 /*yield*/, context.commit()];
                    case 9:
                        _a.sent();
                        _a.label = 10;
                    case 10: return [2 /*return*/, result];
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
                        _a.trys.push([2, 4, , 6]);
                        return [4 /*yield*/, _super.prototype.sync.call(this, opRecords, context)];
                    case 3:
                        result = _a.sent();
                        return [3 /*break*/, 6];
                    case 4:
                        err_2 = _a.sent();
                        return [4 /*yield*/, context.rollback()];
                    case 5:
                        _a.sent();
                        throw err_2;
                    case 6:
                        if (!autoCommit) return [3 /*break*/, 8];
                        return [4 /*yield*/, context.commit()];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8: return [2 /*return*/, result];
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
                        _a.trys.push([2, 4, , 6]);
                        return [4 /*yield*/, _super.prototype.select.call(this, entity, selection, context, option)];
                    case 3:
                        result = _a.sent();
                        return [3 /*break*/, 6];
                    case 4:
                        err_3 = _a.sent();
                        return [4 /*yield*/, context.rollback()];
                    case 5:
                        _a.sent();
                        throw err_3;
                    case 6:
                        if (!autoCommit) return [3 /*break*/, 8];
                        return [4 /*yield*/, context.commit()];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8: return [2 /*return*/, result];
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
