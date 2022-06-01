import { interpret } from './interpreter';
import { lookUpAST } from './common';

export interface CommonI18nInterface {
    t(key: string, params?: object): string;
    getLocale(): string;
    setLocale(locale: string): void;
}

export const enum Locale {
    default = 'zh-CN',
}

export type Locales = {
    translations: object;
    defaultLocale?: string;
    fallbackLocale?: string;
};

export class I18nRuntimeBase implements CommonI18nInterface {
    constructor(
        public translations: Record<string, any> = {},
        public currentLocale: string = Locale.default,
        public fallbackLocale: string = Locale.default
    ) {
        if (!this.translations) {
            throw new Error(
                '[i18n] translations should be specified before using I18n'
            );
        }
    }

    lookUpAST(key: string) {
        return lookUpAST(
            key,
            this.translations,
            this.currentLocale,
            this.fallbackLocale
        );
    }

    getString(key: string, options?: object) {
        const ast = this.lookUpAST(key);
        const formatted = interpret(ast, options);
        return formatted;
    }

    setLocale(locale: string) {
        this.currentLocale = locale;
    }

    getLocale() {
        return this.currentLocale;
    }

    loadTranslations(locales: object) {
        if (locales && typeof locales === 'object') this.translations = locales;
    }

    // method shortcut
    t(key: string, options?: object) {
        return this.getString(key, options);
    }

    getFallbackLocale() {
        return this.fallbackLocale;
    }
}

export function initI18n(options: {
    locales: Locales;
    defaultLocale?: string;
    fallbackLocale?: string;
}) {
    const { locales, defaultLocale, fallbackLocale } = options;
    const i18nInstance = new I18nRuntimeBase(
        locales.translations,
        defaultLocale || locales.defaultLocale,
        fallbackLocale || locales.fallbackLocale
    );
    Object.assign(global, {
        OakI18n: {
            i18nInstance: i18nInstance,
        },
    });
    return i18nInstance;
}

export function getI18nInstance() {
    return OakI18n.i18nInstance;
}

export const CURRENT_LOCALE_KEY = '$_locale';
export const LOCALE_CHANGE_HANDLER_NAME = '$_localeChange';
export const COMMON_LOCALE_DATA = '$_common_translations';
export const CURRENT_LOCALE_DATA = '$_translations';

type Func = (...args: any[]) => any;

export const I18n = Behavior(
    (() => {
        const behaviorHooks: Record<
            string,
            Record<string, Func> | CommonI18nInterface
        > = {
            lifetimes: {
                created() {
                    (this as any)[LOCALE_CHANGE_HANDLER_NAME] = (
                        currentLocale: string
                    ) => {
                        (this as any).setData({
                            [CURRENT_LOCALE_KEY]: currentLocale,
                        });
                    };
                },

                attached() {
                    if (!OakI18n.i18nInstance) {
                        throw new Error(
                            '[i18n] ensure run initI18n() in app.js before using I18n library'
                        );
                    }

                    (this as any).setData({
                        [CURRENT_LOCALE_KEY]:
                            OakI18n.i18nInstance.currentLocale,
                        [CURRENT_LOCALE_DATA]:
                            OakI18n.i18nInstance.translations,
                    });
                },

                detached() {},
            },

            methods: {
                t(key: string, params: object) {
                    if (!OakI18n.i18nInstance) {
                        throw new Error(
                            '[i18n] ensure run initI18n() in app.js before using I18n library'
                        );
                    }
                    return OakI18n.i18nInstance.getString(key, params);
                },

                setLocale(locale: string) {
                    if (!OakI18n.i18nInstance) {
                        throw new Error(
                            '[i18n] ensure run initI18n() in app.js before using I18n library'
                        );
                    }
                    return OakI18n.i18nInstance.setLocale(locale);
                },

                getLocale() {
                    if (!OakI18n.i18nInstance) {
                        throw new Error(
                            '[i18n] ensure run initI18n() in app.js before using I18n library'
                        );
                    }
                    return OakI18n.i18nInstance.getLocale();
                },
            } as CommonI18nInterface,
        };

        return behaviorHooks;
    })()
);
