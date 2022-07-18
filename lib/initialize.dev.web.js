"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
require("./utils/wx.polyfill");
const lodash_1 = require("lodash");
const page_web_1 = require("./page.web");
const initialize_dev_1 = require("./initialize-dev");
const i18n_1 = require("./platforms/web/i18n");
function initialize(storageSchema, createFeatures, contextBuilder, aspectDict, exceptionRouters = [], triggers, checkers, watchers, initialData, actionDict, translations, version) {
    const { features, context } = (0, initialize_dev_1.initialize)(storageSchema, createFeatures, contextBuilder, aspectDict, triggers, checkers, watchers, initialData, actionDict);
    const exceptionRouterDict = {};
    for (const router of exceptionRouters) {
        (0, lodash_1.assign)(exceptionRouterDict, {
            [router[0].name]: router[1],
        });
    }
    // 初始化i8n配置
    const i18n = (0, i18n_1.getI18next)({
        version,
    });
    (0, lodash_1.assign)(global, {
        OakPage: (options) => (0, page_web_1.createPage)(options, features, exceptionRouterDict, context),
        OakComponent: (options) => (0, page_web_1.createComponent)(options, features, exceptionRouterDict, context),
    });
    return {
        i18n,
    };
}
exports.initialize = initialize;
