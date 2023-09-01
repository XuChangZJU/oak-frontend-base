"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.t = exports.registerMissCallback = void 0;
var MissCallback = function () { return undefined; };
function registerMissCallback(callback) {
    MissCallback = callback;
}
exports.registerMissCallback = registerMissCallback;
function get(object, path) {
    // 沿着路径寻找到对应的值，未找到则返回默认值 defaultValue
    return (_basePath(path).reduce(function (o, k) {
        return (o || {})[k];
    }, object));
}
function _basePath(path) {
    if (Array.isArray(path))
        return path;
    // 若有 '[',']'，则替换成将 '[' 替换成 '.',去掉 ']'
    return path.replace(/\[/g, '.').replace(/\]/g, '').replace(/:/g, '.').split('.');
}
function t(key, locales, lng, fallbackLng, params) {
    var _a = locales, _b = lng, lngLocales = _a[_b];
    var lngValue = lngLocales && get(lngLocales, key);
    if (lngValue) {
    }
    return '';
}
exports.t = t;
