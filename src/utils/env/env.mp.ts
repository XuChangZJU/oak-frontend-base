import { WechatMpEnv } from 'oak-domain/lib/types/Environment';

export async function getEnv() {
    const env = await wx.getSystemInfo();
    return Object.assign(env, {
        type: 'wechatMp',
        localStorageEnabled: true,
        language: env.language.replace('_', '-'),       // 全局统一用中连接符
    }) as unknown as WechatMpEnv;
}