"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorage = void 0;
const tslib_1 = require("tslib");
const lodash_1 = require("oak-domain/lib/utils/lodash");
const constant_1 = require("../constant/constant");
const Feature_1 = require("../types/Feature");
const async_storage_1 = tslib_1.__importDefault(require("@react-native-async-storage/async-storage"));
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
        await async_storage_1.default.setItem(key, JSON.stringify(item));
    }
    async load(key) {
        this.setKey(key);
        const value = await async_storage_1.default.getItem(key);
        if (value) {
            return JSON.parse(value);
        }
    }
    clear() {
        return async_storage_1.default.clear();
    }
    remove(key) {
        return async_storage_1.default.removeItem(key);
    }
    async loadAll() {
        const keys = await async_storage_1.default.getAllKeys();
        const value = await async_storage_1.default.multiGet(keys);
        const result = {};
        value.forEach(([k, v]) => {
            if (typeof v === 'string') {
                result[k] = JSON.parse(v);
            }
        });
        return result;
    }
    resetAll(data) {
        const value = [];
        Object.keys(data).forEach((k) => {
            if (data[k] !== undefined && data[k] !== null) {
                value.push([k, JSON.stringify(data[k])]);
            }
        });
        return async_storage_1.default.multiMerge(value);
    }
}
exports.LocalStorage = LocalStorage;
