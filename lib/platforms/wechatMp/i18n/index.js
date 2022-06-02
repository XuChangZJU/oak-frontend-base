"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.I18n = exports.CURRENT_LOCALE_DATA = exports.COMMON_LOCALE_DATA = exports.LOCALE_CHANGE_HANDLER_NAME = exports.CURRENT_LOCALE_KEY = exports.getI18nInstance = exports.initI18n = exports.I18nRuntimeBase = void 0;
const interpreter_1 = require("./interpreter");
const common_1 = require("./common");
class I18nRuntimeBase {
    translations;
    currentLocale;
    fallbackLocale;
    constructor(translations = {}, currentLocale = "zh-CN" /* default */, fallbackLocale = "zh-CN" /* default */) {
        this.translations = translations;
        this.currentLocale = currentLocale;
        this.fallbackLocale = fallbackLocale;
        if (!this.translations) {
            throw new Error('[i18n] translations should be specified before using I18n');
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
    loadTranslations(locales) {
        if (locales && typeof locales === 'object')
            this.translations = locales;
    }
    // method shortcut
    t(key, options) {
        return this.getString(key, options);
    }
    getFallbackLocale() {
        return this.fallbackLocale;
    }
}
exports.I18nRuntimeBase = I18nRuntimeBase;
function initI18n(options) {
    const { locales, defaultLocale, fallbackLocale } = options;
    const i18nInstance = new I18nRuntimeBase(locales.translations, defaultLocale || locales.defaultLocale, fallbackLocale || locales.fallbackLocale);
    Object.assign(global, {
        OakI18n: {
            i18nInstance: i18nInstance,
        },
    });
    return i18nInstance;
}
exports.initI18n = initI18n;
function getI18nInstance() {
    return OakI18n.i18nInstance;
}
exports.getI18nInstance = getI18nInstance;
exports.CURRENT_LOCALE_KEY = '$_locale';
exports.LOCALE_CHANGE_HANDLER_NAME = '$_localeChange';
exports.COMMON_LOCALE_DATA = '$_common_translations';
exports.CURRENT_LOCALE_DATA = '$_translations';
exports.I18n = Behavior((() => {
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
                    throw new Error('[i18n] ensure run initI18n() in app.js before using I18n library');
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
                    throw new Error('[i18n] ensure run initI18n() in app.js before using I18n library');
                }
                return OakI18n.i18nInstance.getString(key, params);
            },
            setLocale(locale) {
                if (!OakI18n.i18nInstance) {
                    throw new Error('[i18n] ensure run initI18n() in app.js before using I18n library');
                }
                return OakI18n.i18nInstance.setLocale(locale);
            },
            getLocale() {
                if (!OakI18n.i18nInstance) {
                    throw new Error('[i18n] ensure run initI18n() in app.js before using I18n library');
                }
                return OakI18n.i18nInstance.getLocale();
            },
        },
    };
    return behaviorHooks;
})());
