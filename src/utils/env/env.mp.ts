import { WechatMpEnv } from 'oak-domain/lib/types/Environment';

export async function getEnv() {
    const env = await wx.getSystemInfo();
    return Object.assign(env, {
        type: 'wechatMp',
    }) as unknown as WechatMpEnv;
}