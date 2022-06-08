"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.I18nWechatMp = exports.CURRENT_LOCALE_DATA = exports.COMMON_LOCALE_DATA = exports.LOCALE_CHANGE_HANDLER_NAME = exports.CURRENT_LOCALE_KEY = exports.getI18nInstanceWechatMp = exports.initI18nWechatMp = exports.I18nWechatMpRuntimeBase = void 0;
const interpreter_1 = require("./interpreter");
const common_1 = require("./common");
const translation_parser_1 = require("./compile/translation-parser");
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
        if (translations && typeof translations === 'object')
            this.translations = translations;
    }
    appendTranslations(namespace, translations) {
        if (translations && typeof translations === 'object') {
            const _translations = this.parseTranslations(namespace, translations);
            this.translations = _translations;
        }
    }
    parseTranslations(namespace, translations) {
        // todo 规定格式再支持转化
        const _translations = (0, translation_parser_1.parseTranslations)(translations);
        return _translations;
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
    const i18nInstance = new I18nWechatMpRuntimeBase(locales.translations, defaultLocale || locales.defaultLocale, fallbackLocale || locales.fallbackLocale);
    Object.assign(global, {
        OakI18n: {
            i18nInstance: i18nInstance,
        },
    });
    return i18nInstance;
}
exports.initI18nWechatMp = initI18nWechatMp;
function getI18nInstanceWechatMp() {
    //@ts-ignore
    return global.OakI18n?.i18nInstance;
}
exports.getI18nInstanceWechatMp = getI18nInstanceWechatMp;
exports.CURRENT_LOCALE_KEY = '$_locale';
exports.LOCALE_CHANGE_HANDLER_NAME = '$_localeChange';
exports.COMMON_LOCALE_DATA = '$_common_translations';
exports.CURRENT_LOCALE_DATA = '$_translations';
exports.I18nWechatMp = Behavior((() => {
    const behaviorHooks = {
        lifetimes: {
            created() {
                this[exports.LOCALE_CHANGE_HANDLER_NAME] = (currentLocale) => {
                    this.setData({
                        [exports.CURRENT_LOCALE_KEY]: currentLocale,
                    });
                };
            },
            attached() {
                if (!OakI18n.i18nInstance) {
                    throw new Error('[i18n] ensure run initI18nWechatMp() in app.js before using I18nWechatMp library');
                }
                this.setData({
                    [exports.CURRENT_LOCALE_KEY]: OakI18n.i18nInstance.currentLocale,
                    [exports.CURRENT_LOCALE_DATA]: OakI18n.i18nInstance.translations,
                });
            },
            detached() { },
        },
        methods: {
            t(key, params) {
                if (!OakI18n.i18nInstance) {
                    throw new Error('[i18n] ensure run initI18nWechatMp() in app.js before using I18nWechatMp library');
                }
                return OakI18n.i18nInstance.getString(key, params);
            },
            setLocale(locale) {
                if (!OakI18n.i18nInstance) {
                    throw new Error('[i18n] ensure run initI18nWechatMp() in app.js before using I18nWechatMp library');
                }
                return OakI18n.i18nInstance.setLocale(locale);
            },
            getLocale() {
                if (!OakI18n.i18nInstance) {
                    throw new Error('[i18n] ensure run initI18nWechatMp() in app.js before using I18nWechatMp library');
                }
                return OakI18n.i18nInstance.getLocale();
            },
        },
    };
    return behaviorHooks;
})());
