export interface CommonI18nInterface {
    t(key: string, params?: object): string;
    getLocale(): string;
    setLocale(locale: string): void;
}
export declare const enum Locale {
    default = "zh-CN"
}
export declare type Locales = {
    translations: object;
    defaultLocale?: string;
    fallbackLocale?: string;
};
export declare class I18nRuntimeBase implements CommonI18nInterface {
    translations: Record<string, any>;
    currentLocale: string;
    fallbackLocale: string;
    constructor(translations?: Record<string, any>, currentLocale?: string, fallbackLocale?: string);
    lookUpAST(key: string): any;
    getString(key: string, options?: object): string;
    setLocale(locale: string): void;
    getLocale(): string;
    loadTranslations(locales: object): void;
    t(key: string, options?: object): string;
    getFallbackLocale(): string;
}
export declare function initI18n(options: {
    locales: Locales;
    defaultLocale?: string;
    fallbackLocale?: string;
}): I18nRuntimeBase;
export declare function getI18nInstance(): I18nRuntimeBase | null;
export declare const CURRENT_LOCALE_KEY = "$_locale";
export declare const LOCALE_CHANGE_HANDLER_NAME = "$_localeChange";
export declare const COMMON_LOCALE_DATA = "$_common_translations";
export declare const CURRENT_LOCALE_DATA = "$_translations";
export declare const I18n: string;
