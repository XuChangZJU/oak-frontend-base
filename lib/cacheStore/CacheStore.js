"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheStore = void 0;
var tslib_1 = require("tslib");
var oak_memory_tree_store_1 = require("oak-memory-tree-store");
var assert_1 = tslib_1.__importDefault(require("assert"));
var CheckerExecutor_1 = tslib_1.__importDefault(require("./CheckerExecutor"));
;
var CacheStore = /** @class */ (function (_super) {
    tslib_1.__extends(CacheStore, _super);
    function CacheStore(storageSchema, getFullDataFn, resetInitialDataFn) {
        var _this = _super.call(this, storageSchema) || this;
        _this.checkerExecutor = new CheckerExecutor_1.default();
        _this.getFullDataFn = getFullDataFn;
        _this.resetInitialDataFn = resetInitialDataFn;
        return _this;
    }
    CacheStore.prototype.aggregate = function (entity, aggregation, context, option) {
        return this.aggregateSync(entity, aggregation, context, option);
    };
    CacheStore.prototype.cascadeUpdate = function (entity, operation, context, option) {
        (0, assert_1.default)(context.getCurrentTxnId());
        if (!option.blockTrigger) {
            this.checkerExecutor.check(entity, operation, context, 'before');
        }
        var result = _super.prototype.cascadeUpdate.call(this, entity, operation, context, option);
        if (!option.blockTrigger) {
            this.checkerExecutor.check(entity, operation, context, 'after');
        }
        return result;
    };
    CacheStore.prototype.operate = function (entity, operation, context, option) {
        (0, assert_1.default)(context.getCurrentTxnId());
        var result = _super.prototype.operateSync.call(this, entity, operation, context, option);
        return result;
    };
    CacheStore.prototype.sync = function (opRecords, context) {
        var autoCommit = !context.getCurrentTxnId();
        if (autoCommit) {
            context.begin();
        }
        var result;
        try {
            result = _super.prototype.sync.call(this, opRecords, context, {});
        }
        catch (err) {
            if (autoCommit) {
                context.rollback();
            }
            throw err;
        }
        if (autoCommit) {
            context.commit();
        }
        return result;
    };
    CacheStore.prototype.check = function (entity, operation, context, checkerTypes) {
        (0, assert_1.default)(context.getCurrentTxnId());
        this.checkerExecutor.check(entity, operation, context, undefined, checkerTypes);
    };
    CacheStore.prototype.select = function (entity, selection, context, option) {
        var autoCommit = !context.getCurrentTxnId();
        if (autoCommit) {
            context.begin();
        }
        var result;
        try {
            result = _super.prototype.selectSync.call(this, entity, selection, context, option);
        }
        catch (err) {
            if (autoCommit) {
                context.rollback();
            }
            throw err;
        }
        if (autoCommit) {
            context.commit();
        }
        return result;
    };
    CacheStore.prototype.registerChecker = function (checker) {
        this.checkerExecutor.registerChecker(checker);
    };
    CacheStore.prototype.registerGeneralChecker = function (type, fn) {
        this.checkerExecutor.registerGeneralChecker(type, fn);
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
    CacheStore.prototype.count = function (entity, selection, context, option) {
        var autoCommit = !context.getCurrentTxnId();
        if (autoCommit) {
            context.begin();
        }
        var result;
        try {
            result = _super.prototype.countSync.call(this, entity, selection, context, option);
        }
        catch (err) {
            if (autoCommit) {
                context.rollback();
            }
            throw err;
        }
        if (autoCommit) {
            context.commit();
        }
        return result;
    };
    CacheStore.prototype.begin = function (option) {
        return _super.prototype.beginSync.call(this);
    };
    CacheStore.prototype.commit = function (txnId) {
        return _super.prototype.commitSync.call(this, txnId);
    };
    CacheStore.prototype.rollback = function (txnId) {
        return _super.prototype.rollbackSync.call(this, txnId);
    };
    return CacheStore;
}(oak_memory_tree_store_1.TreeStore));
exports.CacheStore = CacheStore;
