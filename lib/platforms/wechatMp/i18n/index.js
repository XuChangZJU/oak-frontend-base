"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getI18next = exports.CURRENT_LOCALE_DATA = exports.LOCALE_CHANGE_HANDLER_NAME = exports.CURRENT_LOCALE_KEY = exports.getI18nInstanceWechatMp = exports.initI18nWechatMp = exports.I18nWechatMpRuntimeBase = void 0;
var interpreter_1 = require("./interpreter");
var common_1 = require("./common");
var translation_parser_1 = require("./compile/translation-parser");
var lodash_1 = require("oak-domain/lib/utils/lodash");
var I18nWechatMpRuntimeBase = /** @class */ (function () {
    function I18nWechatMpRuntimeBase(translations, currentLocale, fallbackLocale) {
        if (translations === void 0) { translations = {}; }
        if (currentLocale === void 0) { currentLocale = "zh_CN" /* Locale.default */; }
        if (fallbackLocale === void 0) { fallbackLocale = "zh_CN" /* Locale.default */; }
        this.translations = translations;
        this.currentLocale = currentLocale;
        this.fallbackLocale = fallbackLocale;
        if (!this.translations) {
            throw new Error('[i18n] translations should be specified before using I18nWechatMp');
        }
    }
    I18nWechatMpRuntimeBase.prototype.lookUpAST = function (key) {
        return (0, common_1.lookUpAST)(key, this.translations, this.currentLocale, this.fallbackLocale);
    };
    I18nWechatMpRuntimeBase.prototype.getString = function (key, options) {
        var ast = this.lookUpAST(key);
        var formatted = (0, interpreter_1.interpret)(ast, options);
        return formatted;
    };
    I18nWechatMpRuntimeBase.prototype.setLocale = function (locale) {
        this.currentLocale = locale;
    };
    I18nWechatMpRuntimeBase.prototype.getLocale = function () {
        return this.currentLocale;
    };
    I18nWechatMpRuntimeBase.prototype.replaceTranslations = function (translations) {
        var _a;
        var currentLocale = this.currentLocale;
        if (translations && typeof translations === 'object') {
            if (!translations[currentLocale]) {
                translations = (_a = {},
                    _a[currentLocale] = translations,
                    _a);
            }
            var _translations = (0, translation_parser_1.parseTranslations)(translations);
            this.translations = _translations;
        }
    };
    I18nWechatMpRuntimeBase.prototype.appendTranslations = function (translations) {
        var _a;
        var _b = this, currentLocale = _b.currentLocale, currentTranslations = _b.translations;
        if (translations && typeof translations === 'object') {
            if (!translations[currentLocale]) {
                translations = (_a = {},
                    _a[currentLocale] = translations,
                    _a);
            }
            var _translations = (0, translation_parser_1.parseTranslations)(translations);
            this.translations = (0, lodash_1.merge)(currentTranslations, _translations);
        }
    };
    // method shortcut
    I18nWechatMpRuntimeBase.prototype.t = function (key, options) {
        return this.getString(key, options);
    };
    I18nWechatMpRuntimeBase.prototype.getFallbackLocale = function () {
        return this.fallbackLocale;
    };
    return I18nWechatMpRuntimeBase;
}());
exports.I18nWechatMpRuntimeBase = I18nWechatMpRuntimeBase;
function initI18nWechatMp(options) {
    var _a;
    var locales = options.locales, defaultLocale = options.defaultLocale, fallbackLocale = options.fallbackLocale;
    var _defaultLocale = defaultLocale || locales.defaultLocale;
    var _fallbackLocale = fallbackLocale || locales.fallbackLocale;
    var translations = locales.translations || {};
    if (!translations[_defaultLocale]) {
        translations = (_a = {},
            _a[_defaultLocale] = translations,
            _a);
    }
    var _translations = (0, translation_parser_1.parseTranslations)(translations);
    var i18nInstance = new I18nWechatMpRuntimeBase(_translations, _defaultLocale, _fallbackLocale);
    Object.assign(global, {
        OakI18n: {
            i18nInstance: i18nInstance,
        },
    });
    return i18nInstance;
}
exports.initI18nWechatMp = initI18nWechatMp;
function getI18nInstanceWechatMp() {
    return OakI18n === null || OakI18n === void 0 ? void 0 : OakI18n.i18nInstance;
}
exports.getI18nInstanceWechatMp = getI18nInstanceWechatMp;
exports.CURRENT_LOCALE_KEY = '$_locale';
exports.LOCALE_CHANGE_HANDLER_NAME = '$_localeChange';
exports.CURRENT_LOCALE_DATA = '$_translations';
function getI18next(options) {
    var systemInfo = wx.getSystemInfoSync();
    var language = systemInfo.language; // 系统语言
    var translations = (options || {}).translations;
    var defaultLocale = 'zh_CN';
    if (language) {
        defaultLocale = language;
    }
    //初始化i18n
    var i18n = initI18nWechatMp({
        locales: {
            translations: translations,
        },
        defaultLocale: defaultLocale,
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
