"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
require("./utils/wx.polyfill");
var page_mp_1 = require("./page.mp");
var initialize_dev_1 = require("./initialize-dev");
var i18n_1 = require("./platforms/wechatMp/i18n");
function initialize(storageSchema, createFeatures, frontendContextBuilder, backendContextBuilder, aspectDict, triggers, checkers, watchers, timers, startRoutines, initialData, actionDict, i18nOptions, importations, exportations) {
    var features = (0, initialize_dev_1.initialize)(storageSchema, createFeatures, frontendContextBuilder, backendContextBuilder, aspectDict, triggers, checkers, watchers, timers, startRoutines, initialData, actionDict).features;
    // 初始化i8n配置
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
