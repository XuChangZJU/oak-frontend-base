"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorage = void 0;
const Feature_1 = require("../types/Feature");
class LocalStorage extends Feature_1.Feature {
    save(key, item) {
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
    }
    load(key) {
        switch (process.env.OAK_PLATFORM) {
            case 'wechatMp': {
                return wx.getStorageSync(key);
            }
            case 'web': {
                const data = localStorage.getItem(key);
                if (data) {
                    return JSON.parse(data);
                }
                return undefined;
            }
            default: {
                throw new Error('尚未支持');
            }
        }
    }
    clear() {
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
    }
}
exports.LocalStorage = LocalStorage;
