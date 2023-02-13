"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
var tslib_1 = require("tslib");
var features_1 = require("./features");
var actionDef_1 = require("oak-domain/lib/store/actionDef");
var CacheStore_1 = require("./cacheStore/CacheStore");
var checkers_1 = require("oak-domain/lib/checkers");
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
function initialize(storageSchema, frontendContextBuilder, connector, checkers, actionDict, authDict) {
    var _this = this;
    var checkers2 = (checkers || []).concat((0, checkers_1.createDynamicCheckers)(storageSchema, authDict));
    var cacheStore = new CacheStore_1.CacheStore(storageSchema);
    var wrapper = {
        exec: function (name, params) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var context, _a, result, opRecords, message;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        context = frontendContextBuilder()(cacheStore);
                        return [4 /*yield*/, connector.callAspect(name, params, context)];
                    case 1:
                        _a = _b.sent(), result = _a.result, opRecords = _a.opRecords, message = _a.message;
                        return [2 /*return*/, {
                                result: result,
                                opRecords: opRecords,
                                message: message,
                            }];
                }
            });
        }); },
    };
    var features = (0, features_1.initialize)(wrapper, storageSchema, function () { return frontendContextBuilder()(cacheStore); }, cacheStore);
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
