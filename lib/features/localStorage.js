"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorage = void 0;
var tslib_1 = require("tslib");
var lodash_1 = require("oak-domain/lib/utils/lodash");
var Feature_1 = require("../types/Feature");
var constant_1 = require("../constant/constant");
var LocalStorage = /** @class */ (function (_super) {
    tslib_1.__extends(LocalStorage, _super);
    function LocalStorage(aspectWrapper) {
        var _a;
        var _this = _super.call(this, aspectWrapper) || this;
        if (process.env.NODE_ENV === 'development') {
            // development环境下，debugStore的数据也默认存放在localStorage中
            _this.keys = (_a = {},
                _a[constant_1.LOCAL_STORAGE_KEYS.debugStore] = true,
                _a[constant_1.LOCAL_STORAGE_KEYS.debugStoreStat] = true,
                _a);
        }
        else {
            _this.keys = {};
        }
        return _this;
    }
    LocalStorage.prototype.setKey = function (key) {
        if (!this.keys[key]) {
            this.keys[key] = true;
        }
    };
    LocalStorage.prototype.unsetKey = function (key) {
        if (this.keys[key]) {
            (0, lodash_1.unset)(this.keys, key);
        }
    };
    LocalStorage.prototype.save = function (key, item) {
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
    };
    LocalStorage.prototype.load = function (key) {
        this.setKey(key);
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
    };
    LocalStorage.prototype.remove = function (key) {
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
    };
    LocalStorage.prototype.loadAll = function () {
        var _a;
        var data = {};
        for (var k in this.keys) {
            Object.assign(data, (_a = {},
                _a[k] = this.load(k),
                _a));
        }
        return data;
    };
    LocalStorage.prototype.resetAll = function (data) {
        this.clear();
        for (var k in data) {
            this.save(k, data[k]);
        }
    };
    return LocalStorage;
}(Feature_1.Feature));
exports.LocalStorage = LocalStorage;
