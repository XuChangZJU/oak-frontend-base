"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnv = void 0;
async function getEnv() {
    const env = await wx.getSystemInfo();
    const fullEnv = Object.assign(env, {
        type: 'wechatMp',
        localStorageEnabled: true,
        language: env.language.replace('_', '-'), // 全局统一用中连接符
    });
    const briefEnv = {
        system: fullEnv.system,
        wechat: `${fullEnv.platform}/${fullEnv.version}/${fullEnv.language}`,
        brand: fullEnv.brand,
        model: fullEnv.model,
    };
    return {
        fullEnv,
        briefEnv,
    };
}
exports.getEnv = getEnv;
