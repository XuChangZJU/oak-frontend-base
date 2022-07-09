"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
require("./utils/wx.polyfill");
const lodash_1 = require("lodash");
const page_mp_1 = require("./page.mp");
const initialize_dev_1 = require("./initialize-dev");
const i18n_1 = require("./platforms/wechatMp/i18n");
function initialize(storageSchema, createFeatures, contextBuilder, aspectDict, translations, exceptionRouters = [], triggers, checkers, watchers, initialData, actionDict) {
    const { features, context } = (0, initialize_dev_1.initialize)(storageSchema, createFeatures, contextBuilder, aspectDict, triggers, checkers, watchers, initialData, actionDict);
    const exceptionRouterDict = {};
    for (const router of exceptionRouters) {
        (0, lodash_1.assign)(exceptionRouterDict, {
            [router[0].name]: router[1],
        });
    }
    // 初始化i8n配置
    let i18n;
    if (translations) {
        const systemInfo = wx.getSystemInfoSync();
        const { language } = systemInfo; // 系统语言
        let defaultLocale;
        if (language === 'zh_CN') {
            defaultLocale = language;
        }
        (0, i18n_1.initI18nWechatMp)({
            locales: {
                translations,
            },
            defaultLocale,
        });
    }
    (0, lodash_1.assign)(global, {
        OakPage: (options) => (0, page_mp_1.createPage)(options, features, exceptionRouterDict, context),
        OakComponent: (options) => (0, page_mp_1.createComponent)(options, features, exceptionRouterDict, context),
    });
    return {
        i18n,
    };
}
exports.initialize = initialize;
