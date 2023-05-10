"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugStore = void 0;
var tslib_1 = require("tslib");
var oak_memory_tree_store_1 = require("oak-memory-tree-store");
var TriggerExecutor_1 = require("oak-domain/lib/store/TriggerExecutor");
var assert_1 = tslib_1.__importDefault(require("assert"));
var RelationAuth_1 = require("oak-domain/lib/store/RelationAuth");
;
;
var DebugStore = /** @class */ (function (_super) {
    tslib_1.__extends(DebugStore, _super);
    function DebugStore(storageSchema, contextBuilder, actionCascadeGraph, relationCascadeGraph, authDeduceRelationMap) {
        var _this = _super.call(this, storageSchema) || this;
        _this.executor = new TriggerExecutor_1.TriggerExecutor(function (cxtString) { return contextBuilder(cxtString)(_this); });
        _this.relationAuth = new RelationAuth_1.RelationAuth(storageSchema, actionCascadeGraph, relationCascadeGraph, authDeduceRelationMap);
        _this.initRelationAuthTriggers(contextBuilder);
        return _this;
    }
    /**
     * relationAuth中需要缓存一些维表的数据
     */
    DebugStore.prototype.initRelationAuthTriggers = function (contextBuilder) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var context, directActionAuths, freeActionAuths, triggers;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, contextBuilder()(this)];
                    case 1:
                        context = _a.sent();
                        return [4 /*yield*/, context.begin()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.select('directActionAuth', {
                                data: {
                                    id: 1,
                                    sourceEntity: 1,
                                    path: 1,
                                    deActions: 1,
                                    destEntity: 1,
                                },
                            }, context, {
                                dontCollect: true,
                            })];
                    case 3:
                        directActionAuths = _a.sent();
                        this.relationAuth.setDirectionActionAuths(directActionAuths);
                        return [4 /*yield*/, this.select('freeActionAuth', {
                                data: {
                                    id: 1,
                                    deActions: 1,
                                    destEntity: 1,
                                },
                            }, context, {
                                dontCollect: true,
                            })];
                    case 4:
                        freeActionAuths = _a.sent();
                        this.relationAuth.setFreeActionAuths(freeActionAuths);
                        return [4 /*yield*/, context.commit()];
                    case 5:
                        _a.sent();
                        triggers = this.relationAuth.getAuthDataTriggers();
                        triggers.forEach(function (trigger) { return _this.registerTrigger(trigger); });
                        return [2 /*return*/];
                }
            });
        });
    };
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
                    case 2: return [4 /*yield*/, this.relationAuth.checkRelationAsync(entity, operation, context)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, _super.prototype.cascadeUpdateAsync.call(this, entity, operation, context, option)];
                    case 4:
                        result = _a.sent();
                        if (!!option.blockTrigger) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.executor.postOperation(entity, operation, context, option)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [2 /*return*/, result];
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
                    case 2: return [4 /*yield*/, this.relationAuth.checkRelationAsync(entity, selection, context)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, _super.prototype.selectAsync.call(this, entity, selection, context, option)];
                    case 4:
                        result = _a.sent();
                        if (!!option.blockTrigger) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.executor.postOperation(entity, selection, context, option, result)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [2 /*return*/, result];
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
