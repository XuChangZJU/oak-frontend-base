"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComponent = void 0;
var tslib_1 = require("tslib");
/// <reference path="../node_modules/@types/wechat-miniprogram/index.d.ts" />
var assert_1 = tslib_1.__importDefault(require("assert"));
var Feature_1 = require("./types/Feature");
var page_common_1 = require("./page.common");
var i18n_1 = require("./platforms/wechatMp/i18n");
var OakProperties = {
    oakId: String,
    oakPath: String,
    oakFilters: String,
    oakSorters: String,
    oakIsPicker: Boolean,
    oakParentEntity: String,
    oakFrom: String,
    oakActions: String,
    oakAutoUnmount: Boolean,
    oakDisablePulldownRefresh: Boolean,
};
function createComponent(option, features) {
    var path = option.path, data = option.data, properties = option.properties, methods = option.methods, lifetimes = option.lifetimes, observers = option.observers, actions = option.actions;
    var _a = lifetimes || {}, attached = _a.attached, show = _a.show, hide = _a.hide, created = _a.created, detached = _a.detached, restLifetimes = tslib_1.__rest(_a, ["attached", "show", "hide", "created", "detached"]);
    return Component({
        data: Object.assign({}, data, {
            oakFullpath: '',
        }),
        properties: Object.assign({}, properties, OakProperties),
        methods: tslib_1.__assign({ iAmThePage: function () {
                var pages = getCurrentPages();
                if (pages[0] === this) {
                    return true;
                }
                return false;
            }, subscribe: function () {
                var _this = this;
                this.subscribed = (0, Feature_1.subscribe)(function () { return _this.reRender(); });
            }, unsubscribe: function () {
                if (this.subscribed) {
                    this.subscribed();
                    this.subscribed = undefined;
                }
            }, setState: function (data, callback) {
                var _this = this;
                this.setData(data, function () {
                    _this.state = _this.data;
                    callback && callback.call(_this);
                });
            }, reRender: function () {
                page_common_1.reRender.call(this, option);
            }, onLoad: function (query) {
                return tslib_1.__awaiter(this, void 0, void 0, function () {
                    var assignProps, key, key;
                    var _this = this;
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                assignProps = function (data, property, type) {
                                    var _a;
                                    if (data[property]) {
                                        var value = data[property];
                                        if (typeof data[property] === 'string' && type !== String) {
                                            switch (type) {
                                                case Boolean: {
                                                    value = new Boolean(data[property]);
                                                    break;
                                                }
                                                case Number: {
                                                    value = new Number(data[property]);
                                                    break;
                                                }
                                                case Object: {
                                                    value = JSON.parse(data[property]);
                                                    break;
                                                }
                                                default: {
                                                    (0, assert_1.default)(false);
                                                }
                                            }
                                        }
                                        Object.assign(_this.props, (_a = {},
                                            _a[property] = value,
                                            _a));
                                    }
                                };
                                if (properties) {
                                    for (key in properties) {
                                        if (query[key]) {
                                            assignProps(query, key, properties[key]);
                                        }
                                        else {
                                            assignProps(this.data, key, properties[key]);
                                        }
                                    }
                                }
                                for (key in OakProperties) {
                                    if (query[key]) {
                                        assignProps(query, key, OakProperties[key]);
                                    }
                                    else {
                                        assignProps(this.data, key, OakProperties[key]);
                                    }
                                }
                                if (!(this.props.oakPath || (this.iAmThePage() && path))) return [3 /*break*/, 2];
                                return [4 /*yield*/, page_common_1.onPathSet.call(this, option)];
                            case 1:
                                _a.sent();
                                return [3 /*break*/, 3];
                            case 2:
                                this.reRender();
                                _a.label = 3;
                            case 3: return [2 /*return*/];
                        }
                    });
                });
            } }, methods),
        observers: {
            oakPath: function (data) {
                return tslib_1.__awaiter(this, void 0, void 0, function () {
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!data) return [3 /*break*/, 2];
                                return [4 /*yield*/, page_common_1.onPathSet.call(this, option)];
                            case 1:
                                _a.sent();
                                _a.label = 2;
                            case 2: return [2 /*return*/];
                        }
                    });
                });
            }
        },
        pageLifetimes: {
            show: function () {
                this.subscribe();
                this.reRender();
                show && show.call(this);
            },
            hide: function () {
                this.unsubscribe();
                hide && hide.call(this);
            }
        },
        lifetimes: tslib_1.__assign({ created: function () {
                var _this = this;
                var setData = this.setData;
                this.state = this.data;
                this.features = features;
                this.setData = function (data, callback) {
                    setData.call(_this, data, function () {
                        _this.state = _this.data;
                        callback && callback.call(_this);
                    });
                };
                created && created.call(this);
            }, attached: function () {
                var _a;
                var i18nInstance = (0, i18n_1.getI18nInstanceWechatMp)();
                if (i18nInstance) {
                    this.setState((_a = {},
                        _a[i18n_1.CURRENT_LOCALE_KEY] = i18nInstance.currentLocale,
                        _a[i18n_1.CURRENT_LOCALE_DATA] = i18nInstance.translations,
                        _a));
                }
                attached && attached.call(this);
            }, detached: function () {
                this.unsubscribe();
                detached && detached.call(this);
            } }, restLifetimes),
    });
}
exports.createComponent = createComponent;
