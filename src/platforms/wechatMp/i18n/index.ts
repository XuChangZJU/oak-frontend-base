import { interpret } from './interpreter';
import { lookUpAST } from './common';
import { parseTranslations } from './compile/translation-parser';

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

export class I18nWechatMpRuntimeBase implements CommonI18nInterface {
    constructor(
        public translations: Record<string, any> = {},
        public currentLocale: string = Locale.default,
        public fallbackLocale: string = Locale.default
    ) {
        if (!this.translations) {
            throw new Error(
                '[i18n] translations should be specified before using I18nWechatMp'
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

    replaceTranslations(translations: object) {
        if (translations && typeof translations === 'object')
            this.translations = translations;
    }

    appendTranslations(
        namespace: string,
        translations: object,
    ) {
        if (translations && typeof translations === 'object') {
            const _translations = this.parseTranslations(
                namespace,
                translations,
            );
            this.translations = _translations;
        }
    }

    parseTranslations(
        namespace: string,
        translations: object,
    ) {
        // todo 规定格式再支持转化
        const _translations = parseTranslations(translations);
        return _translations;
    }

    // method shortcut
    t(key: string, options?: object) {
        return this.getString(key, options);
    }

    getFallbackLocale() {
        return this.fallbackLocale;
    }
}

export function initI18nWechatMp(options: {
    locales: Locales;
    defaultLocale?: string;
    fallbackLocale?: string;
}) {
    const { locales, defaultLocale, fallbackLocale } = options;
    const i18nInstance = new I18nWechatMpRuntimeBase(
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

export function getI18nInstanceWechatMp() {
    //@ts-ignore
    return global.OakI18n?.i18nInstance;
}

export const CURRENT_LOCALE_KEY = '$_locale';
export const LOCALE_CHANGE_HANDLER_NAME = '$_localeChange';
export const COMMON_LOCALE_DATA = '$_common_translations';
export const CURRENT_LOCALE_DATA = '$_translations';

type Func = (...args: any[]) => any;

export const I18nWechatMp = Behavior(
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
                            '[i18n] ensure run initI18nWechatMp() in app.js before using I18nWechatMp library'
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
                            '[i18n] ensure run initI18nWechatMp() in app.js before using I18nWechatMp library'
                        );
                    }
                    return OakI18n.i18nInstance.getString(key, params);
                },

                setLocale(locale: string) {
                    if (!OakI18n.i18nInstance) {
                        throw new Error(
                            '[i18n] ensure run initI18nWechatMp() in app.js before using I18nWechatMp library'
                        );
                    }
                    return OakI18n.i18nInstance.setLocale(locale);
                },

                getLocale() {
                    if (!OakI18n.i18nInstance) {
                        throw new Error(
                            '[i18n] ensure run initI18nWechatMp() in app.js before using I18nWechatMp library'
                        );
                    }
                    return OakI18n.i18nInstance.getLocale();
                },
            } as CommonI18nInterface,
        };

        return behaviorHooks;
    })()
);
