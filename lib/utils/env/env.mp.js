"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnv = void 0;
var tslib_1 = require("tslib");
function getEnv() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var env;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, wx.getSystemInfo()];
                case 1:
                    env = _a.sent();
                    return [2 /*return*/, Object.assign(env, {
                            type: 'wechatMp',
                            localStorageEnabled: true,
                        })];
            }
        });
    });
}
exports.getEnv = getEnv;
