"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getI18next = exports.CURRENT_LOCALE_DATA = exports.LOCALE_CHANGE_HANDLER_NAME = exports.CURRENT_LOCALE_KEY = exports.getI18nInstanceWechatMp = exports.initI18nWechatMp = exports.I18nWechatMpRuntimeBase = void 0;
const interpreter_1 = require("./interpreter");
const common_1 = require("./common");
const translation_parser_1 = require("./compile/translation-parser");
const lodash_1 = require("oak-domain/lib/utils/lodash");
class I18nWechatMpRuntimeBase {
    translations;
    currentLocale;
    fallbackLocale;
    constructor(translations = {}, currentLocale = "zh_CN" /* Locale.default */, fallbackLocale = "zh_CN" /* Locale.default */) {
        this.translations = translations;
        this.currentLocale = currentLocale;
        this.fallbackLocale = fallbackLocale;
        if (!this.translations) {
            throw new Error('[i18n] translations should be specified before using I18nWechatMp');
        }
    }
    lookUpAST(key) {
        return (0, common_1.lookUpAST)(key, this.translations, this.currentLocale, this.fallbackLocale);
    }
    getString(key, options) {
        const ast = this.lookUpAST(key);
        const formatted = (0, interpreter_1.interpret)(ast, options);
        return formatted;
    }
    setLocale(locale) {
        this.currentLocale = locale;
    }
    getLocale() {
        return this.currentLocale;
    }
    replaceTranslations(translations) {
        const { currentLocale } = this;
        if (translations && typeof translations === 'object') {
            if (!translations[currentLocale]) {
                translations = {
                    [currentLocale]: translations,
                };
            }
            const _translations = (0, translation_parser_1.parseTranslations)(translations);
            this.translations = _translations;
        }
    }
    appendTranslations(translations) {
        const { currentLocale, translations: currentTranslations } = this;
        if (translations && typeof translations === 'object') {
            if (!translations[currentLocale]) {
                translations = {
                    [currentLocale]: translations,
                };
            }
            const _translations = (0, translation_parser_1.parseTranslations)(translations);
            this.translations = (0, lodash_1.merge)(currentTranslations, _translations);
        }
    }
    // method shortcut
    t(key, options) {
        return this.getString(key, options);
    }
    getFallbackLocale() {
        return this.fallbackLocale;
    }
}
exports.I18nWechatMpRuntimeBase = I18nWechatMpRuntimeBase;
function initI18nWechatMp(options) {
    const { locales, defaultLocale, fallbackLocale } = options;
    const _defaultLocale = defaultLocale || locales.defaultLocale;
    const _fallbackLocale = fallbackLocale || locales.fallbackLocale;
    let translations = locales.translations || {};
    if (!translations[_defaultLocale]) {
        translations = {
            [_defaultLocale]: translations,
        };
    }
    const _translations = (0, translation_parser_1.parseTranslations)(translations);
    const i18nInstance = new I18nWechatMpRuntimeBase(_translations, _defaultLocale, _fallbackLocale);
    Object.assign(global, {
        OakI18n: {
            i18nInstance: i18nInstance,
        },
    });
    return i18nInstance;
}
exports.initI18nWechatMp = initI18nWechatMp;
function getI18nInstanceWechatMp() {
    return OakI18n?.i18nInstance;
}
exports.getI18nInstanceWechatMp = getI18nInstanceWechatMp;
exports.CURRENT_LOCALE_KEY = '$_locale';
exports.LOCALE_CHANGE_HANDLER_NAME = '$_localeChange';
exports.CURRENT_LOCALE_DATA = '$_translations';
function getI18next(options) {
    const { translations, defaultLocale } = options || {};
    //初始化i18n
    const i18n = initI18nWechatMp({
        locales: {
            translations: translations || {},
        },
        defaultLocale: defaultLocale || "zh_CN" /* Locale.default */,
    });
    return i18n;
}
exports.getI18next = getI18next;
// type Func = (...args: any[]) => any;
// export const I18nWechatMp = Behavior(
//     (() => {
//         const behaviorHooks: Record<
//             string,
//             Record<string, Func> | CommonI18nInterface
//         > = {
//             lifetimes: {
//                 created() {
//                     (this as any)[LOCALE_CHANGE_HANDLER_NAME] = (
//                         currentLocale: string
//                     ) => {
//                         (this as any).setData({
//                             [CURRENT_LOCALE_KEY]: currentLocale,
//                         });
//                     };
//                 },
//                 attached() {
//                     if (!OakI18n.i18nInstance) {
//                         throw new Error(
//                             '[i18n] ensure run initI18nWechatMp() in app.js before using I18nWechatMp library'
//                         );
//                     }
//                     (this as any).setData({
//                         [CURRENT_LOCALE_KEY]:
//                             OakI18n.i18nInstance.currentLocale,
//                         [CURRENT_LOCALE_DATA]:
//                             OakI18n.i18nInstance.translations,
//                     });
//                 },
//                 detached() {},
//             },
//             methods: {
//                 t(key: string, params: object) {
//                     if (!OakI18n.i18nInstance) {
//                         throw new Error(
//                             '[i18n] ensure run initI18nWechatMp() in app.js before using I18nWechatMp library'
//                         );
//                     }
//                     return OakI18n.i18nInstance.getString(key, params);
//                 },
//                 setLocale(locale: string) {
//                     if (!OakI18n.i18nInstance) {
//                         throw new Error(
//                             '[i18n] ensure run initI18nWechatMp() in app.js before using I18nWechatMp library'
//                         );
//                     }
//                     return OakI18n.i18nInstance.setLocale(locale);
//                 },
//                 getLocale() {
//                     if (!OakI18n.i18nInstance) {
//                         throw new Error(
//                             '[i18n] ensure run initI18nWechatMp() in app.js before using I18nWechatMp library'
//                         );
//                     }
//                     return OakI18n.i18nInstance.getLocale();
//                 },
//             } as CommonI18nInterface,
//         };
//         return behaviorHooks;
//     })()
// );
