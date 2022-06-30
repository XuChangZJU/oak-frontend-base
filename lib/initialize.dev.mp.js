"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
require("./utils/wx.polyfill");
const lodash_1 = require("lodash");
const page_mp_1 = require("./page.mp");
const initialize_dev_1 = require("./initialize-dev");
function initialize(storageSchema, createFeatures, contextBuilder, aspectDict, translations, exceptionRouters = [], triggers, checkers, watchers, initialData, actionDict) {
    const { features, context } = (0, initialize_dev_1.initialize)(storageSchema, createFeatures, contextBuilder, aspectDict, triggers, checkers, watchers, initialData, actionDict);
    const exceptionRouterDict = {};
    for (const router of exceptionRouters) {
        (0, lodash_1.assign)(exceptionRouterDict, {
            [router[0].name]: router[1],
        });
    }
    (0, lodash_1.assign)(global, {
        OakPage: (options) => (0, page_mp_1.createPage)(options, features, exceptionRouterDict, context),
        OakComponent: (options) => (0, page_mp_1.createComponent)(options, features, exceptionRouterDict, context),
    });
}
exports.initialize = initialize;
