"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var SubScriber = /** @class */ (function () {
    function SubScriber(getSubscribePointUrl) {
        this.getSubscribePointUrl = getSubscribePointUrl;
    }
    SubScriber.prototype.sub = function (data, callback) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    SubScriber.prototype.unsub = function (ids) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    return SubScriber;
}());
exports.default = SubScriber;
