"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
var tslib_1 = require("tslib");
var index_1 = require("oak-domain/lib/checkers/index");
var index_2 = require("oak-domain/lib/triggers/index");
var debugStore_1 = require("./debugStore");
var features_1 = require("./features");
var lodash_1 = require("oak-domain/lib/utils/lodash");
var oak_common_aspect_1 = tslib_1.__importDefault(require("oak-common-aspect"));
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
    var checkers2 = (0, index_1.createDynamicCheckers)(storageSchema).concat(checkers || []);
    var triggers2 = (0, index_2.createDynamicTriggers)(storageSchema).concat(triggers || []);
    var debugStore = (0, debugStore_1.createDebugStore)(storageSchema, contextBuilder, triggers2, checkers2, watchers || [], initialData, actionDict);
    var cacheStore = new CacheStore_1.CacheStore(storageSchema, contextBuilder, function () { return debugStore.getCurrentData(); }, function () { return (0, debugStore_1.clearMaterializedData)(); });
    checkers2.forEach(function (checker) { return cacheStore.registerChecker(checker); });
    if (actionDict) {
        var adCheckers = (0, actionDef_1.analyzeActionDefDict)(storageSchema, actionDict).checkers;
        adCheckers.forEach(function (checker) { return cacheStore.registerChecker(checker); });
    }
    var context = contextBuilder()(cacheStore);
    var wrapper = {
        exec: function (name, params) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var str, contextBackend, result, err_1;
            return tslib_1.__generator(this, function (_a) {
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
    var basicFeatures = (0, features_1.initialize)(wrapper, storageSchema, context, cacheStore, function () { return contextBuilder()(cacheStore); });
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
