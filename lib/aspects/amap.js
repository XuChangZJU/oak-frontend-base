"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.amap = void 0;
const oak_wechat_sdk_1 = require("oak-wechat-sdk");
async function amap(options) {
    const { key, method, data } = options;
    const instance = oak_wechat_sdk_1.AmapSDK.getInstance(key);
    const fn = instance[method];
    if (!fn) {
        throw new Error('method not implemented');
    }
    // data any后面再改
    return fn(data);
}
exports.amap = amap;
