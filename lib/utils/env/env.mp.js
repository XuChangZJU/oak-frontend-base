"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnv = void 0;
async function getEnv() {
    const env = await wx.getSystemInfo();
    return Object.assign(env, {
        type: 'wechatMp',
        localStorageEnabled: true,
        language: env.language.replace('_', '-'), // 全局统一用中连接符
    });
}
exports.getEnv = getEnv;
