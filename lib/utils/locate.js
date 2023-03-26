"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.locate = void 0;
var tslib_1 = require("tslib");
var utils_1 = require("./utils");
function locateWechat() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            return [2 /*return*/, wx.getLocation({})];
        });
    });
}
function locateWeb() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            if ('geolocation' in navigator) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        navigator.geolocation.getCurrentPosition(function (position) {
                            console.log(position);
                            resolve(position.coords);
                        }, function (err) {
                            console.error(err);
                            reject(err);
                        });
                    })];
            }
            else {
                throw new Error('浏览器不支持定位');
            }
            return [2 /*return*/];
        });
    });
}
function locate() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var result, err_1, result2, result2;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!utils_1.isWeiXin) return [3 /*break*/, 6];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 5]);
                    return [4 /*yield*/, locateWechat()];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, result];
                case 3:
                    err_1 = _a.sent();
                    console.warn(err_1);
                    return [4 /*yield*/, locateWeb()];
                case 4:
                    result2 = _a.sent();
                    return [2 /*return*/, result2];
                case 5: return [3 /*break*/, 8];
                case 6: return [4 /*yield*/, locateWeb()];
                case 7:
                    result2 = _a.sent();
                    return [2 /*return*/, result2];
                case 8: return [2 /*return*/];
            }
        });
    });
}
exports.locate = locate;
