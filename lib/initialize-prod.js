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
function initialize(storageSchema, createFeatures, frontendContextBuilder, connector, checkers, actionDict) {
    var _this = this;
    var checkers2 = (0, checkers_1.createDynamicCheckers)(storageSchema).concat(checkers || []);
    var wrapper = {};
    var basicFeatures = (0, features_1.initialize)(wrapper, storageSchema);
    var userDefinedfeatures = createFeatures(wrapper, basicFeatures);
    var intersected = (0, lodash_1.intersection)(Object.keys(basicFeatures), Object.keys(userDefinedfeatures));
    if (intersected.length > 0) {
        throw new Error("\u7528\u6237\u5B9A\u4E49\u7684feature\u4E2D\u4E0D\u80FD\u548C\u7CFB\u7EDFfeature\u540C\u540D\uFF1A\u300C".concat(intersected.join(','), "\u300D"));
    }
    var features = Object.assign(basicFeatures, userDefinedfeatures);
    var cacheStore = new CacheStore_1.CacheStore(storageSchema, function () { return frontendContextBuilder(features); });
    wrapper.exec = function (name, params) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var context, _a, result, opRecords;
        return tslib_1.__generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    context = frontendContextBuilder(features)(cacheStore);
                    return [4 /*yield*/, connector.callAspect(name, params, context)];
                case 1:
                    _a = _b.sent(), result = _a.result, opRecords = _a.opRecords;
                    return [2 /*return*/, {
                            result: result,
                            opRecords: opRecords,
                        }];
            }
        });
    }); },
        // cache这个feature依赖于cacheStore和contextBuilder，后注入
        basicFeatures.cache.init(function () { return frontendContextBuilder(features)(cacheStore); }, cacheStore);
    checkers2.forEach(function (checker) { return cacheStore.registerChecker(checker); });
    if (actionDict) {
        var adCheckers = (0, actionDef_1.analyzeActionDefDict)(storageSchema, actionDict).checkers;
        adCheckers.forEach(function (checker) { return cacheStore.registerChecker(checker); });
    }
    return {
        features: features,
    };
}
exports.initialize = initialize;
