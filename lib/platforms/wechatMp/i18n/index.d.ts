export interface CommonI18nInterface {
    t(key: string, params?: object): string;
    getLocale(): string;
    setLocale(locale: string): void;
}
export declare const enum Locale {
    default = "zh_CN"
}
export type Locales = {
    translations: object;
    defaultLocale?: string;
    fallbackLocale?: string;
};
export declare class I18nWechatMpRuntimeBase implements CommonI18nInterface {
    translations: Record<string, any>;
    currentLocale: string;
    fallbackLocale: string;
    constructor(translations?: Record<string, any>, currentLocale?: string, fallbackLocale?: string);
    lookUpAST(key: string): any;
    getString(key: string, options?: object): string;
    setLocale(locale: string): void;
    getLocale(): string;
    replaceTranslations(translations: object): void;
    appendTranslations(translations: object): void;
    t(key: string, options?: object): string;
    getFallbackLocale(): string;
}
declare global {
    const OakI18n: {
        i18nInstance: I18nWechatMpRuntimeBase | null;
    };
}
export declare function initI18nWechatMp(options: {
    locales: Locales;
    defaultLocale?: string;
    fallbackLocale?: string;
}): I18nWechatMpRuntimeBase;
export declare function getI18nInstanceWechatMp(): I18nWechatMpRuntimeBase | null;
export declare const CURRENT_LOCALE_KEY = "$_locale";
export declare const LOCALE_CHANGE_HANDLER_NAME = "$_localeChange";
export declare const CURRENT_LOCALE_DATA = "$_translations";
export type I18nOptions = {
    translations?: Record<string, any>;
    defaultLocale?: string;
};
export declare function getI18next(options?: I18nOptions): I18nWechatMpRuntimeBase;
