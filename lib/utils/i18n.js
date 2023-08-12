"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.t = exports.registerMissCallback = void 0;
var MissCallback = function () { return undefined; };
function registerMissCallback(callback) {
    MissCallback = callback;
}
exports.registerMissCallback = registerMissCallback;
// todo 实现i18n.t的逻辑，这段代码将被编译到wxs中供小程序使用。当发生miss时，调用MissCallback函数
function t(key, locales, lng, fallbackLng, params) {
    throw new Error('not implemented yet');
}
exports.t = t;
