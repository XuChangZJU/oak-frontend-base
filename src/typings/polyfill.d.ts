import { I18nRuntimeBase } from '../platforms/wechatMp/i18n';

declare global {
    const generateNewId: (options?: { timestamp?: boolean }) => Promise<string>;
    const OakI18n: {
        i18nInstance: I18nRuntimeBase | null;
    } = {
        i18nInstance: null,
    };
}
export {};
