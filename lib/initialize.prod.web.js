"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
require("./utils/wx.polyfill");
var page_web_1 = require("./page.web");
var initialize_prod_1 = require("./initialize-prod");
var i18n_1 = require("./platforms/web/i18n");
function initialize(storageSchema, createFeatures, contextBuilder, exceptionRouters, connector, checkers, actionDict, translations, version) {
    var e_1, _a, _b;
    if (exceptionRouters === void 0) { exceptionRouters = []; }
    var _c = (0, initialize_prod_1.initialize)(storageSchema, createFeatures, contextBuilder, connector, checkers, actionDict), features = _c.features, context = _c.context;
    var exceptionRouterDict = {};
    try {
        for (var exceptionRouters_1 = __values(exceptionRouters), exceptionRouters_1_1 = exceptionRouters_1.next(); !exceptionRouters_1_1.done; exceptionRouters_1_1 = exceptionRouters_1.next()) {
            var router = exceptionRouters_1_1.value;
            Object.assign(exceptionRouterDict, (_b = {},
                _b[router[0].name] = router[1],
                _b));
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (exceptionRouters_1_1 && !exceptionRouters_1_1.done && (_a = exceptionRouters_1.return)) _a.call(exceptionRouters_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    // 初始化i8n配置
    var i18n = (0, i18n_1.getI18next)({
        version: version,
    });
    Object.assign(global, {
        OakPage: function (options) {
            return (0, page_web_1.createPage)(options, features, exceptionRouterDict, context);
        },
        OakComponent: function (options) {
            return (0, page_web_1.createComponent)(options, features, exceptionRouterDict, context);
        },
    });
    return {
        i18n: i18n,
    };
}
exports.initialize = initialize;
