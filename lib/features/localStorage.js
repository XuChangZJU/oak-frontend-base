"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorage = void 0;
var tslib_1 = require("tslib");
var Feature_1 = require("../types/Feature");
var LocalStorage = /** @class */ (function (_super) {
    tslib_1.__extends(LocalStorage, _super);
    function LocalStorage() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LocalStorage.prototype.save = function (key, item) {
        switch (process.env.OAK_PLATFORM) {
            case 'wechatMp': {
                wx.setStorageSync(key, item);
                break;
            }
            case 'web': {
                localStorage.setItem(key, JSON.stringify(item));
                break;
            }
            default: {
                throw new Error('尚未支持');
            }
        }
    };
    LocalStorage.prototype.load = function (key) {
        switch (process.env.OAK_PLATFORM) {
            case 'wechatMp': {
                return wx.getStorageSync(key);
            }
            case 'web': {
                var data = localStorage.getItem(key);
                if (data) {
                    return JSON.parse(data);
                }
                return undefined;
            }
            default: {
                throw new Error('尚未支持');
            }
        }
    };
    LocalStorage.prototype.clear = function () {
        switch (process.env.OAK_PLATFORM) {
            case 'wechatMp': {
                wx.clearStorageSync();
                break;
            }
            case 'web': {
                localStorage.clear();
                break;
            }
            default: {
                throw new Error('尚未支持');
            }
        }
    };
    LocalStorage.prototype.remove = function (key) {
        switch (process.env.OAK_PLATFORM) {
            case 'wechatMp': {
                wx.removeStorageSync(key);
                break;
            }
            case 'web': {
                localStorage.removeItem(key);
                break;
            }
            default: {
                throw new Error('尚未支持');
            }
        }
    };
    return LocalStorage;
}(Feature_1.Feature));
exports.LocalStorage = LocalStorage;
