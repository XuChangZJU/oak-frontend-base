"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Locales = void 0;
var tslib_1 = require("tslib");
var Feature_1 = require("../types/Feature");
var i18n_1 = require("../utils/i18n");
var LS_LNG_KEY = 'ofb-feature-locale-lng';
var Locales = /** @class */ (function (_super) {
    tslib_1.__extends(Locales, _super);
    function Locales(cache, localStorage, environment, defaultLng, makeBridgeUrlFn) {
        var _this = _super.call(this) || this;
        _this.ignoreMiss = false;
        _this.dataset = {};
        _this.cache = cache;
        _this.localStorage = localStorage;
        _this.defaultLng = defaultLng;
        _this.environment = environment;
        var savedLng = localStorage.load(LS_LNG_KEY);
        if (savedLng) {
            _this.language = savedLng;
            _this.resetDataset();
        }
        else {
            _this.language = defaultLng;
            _this.detectLanguange();
        }
        (0, i18n_1.registerMissCallback)(function (key) { return _this.loadData(key); });
        _this.makeBridgeUrlFn = makeBridgeUrlFn;
        return _this;
    }
    Locales.prototype.detectLanguange = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var env, language;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.environment.getEnv()];
                    case 1:
                        env = _a.sent();
                        language = env.language;
                        this.language = language;
                        this.localStorage.save(LS_LNG_KEY, language);
                        this.resetDataset();
                        return [2 /*return*/];
                }
            });
        });
    };
    Locales.prototype.resetDataset = function () {
        var _this = this;
        var i18ns = this.cache.get('i18n', {
            data: {
                id: 1,
                data: 1,
                namespace: 1,
                language: 1,
            },
        });
        this.dataset = {};
        i18ns.forEach(function (_a) {
            var namespace = _a.namespace, data = _a.data, language = _a.language;
            if (_this.dataset[language]) {
                _this.dataset[language][namespace] = data;
            }
        });
    };
    /**
     * 当发生key缺失时，向服务器请求最新的i18n数据，这里要注意要避免因服务器也缺失导致的无限请求
     * @param ns
     */
    Locales.prototype.loadData = function (key) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, ns, key2, currentI18ns, filters, newI18ns;
            var _this = this;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.ignoreMiss) {
                            return [2 /*return*/];
                        }
                        _a = tslib_1.__read(key.split(':'), 2), ns = _a[0], key2 = _a[1];
                        currentI18ns = this.cache.get('i18n', {
                            data: {
                                id: 1,
                                $$updateAt$$: 1,
                            },
                            filter: {
                                namespace: ns,
                                language: {
                                    $in: [this.language, this.defaultLng].filter(function (ele) { return !!ele; })
                                },
                            }
                        });
                        filters = [this.language, this.defaultLng].map(function (ele) {
                            var current = currentI18ns.find(function (ele2) { return ele2.namespace === ele; });
                            if (current) {
                                return {
                                    namespace: ele,
                                    $$updateAt$$: {
                                        $gt: current.$$updateAt$$,
                                    },
                                };
                            }
                            return {
                                namespace: ele,
                            };
                        });
                        return [4 /*yield*/, this.cache.refresh('i18n', {
                                data: {
                                    id: 1,
                                    data: 1,
                                    namespace: 1,
                                    language: 1,
                                    $$createAt$$: 1,
                                    $$updateAt$$: 1,
                                },
                                filter: {
                                    $or: filters,
                                }
                            }, undefined, undefined, undefined, true)];
                    case 1:
                        newI18ns = (_b.sent()).data;
                        if (newI18ns.length > 0) {
                            newI18ns.forEach(function (_a) {
                                var _b;
                                var namespace = _a.namespace, data = _a.data, language = _a.language;
                                if (_this.dataset[language]) {
                                    _this.dataset[language][namespace] = data;
                                }
                                else {
                                    _this.dataset[language] = (_b = {},
                                        _b[namespace] = data,
                                        _b);
                                }
                            });
                            this.publish();
                        }
                        else {
                            console.warn("\u547D\u540D\u7A7A\u95F4".concat(ns, "\u4E2D\u7684").concat(key, "\u7F3A\u5931\u4E14\u8BF7\u6C42\u4E0D\u5230\u66F4\u65B0\u7684\u6570\u636E\uFF0C\u8BF7\u68C0\u67E5"));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Locales.prototype.t = function (key, params) {
        return (0, i18n_1.t)(key, this.dataset, this.language, this.defaultLng, params);
    };
    // 需要暴露给小程序
    Locales.prototype.getDataSet = function () {
        return {
            lng: this.language,
            defaultLng: this.defaultLng,
            dataset: this.dataset,
        };
    };
    // 查看有无某值，不触发获取数据
    Locales.prototype.hasKey = function (key, params) {
        this.ignoreMiss = true;
        var result = (0, i18n_1.t)(key, this.dataset, this.language, undefined, params);
        this.ignoreMiss = false;
        return result;
    };
    // 这个是临时的代码（和locales没有关系），等和auth线合并了再移到合适的feature里去
    Locales.prototype.makeBridgeUrl = function (url, headers) {
        if (this.makeBridgeUrlFn) {
            return this.makeBridgeUrlFn(url, headers);
        }
        console.warn('development模式下无法使用bridge，直接使用原始url', url);
        return url;
    };
    return Locales;
}(Feature_1.Feature));
exports.Locales = Locales;
