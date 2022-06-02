import { I18nWechatMpRuntimeBase } from '../platforms/wechatMp/i18n';

declare global {
    const generateNewId: (options?: { timestamp?: boolean }) => Promise<string>;
    const OakI18n: {
        i18nInstance: I18nWechatMpRuntimeBase | null;
    } = {
        i18nInstance: null,
    };
}
export {};
