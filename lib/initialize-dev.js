"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
var debugStore_1 = require("./debugStore");
var features_1 = require("./features");
var lodash_1 = require("oak-domain/lib/utils/lodash");
var oak_common_aspect_1 = __importDefault(require("oak-common-aspect"));
var actionDef_1 = require("oak-domain/lib/store/actionDef");
var CacheStore_1 = require("./cacheStore/CacheStore");
/**
 * dev模式下，前后端可以使用同一个Cxt，内部自己区分
 * @param storageSchema
 * @param createFeatures
 * @param contextBuilder
 * @param context
 * @param triggers
 * @param checkers
 * @param watchers
 * @param aspectDict
 * @param initialData
 * @param actionDict
 * @returns
 */
function initialize(storageSchema, createFeatures, contextBuilder, aspectDict, triggers, checkers, watchers, initialData, actionDict) {
    var _this = this;
    var intersect = (0, lodash_1.intersection)(Object.keys(oak_common_aspect_1.default), Object.keys(aspectDict));
    if (intersect.length > 0) {
        throw new Error("\u7528\u6237\u5B9A\u4E49\u7684aspect\u4E2D\u4E0D\u80FD\u548C\u7CFB\u7EDFaspect\u540C\u540D\uFF1A\u300C".concat(intersect.join(','), "\u300D"));
    }
    var aspectDict2 = Object.assign({}, oak_common_aspect_1.default, aspectDict);
    var debugStore = (0, debugStore_1.createDebugStore)(storageSchema, contextBuilder, triggers || [], checkers || [], watchers || [], initialData, actionDict);
    var cacheStore = new CacheStore_1.CacheStore(storageSchema, contextBuilder, function () { return debugStore.getCurrentData(); }, function () { return (0, debugStore_1.resetDebugStore)(debugStore, initialData || {}); });
    if (checkers) {
        checkers.forEach(function (checker) { return cacheStore.registerChecker(checker); });
    }
    if (actionDict) {
        var adCheckers = (0, actionDef_1.analyzeActionDefDict)(storageSchema, actionDict).checkers;
        adCheckers.forEach(function (checker) { return cacheStore.registerChecker(checker); });
    }
    var context = contextBuilder()(cacheStore);
    var wrapper = {
        exec: function (name, params) { return __awaiter(_this, void 0, void 0, function () {
            var str, contextBackend, result, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, context.toString()];
                    case 1:
                        str = _a.sent();
                        contextBackend = contextBuilder(str)(debugStore);
                        return [4 /*yield*/, contextBackend.begin()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 6, , 8]);
                        return [4 /*yield*/, aspectDict2[name](params, contextBackend)];
                    case 4:
                        result = _a.sent();
                        return [4 /*yield*/, contextBackend.commit()];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 6:
                        err_1 = _a.sent();
                        return [4 /*yield*/, contextBackend.rollback()];
                    case 7:
                        _a.sent();
                        throw err_1;
                    case 8: return [2 /*return*/, {
                            result: result,
                            opRecords: contextBackend.opRecords,
                        }];
                }
            });
        }); },
    };
    var basicFeatures = (0, features_1.initialize)(wrapper, storageSchema, context, cacheStore);
    // basicFeatures.runningNode.setStorageSchema(storageSchema);
    var userDefinedFeatures = createFeatures(wrapper, basicFeatures, context);
    intersect = (0, lodash_1.intersection)(Object.keys(basicFeatures), Object.keys(userDefinedFeatures));
    if (intersect.length > 0) {
        throw new Error("\u7528\u6237\u5B9A\u4E49\u7684feature\u4E2D\u4E0D\u80FD\u548C\u7CFB\u7EDFfeature\u540C\u540D\uFF1A\u300C".concat(intersect.join(','), "\u300D"));
    }
    var features = Object.assign(basicFeatures, userDefinedFeatures);
    return {
        features: features,
        context: context,
    };
}
exports.initialize = initialize;
