"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = exports.getI18nInstanceWechatMp = exports.I18nWechatMpRuntimeBase = exports.initI18nWechatMp = void 0;
require("./polyfill");
const initialize_dev_1 = require("../../initialize.dev");
const lodash_1 = require("lodash");
const index_1 = require("./index");
var i18n_1 = require("./i18n");
Object.defineProperty(exports, "initI18nWechatMp", { enumerable: true, get: function () { return i18n_1.initI18nWechatMp; } });
Object.defineProperty(exports, "I18nWechatMpRuntimeBase", { enumerable: true, get: function () { return i18n_1.I18nWechatMpRuntimeBase; } });
Object.defineProperty(exports, "getI18nInstanceWechatMp", { enumerable: true, get: function () { return i18n_1.getI18nInstanceWechatMp; } });
function initialize(storageSchema, createFeatures, contextBuilder, contextCreator, aspectDict, exceptionRouters = [], triggers, checkers, watchers, initialData, actionDict) {
    const { features, context } = (0, initialize_dev_1.initialize)(storageSchema, createFeatures, contextBuilder, aspectDict, triggers, checkers, watchers, initialData, actionDict);
    const exceptionRouterDict = {};
    for (const router of exceptionRouters) {
        (0, lodash_1.assign)(exceptionRouterDict, {
            [router[0].name]: router[1],
        });
    }
    return {
        OakPage: (options, componentOptions = {}) => {
            const oakOptions = (0, index_1.createPageOptions)(options, features, exceptionRouterDict, context);
            const { properties, pageLifetimes, lifetimes, methods, data, observers, } = oakOptions;
            const { properties: p2, pageLifetimes: pl2, lifetimes: l2, methods: m2, data: d2, observers: o2, ...restOptions } = componentOptions;
            const pls = [pageLifetimes];
            if (pl2) {
                pls.push(pl2);
            }
            const ls = [lifetimes];
            if (l2) {
                ls.push(l2);
            }
            return Component({
                data: (0, lodash_1.assign)({}, d2, data),
                properties: (0, lodash_1.assign)({}, p2, properties),
                observers: (0, lodash_1.assign)({}, o2, observers),
                methods: (m2 ? (0, index_1.mergeMethods)([methods, m2]) : methods),
                pageLifetimes: (0, index_1.mergePageLifetimes)(pls),
                lifetimes: (0, index_1.mergeLifetimes)(ls),
                ...restOptions,
            });
        },
        OakComponent: (options, componentOptions = {}) => {
            const oakOptions = (0, index_1.createComponentOptions)(options, features, exceptionRouterDict);
            const { properties, pageLifetimes, lifetimes, methods, data, observers, } = oakOptions;
            const { properties: p2, pageLifetimes: pl2, lifetimes: l2, methods: m2, data: d2, observers: o2, ...restOptions } = componentOptions;
            const pls = [pageLifetimes, pl2].filter((ele) => !!ele);
            const ls = [lifetimes, l2].filter((ele) => !!ele);
            return Component({
                data: (0, lodash_1.assign)({}, d2, data),
                properties: (0, lodash_1.assign)({}, p2, properties),
                observers: (0, lodash_1.assign)({}, o2, observers),
                methods: (m2 ? (0, index_1.mergeMethods)([methods, m2]) : methods),
                pageLifetimes: (0, index_1.mergePageLifetimes)(pls),
                lifetimes: (0, index_1.mergeLifetimes)(ls),
                ...restOptions,
            });
        },
        features,
    };
}
exports.initialize = initialize;
