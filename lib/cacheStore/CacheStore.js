"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheStore = void 0;
var TriggerExecutor_1 = require("oak-domain/lib/store/TriggerExecutor");
var oak_memory_tree_store_1 = require("oak-memory-tree-store");
var CacheStore = /** @class */ (function (_super) {
    __extends(CacheStore, _super);
    function CacheStore(storageSchema, contextBuilder, getFullDataFn) {
        var _this = _super.call(this, storageSchema) || this;
        _this.executor = new TriggerExecutor_1.TriggerExecutor(function (cxtStr) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, contextBuilder(cxtStr)(this)];
        }); }); });
        _this.getFullDataFn = getFullDataFn;
        return _this;
    }
    CacheStore.prototype.operate = function (entity, operation, context, option) {
        return __awaiter(this, void 0, void 0, function () {
            var autoCommit, result, err_1;
            return __generator(this, function (_a) {
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
        return __awaiter(this, void 0, void 0, function () {
            var autoCommit, result, err_2;
            return __generator(this, function (_a) {
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
        return __awaiter(this, void 0, void 0, function () {
            var autoCommit, result, err_3;
            return __generator(this, function (_a) {
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
    return CacheStore;
}(oak_memory_tree_store_1.TreeStore));
exports.CacheStore = CacheStore;
