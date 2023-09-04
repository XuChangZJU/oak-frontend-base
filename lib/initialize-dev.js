"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
var tslib_1 = require("tslib");
var actionDef_1 = require("oak-domain/lib/store/actionDef");
var debugStore_1 = require("./debugStore");
var features_1 = require("./features");
var lodash_1 = require("oak-domain/lib/utils/lodash");
var oak_common_aspect_1 = tslib_1.__importDefault(require("oak-common-aspect"));
var oak_common_aspect_2 = require("oak-common-aspect");
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
function initialize(storageSchema, frontendContextBuilder, backendContextBuilder, aspectDict, triggers, checkers, watchers, timers, startRoutines, initialData, option) {
    var _this = this;
    var actionCascadePathGraph = option.actionCascadePathGraph, actionDict = option.actionDict, relationCascadePathGraph = option.relationCascadePathGraph, authDeduceRelationMap = option.authDeduceRelationMap, colorDict = option.colorDict, importations = option.importations, exportations = option.exportations, selectFreeEntities = option.selectFreeEntities, createFreeEntities = option.createFreeEntities, updateFreeEntities = option.updateFreeEntities, cacheKeepFreshPeriod = option.cacheKeepFreshPeriod, cacheSavedEntities = option.cacheSavedEntities;
    var intersected = (0, lodash_1.intersection)(Object.keys(oak_common_aspect_1.default), Object.keys(aspectDict));
    if (intersected.length > 0) {
        throw new Error("\u7528\u6237\u5B9A\u4E49\u7684aspect\u4E2D\u4E0D\u80FD\u548C\u7CFB\u7EDFaspect\u540C\u540D\uFF1A\u300C".concat(intersected.join(','), "\u300D"));
    }
    var aspectDict2 = Object.assign({}, aspectDict, oak_common_aspect_1.default);
    var _a = (0, actionDef_1.makeIntrinsicCTWs)(storageSchema, actionDict), intCheckers = _a.checkers, intTriggers = _a.triggers, intWatchers = _a.watchers;
    var checkers2 = checkers.concat(intCheckers);
    var triggers2 = triggers.concat(intTriggers);
    var watchers2 = watchers.concat(intWatchers);
    var features1 = (0, features_1.initializeStep1)();
    var debugStore = (0, debugStore_1.createDebugStore)(storageSchema, backendContextBuilder, triggers2, checkers2, watchers2, timers, startRoutines, initialData, actionDict, actionCascadePathGraph, relationCascadePathGraph, authDeduceRelationMap, function (key, data) { return features1.localStorage.save(key, data); }, function (key) { return features1.localStorage.load(key); }, selectFreeEntities, createFreeEntities, updateFreeEntities);
    var wrapper = {
        exec: function (name, params) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var context, str, contextBackend, result, err_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        context = features2.cache.buildContext();
                        str = context.toString();
                        return [4 /*yield*/, backendContextBuilder(str)(debugStore)];
                    case 1:
                        contextBackend = _a.sent();
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
                            message: contextBackend.getMessage(),
                        }];
                }
            });
        }); },
    };
    var features2 = (0, features_1.initializeStep2)(features1, wrapper, storageSchema, frontendContextBuilder, checkers2, actionCascadePathGraph, relationCascadePathGraph, authDeduceRelationMap, colorDict, function () { return debugStore.getCurrentData(); }, function () { return tslib_1.__awaiter(_this, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
        return [2 /*return*/, ({ url: '', path: '' })];
    }); }); }, undefined, selectFreeEntities, createFreeEntities, updateFreeEntities, cacheSavedEntities, cacheKeepFreshPeriod);
    (0, oak_common_aspect_2.registerPorts)(importations || [], exportations || []);
    var features = Object.assign(features2, features1);
    return {
        features: features,
    };
}
exports.initialize = initialize;
