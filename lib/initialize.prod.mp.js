"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
require("./utils/wx.polyfill");
const lodash_1 = require("lodash");
const page_mp_1 = require("./page.mp");
const initialize_prod_1 = require("./initialize-prod");
const i18n_1 = require("./platforms/wechatMp/i18n");
function initialize(storageSchema, createFeatures, contextBuilder, exceptionRouters = [], connector, checkers, actionDict, translations) {
    const { features, context } = (0, initialize_prod_1.initialize)(storageSchema, createFeatures, contextBuilder, connector, checkers, actionDict);
    const exceptionRouterDict = {};
    for (const router of exceptionRouters) {
        (0, lodash_1.assign)(exceptionRouterDict, {
            [router[0].name]: router[1],
        });
    }
    // 初始化locales
    if (translations) {
        const systemInfo = wx.getSystemInfoSync();
        const { language } = systemInfo; // 系统语言
        let defaultLocale;
        if (language === 'zh_CN') {
            defaultLocale = language;
        }
        //初始化i18n
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
}
exports.initialize = initialize;
