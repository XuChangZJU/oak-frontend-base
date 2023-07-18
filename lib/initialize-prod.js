"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
var tslib_1 = require("tslib");
var features_1 = require("./features");
var actionDef_1 = require("oak-domain/lib/store/actionDef");
var CacheStore_1 = require("./cacheStore/CacheStore");
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
function initialize(storageSchema, frontendContextBuilder, connector, checkers, option) {
    var _this = this;
    var actionCascadePathGraph = option.actionCascadePathGraph, relationCascadePathGraph = option.relationCascadePathGraph, authDeduceRelationMap = option.authDeduceRelationMap, actionDict = option.actionDict, selectFreeEntities = option.selectFreeEntities, colorDict = option.colorDict;
    var intCheckers = (0, actionDef_1.makeIntrinsicCTWs)(storageSchema, actionDict).checkers;
    var checkers2 = checkers.concat(intCheckers);
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
    var features = (0, features_1.initialize)(wrapper, storageSchema, function () { return frontendContextBuilder()(cacheStore); }, cacheStore, actionCascadePathGraph, relationCascadePathGraph, authDeduceRelationMap, selectFreeEntities, colorDict, function (url, headers) { return connector.makeBridgeUrl(url, headers); });
    checkers2.forEach(function (checker) { return cacheStore.registerChecker(checker); });
    return {
        features: features,
    };
}
exports.initialize = initialize;
