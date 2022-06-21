"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
const initialize_dev_1 = require("../../initialize.dev");
const lodash_1 = require("lodash");
const index_1 = require("./index");
function initialize(storageSchema, createFeatures, contextBuilder, contextCreator, aspectDict, exceptionRouters = [], triggers, checkers, watchers, initialData, actionDict) {
    const { subscribe, features } = (0, initialize_dev_1.initialize)(storageSchema, createFeatures, contextBuilder, contextCreator, aspectDict, triggers, checkers, watchers, initialData, actionDict);
    const exceptionRouterDict = {};
    for (const router of exceptionRouters) {
        (0, lodash_1.assign)(exceptionRouterDict, {
            [router[0].name]: router[1],
        });
    }
    return {
        OakPage: (options, componentOptions = {}) => {
            const oakOptions = (0, index_1.createPageOptions)(options, subscribe, features, exceptionRouterDict);
            const { properties, pageLifetimes, lifetimes, methods, data, observers } = oakOptions;
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
            const oakOptions = (0, index_1.createComponentOptions)(options, subscribe, features, exceptionRouterDict);
            const { properties, pageLifetimes, lifetimes, methods, data, observers } = oakOptions;
            const { properties: p2, pageLifetimes: pl2, lifetimes: l2, methods: m2, data: d2, observers: o2, ...restOptions } = componentOptions;
            const pls = [pageLifetimes, pl2].filter(ele => !!ele);
            const ls = [lifetimes, l2].filter(ele => !!ele);
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
