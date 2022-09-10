"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
var tslib_1 = require("tslib");
var features_1 = require("./features");
var lodash_1 = require("oak-domain/lib/utils/lodash");
var actionDef_1 = require("oak-domain/lib/store/actionDef");
var CacheStore_1 = require("./cacheStore/CacheStore");
var checkers_1 = require("oak-domain/lib/checkers");
function makeContentTypeAndBody(data) {
    return {
        contentType: 'application/json',
        body: JSON.stringify(data),
    };
}
/**
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
function initialize(storageSchema, createFeatures, contextBuilder, connector, checkers, actionDict) {
    var _this = this;
    var cacheStore = new CacheStore_1.CacheStore(storageSchema, contextBuilder);
    var checkers2 = (0, checkers_1.createDynamicCheckers)(storageSchema).concat(checkers || []);
    checkers2.forEach(function (checker) { return cacheStore.registerChecker(checker); });
    if (actionDict) {
        var adCheckers = (0, actionDef_1.analyzeActionDefDict)(storageSchema, actionDict).checkers;
        adCheckers.forEach(function (checker) { return cacheStore.registerChecker(checker); });
    }
    var context = contextBuilder()(cacheStore);
    var wrapper = {
        exec: function (name, params) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var _a, result, opRecords;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, connector.callAspect(name, params, context)];
                    case 1:
                        _a = _b.sent(), result = _a.result, opRecords = _a.opRecords;
                        return [2 /*return*/, {
                                result: result,
                                opRecords: opRecords,
                            }];
                }
            });
        }); },
    };
    var basicFeatures = (0, features_1.initialize)(wrapper, storageSchema, context, cacheStore, function () { return contextBuilder()(cacheStore); });
    // basicFeatures.runningNode.setStorageSchema(storageSchema);
    var userDefinedfeatures = createFeatures(wrapper, basicFeatures, context);
    var intersect = (0, lodash_1.intersection)(Object.keys(basicFeatures), Object.keys(userDefinedfeatures));
    if (intersect.length > 0) {
        throw new Error("\u7528\u6237\u5B9A\u4E49\u7684feature\u4E2D\u4E0D\u80FD\u548C\u7CFB\u7EDFfeature\u540C\u540D\uFF1A\u300C".concat(intersect.join(','), "\u300D"));
    }
    var features = Object.assign(basicFeatures, userDefinedfeatures);
    return {
        features: features,
        context: context,
    };
}
exports.initialize = initialize;
