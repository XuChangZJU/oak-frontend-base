"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubScriber = void 0;
var tslib_1 = require("tslib");
var lodash_1 = require("oak-domain/lib/utils/lodash");
var Feature_1 = require("../types/Feature");
var SubScriber = /** @class */ (function (_super) {
    tslib_1.__extends(SubScriber, _super);
    function SubScriber(cache, getSubscribePointFn) {
        var _this = _super.call(this) || this;
        _this.eventCallbackMap = {
            connect: [],
            disconnect: [],
        };
        return _this;
    }
    SubScriber.prototype.on = function (event, callback) {
        this.eventCallbackMap[event].push(callback);
    };
    SubScriber.prototype.off = function (event, callback) {
        (0, lodash_1.pull)(this.eventCallbackMap[event], callback);
    };
    SubScriber.prototype.sub = function (data, callback) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                console.log('data subscribe 在dev模式下不起作用');
                return [2 /*return*/];
            });
        });
    };
    SubScriber.prototype.unsub = function (ids) {
        return tslib_1.__awaiter(this, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    return SubScriber;
}(Feature_1.Feature));
exports.SubScriber = SubScriber;
