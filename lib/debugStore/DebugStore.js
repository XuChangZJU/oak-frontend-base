"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugStore = void 0;
var tslib_1 = require("tslib");
var oak_memory_tree_store_1 = require("oak-memory-tree-store");
var TriggerExecutor_1 = require("oak-domain/lib/store/TriggerExecutor");
var concurrent_1 = require("oak-domain/lib/utils/concurrent");
;
;
var DebugStore = /** @class */ (function (_super) {
    tslib_1.__extends(DebugStore, _super);
    function DebugStore(storageSchema, contextBuilder) {
        var _this = _super.call(this, storageSchema) || this;
        _this.executor = new TriggerExecutor_1.TriggerExecutor(function (cxtString) { return contextBuilder(cxtString)(_this); });
        _this.rwLock = new concurrent_1.RWLock();
        return _this;
    }
    DebugStore.prototype.updateAbjointRow = function (entity, operation, context, option) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var action, data, attributes, key;
            var _a;
            return tslib_1.__generator(this, function (_b) {
                action = operation.action, data = operation.data;
                if (action === 'create') {
                    attributes = this.getSchema()[entity].attributes;
                    for (key in attributes) {
                        if (data[key] === undefined) {
                            Object.assign(data, (_a = {},
                                _a[key] = null,
                                _a));
                        }
                    }
                }
                return [2 /*return*/, _super.prototype.updateAbjointRow.call(this, entity, operation, context, option)];
            });
        });
    };
    DebugStore.prototype.cascadeUpdate = function (entity, operation, context, option) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var result;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!option.blockTrigger) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.executor.preOperation(entity, operation, context, option)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        result = _super.prototype.cascadeUpdate.call(this, entity, operation, context, option);
                        if (!!option.blockTrigger) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.executor.postOperation(entity, operation, context, option)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/, result];
                }
            });
        });
    };
    DebugStore.prototype.cascadeSelect = function (entity, selection, context, option) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var selection2, result;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        selection2 = Object.assign({
                            action: 'select',
                        }, selection);
                        if (!!option.blockTrigger) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.executor.preOperation(entity, selection2, context, option)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, _super.prototype.cascadeSelect.call(this, entity, selection2, context, option)];
                    case 3:
                        result = _a.sent();
                        if (!!option.blockTrigger) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.executor.postOperation(entity, selection2, context, option, result)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/, result];
                }
            });
        });
    };
    DebugStore.prototype.operate = function (entity, operation, context, option) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var autoCommit, result, err_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!option.noLock) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.rwLock.acquire('S')];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        autoCommit = !context.getCurrentTxnId();
                        if (!autoCommit) return [3 /*break*/, 4];
                        return [4 /*yield*/, context.begin()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 9]);
                        return [4 /*yield*/, _super.prototype.operate.call(this, entity, operation, context, option)];
                    case 5:
                        result = _a.sent();
                        return [3 /*break*/, 9];
                    case 6:
                        err_1 = _a.sent();
                        if (!autoCommit) return [3 /*break*/, 8];
                        return [4 /*yield*/, context.rollback()];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8:
                        if (!option || !option.noLock) {
                            this.rwLock.release();
                        }
                        throw err_1;
                    case 9:
                        if (!autoCommit) return [3 /*break*/, 11];
                        return [4 /*yield*/, context.commit()];
                    case 10:
                        _a.sent();
                        _a.label = 11;
                    case 11:
                        if (!option || !option.noLock) {
                            this.rwLock.release();
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    DebugStore.prototype.select = function (entity, selection, context, option) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var autoCommit, result, err_2;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(!option || !option.noLock)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.rwLock.acquire('S')];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        autoCommit = !context.getCurrentTxnId();
                        if (!autoCommit) return [3 /*break*/, 4];
                        return [4 /*yield*/, context.begin()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 9]);
                        return [4 /*yield*/, _super.prototype.select.call(this, entity, selection, context, option)];
                    case 5:
                        result = _a.sent();
                        return [3 /*break*/, 9];
                    case 6:
                        err_2 = _a.sent();
                        if (!autoCommit) return [3 /*break*/, 8];
                        return [4 /*yield*/, context.rollback()];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8:
                        if (!option || !option.noLock) {
                            this.rwLock.release();
                        }
                        throw err_2;
                    case 9:
                        if (!autoCommit) return [3 /*break*/, 11];
                        return [4 /*yield*/, context.commit()];
                    case 10:
                        _a.sent();
                        _a.label = 11;
                    case 11:
                        if (!option || !option.noLock) {
                            this.rwLock.release();
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    DebugStore.prototype.registerTrigger = function (trigger) {
        this.executor.registerTrigger(trigger);
    };
    DebugStore.prototype.registerChecker = function (checker) {
        this.executor.registerChecker(checker);
    };
    DebugStore.prototype.startInitializing = function () {
        this.rwLock.acquire('X');
    };
    DebugStore.prototype.endInitializing = function () {
        this.rwLock.release();
    };
    return DebugStore;
}(oak_memory_tree_store_1.TreeStore));
exports.DebugStore = DebugStore;
