"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorage = void 0;
const lodash_1 = require("oak-domain/lib/utils/lodash");
const constant_1 = require("../constant/constant");
const Feature_1 = require("../types/Feature");
class LocalStorage extends Feature_1.Feature {
    keys;
    constructor() {
        super();
        if (process.env.NODE_ENV === 'development') {
            // development环境下，debugStore的数据也默认存放在localStorage中
            this.keys = {
                [constant_1.LOCAL_STORAGE_KEYS.debugStore]: true,
                [constant_1.LOCAL_STORAGE_KEYS.debugStoreStat]: true,
            };
        }
        else {
            this.keys = {};
        }
    }
    setKey(key) {
        if (!this.keys[key]) {
            this.keys[key] = true;
        }
    }
    unsetKey(key) {
        if (this.keys[key]) {
            (0, lodash_1.unset)(this.keys, key);
        }
    }
    async save(key, item) {
        this.setKey(key);
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
    async load(key) {
        this.setKey(key);
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
    async clear() {
        this.keys = {};
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
    async remove(key) {
        this.unsetKey(key);
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
    }
    async loadAll() {
        const data = {};
        for (const k in this.keys) {
            Object.assign(data, {
                [k]: await this.load(k),
            });
        }
        return data;
    }
    async resetAll(data) {
        this.clear();
        for (const k in data) {
            await this.save(k, data[k]);
        }
    }
}
exports.LocalStorage = LocalStorage;
