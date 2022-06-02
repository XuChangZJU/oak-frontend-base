"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.I18nWechatMp = exports.I18nWechatMpRuntimeBase = exports.getI18nInstanceWechatMp = exports.initI18nWechatMp = exports.InitializeWechatMp = void 0;
const wechatMp_1 = require("./platforms/wechatMp");
Object.defineProperty(exports, "InitializeWechatMp", { enumerable: true, get: function () { return wechatMp_1.initialize; } });
__exportStar(require("./types/Feature"), exports);
__exportStar(require("./types/ExceptionRoute"), exports);
__exportStar(require("./features/cache"), exports);
__exportStar(require("./features/upload"), exports);
var i18n_1 = require("./platforms/wechatMp/i18n");
Object.defineProperty(exports, "initI18nWechatMp", { enumerable: true, get: function () { return i18n_1.initI18nWechatMp; } });
Object.defineProperty(exports, "getI18nInstanceWechatMp", { enumerable: true, get: function () { return i18n_1.getI18nInstanceWechatMp; } });
Object.defineProperty(exports, "I18nWechatMpRuntimeBase", { enumerable: true, get: function () { return i18n_1.I18nWechatMpRuntimeBase; } });
Object.defineProperty(exports, "I18nWechatMp", { enumerable: true, get: function () { return i18n_1.I18nWechatMp; } });
