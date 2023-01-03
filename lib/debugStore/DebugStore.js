"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugStore = void 0;
var tslib_1 = require("tslib");
var oak_memory_tree_store_1 = require("oak-memory-tree-store");
var TriggerExecutor_1 = require("oak-domain/lib/store/TriggerExecutor");
var assert_1 = tslib_1.__importDefault(require("assert"));
;
;
var DebugStore = /** @class */ (function (_super) {
    tslib_1.__extends(DebugStore, _super);
    function DebugStore(storageSchema, contextBuilder) {
        var _this = _super.call(this, storageSchema) || this;
        _this.executor = new TriggerExecutor_1.TriggerExecutor(function (cxtString) { return contextBuilder(cxtString)(_this); });
        return _this;
    }
    DebugStore.prototype.aggregate = function (entity, aggregation, context, option) {
        return this.aggregateAsync(entity, aggregation, context, option);
    };
    DebugStore.prototype.begin = function (option) {
        return _super.prototype.beginAsync.call(this);
    };
    DebugStore.prototype.commit = function (txnId) {
        return _super.prototype.commitAsync.call(this, txnId);
    };
    DebugStore.prototype.rollback = function (txnId) {
        return _super.prototype.rollbackAsync.call(this, txnId);
    };
    DebugStore.prototype.cascadeUpdateAsync = function (entity, operation, context, option) {
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
                    case 2: return [4 /*yield*/, _super.prototype.cascadeUpdateAsync.call(this, entity, operation, context, option)];
                    case 3:
                        result = _a.sent();
                        if (!!option.blockTrigger) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.executor.postOperation(entity, operation, context, option)];
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
            return tslib_1.__generator(this, function (_a) {
                (0, assert_1.default)(context.getCurrentTxnId());
                return [2 /*return*/, _super.prototype.operateAsync.call(this, entity, operation, context, option)];
            });
        });
    };
    DebugStore.prototype.select = function (entity, selection, context, option) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var result;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, assert_1.default)(context.getCurrentTxnId());
                        Object.assign(selection, {
                            action: 'select',
                        });
                        if (!!option.blockTrigger) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.executor.preOperation(entity, selection, context, option)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, _super.prototype.selectAsync.call(this, entity, selection, context, option)];
                    case 3:
                        result = _a.sent();
                        if (!!option.blockTrigger) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.executor.postOperation(entity, selection, context, option, result)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/, result];
                }
            });
        });
    };
    DebugStore.prototype.count = function (entity, selection, context, option) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, _super.prototype.countAsync.call(this, entity, selection, context, option)];
            });
        });
    };
    DebugStore.prototype.registerTrigger = function (trigger) {
        this.executor.registerTrigger(trigger);
    };
    DebugStore.prototype.registerChecker = function (checker) {
        this.executor.registerChecker(checker);
    };
    return DebugStore;
}(oak_memory_tree_store_1.TreeStore));
exports.DebugStore = DebugStore;
