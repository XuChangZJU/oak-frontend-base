"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
require("./utils/wx.polyfill");
var page_mp_1 = require("./page.mp");
var initialize_prod_1 = require("./initialize-prod");
var i18n_1 = require("./platforms/wechatMp/i18n");
function initialize(storageSchema, createFeatures, frontendContextBuilder, connector, checkers, actionDict, i18nOptions) {
    var features = (0, initialize_prod_1.initialize)(storageSchema, createFeatures, frontendContextBuilder, connector, checkers, actionDict).features;
    // 初始化locales
    var i18n = (0, i18n_1.getI18next)(i18nOptions);
    Object.assign(global, {
        OakComponent: function (options) {
            return (0, page_mp_1.createComponent)(options, features);
        },
    });
    return {
        i18n: i18n,
        features: features,
    };
}
exports.initialize = initialize;
