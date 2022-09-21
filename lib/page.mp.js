"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComponent = exports.createPage = void 0;
var tslib_1 = require("tslib");
var lodash_1 = require("oak-domain/lib/utils/lodash");
var url_1 = tslib_1.__importDefault(require("url"));
var assert_1 = require("oak-domain/lib/utils/assert");
var page_common_1 = require("./page.common");
var i18n_1 = require("./platforms/wechatMp/i18n");
function makeCommonComponentMethods(features, exceptionRouterDict, formData) {
    return tslib_1.__assign({ t: function (key, params) {
            //  common: {
            //        GREETING: 'Hello {{name}}, nice to see you.',
            //   },
            // t('common:GREETING', {name: "John Doe" })
            var i18nInstance = (0, i18n_1.getI18nInstanceWechatMp)();
            if (!i18nInstance) {
                throw new Error('[i18n] ensure run initI18nWechatMp() in app.js before using I18n library');
            }
            return i18nInstance.getString(key, params);
        }, resolveInput: function (input, keys) {
            var currentTarget = input.currentTarget, detail = input.detail;
            var dataset = currentTarget.dataset;
            var value = detail.value;
            var result = {
                dataset: dataset,
                value: value,
            };
            if (keys) {
                keys.forEach(function (k) {
                    var _a;
                    return Object.assign(result, (_a = {},
                        _a[k] = detail[k],
                        _a));
                });
            }
            return result;
        }, navigateBack: function (option) {
            return new Promise(function (resolve, reject) {
                wx.navigateBack(Object.assign({}, option, {
                    success: function () {
                        resolve(undefined);
                    },
                    fail: function (err) {
                        reject(err);
                    },
                }));
            });
        }, navigateTo: function (options, state) {
            var url = options.url, events = options.events, fail = options.fail, complete = options.complete, success = options.success, rest = tslib_1.__rest(options, ["url", "events", "fail", "complete", "success"]);
            var urlParse = url_1.default.parse(url, true);
            var _a = urlParse, pathname = _a.pathname, search = _a.search;
            if (!/^\/{1}/.test(pathname)) {
                (0, assert_1.assert)(false, 'url前面必须以/开头');
            }
            // 格式:/house/list 前面加上/pages 后面加上/index
            if ((pathname === null || pathname === void 0 ? void 0 : pathname.indexOf('pages')) !== -1 ||
                (pathname === null || pathname === void 0 ? void 0 : pathname.lastIndexOf('index')) !== -1) {
                (0, assert_1.assert)(false, 'url两边不需要加上/pages和/index');
            }
            var pathname2 = "/pages".concat(pathname, "/index");
            var search2 = search || '';
            search2 = search2.includes('?')
                ? search2.concat("&oakFrom=".concat(this.state.oakFullpath))
                : search2.concat("?oakFrom=".concat(this.state.oakFullpath));
            for (var param in rest) {
                var param2 = param;
                if (rest[param2] !== undefined) {
                    search2 += "&".concat(param, "=").concat(typeof rest[param2] === 'string'
                        ? rest[param2]
                        : JSON.stringify(rest[param2]));
                }
            }
            if (state) {
                for (var param in state) {
                    var param2 = param;
                    if (state[param2] !== undefined) {
                        search2 += "&".concat(param, "=").concat(typeof state[param2] === 'string'
                            ? state[param2]
                            : JSON.stringify(state[param2]));
                    }
                }
            }
            var url2 = url_1.default.format({
                pathname: pathname2,
                search: search2,
            });
            Object.assign(options, {
                url: url2,
            });
            return new Promise(function (resolve, reject) {
                wx.navigateTo(Object.assign({}, options, {
                    success: function (res) {
                        success && success(res);
                        resolve(undefined);
                    },
                    fail: function (err) {
                        fail && fail(err);
                        reject(err);
                    },
                }));
            });
        }, redirectTo: function (options, state) {
            var url = options.url, events = options.events, fail = options.fail, complete = options.complete, success = options.success, rest = tslib_1.__rest(options, ["url", "events", "fail", "complete", "success"]);
            var urlParse = url_1.default.parse(url, true);
            var _a = urlParse, pathname = _a.pathname, search = _a.search;
            if (!/^\/{1}/.test(pathname)) {
                (0, assert_1.assert)(false, 'url前面必须以/开头');
            }
            if (pathname.indexOf('pages') !== -1 ||
                pathname.lastIndexOf('index') !== -1) {
                (0, assert_1.assert)(false, 'url两边不需要加上/pages和/index');
            }
            // 格式:/house/list 前面加上/pages 后面加上/index
            var pathname2 = "/pages".concat(pathname, "/index");
            var search2 = search || '';
            search2 = search2.includes('?')
                ? search2.concat("&oakFrom=".concat(this.state.oakFullpath))
                : search2.concat("?oakFrom=".concat(this.state.oakFullpath));
            for (var param in rest) {
                var param2 = param;
                if (rest[param2] !== undefined) {
                    search2 += "&".concat(param, "=").concat(typeof rest[param2] === 'string'
                        ? rest[param2]
                        : JSON.stringify(rest[param2]));
                }
            }
            if (state) {
                for (var param in state) {
                    var param2 = param;
                    if (state[param2] !== undefined) {
                        search2 += "&".concat(param, "=").concat(typeof state[param2] === 'string'
                            ? state[param2]
                            : JSON.stringify(state[param2]));
                    }
                }
            }
            var url2 = url_1.default.format({
                pathname: pathname2,
                search: search2,
            });
            Object.assign(options, {
                url: url2,
            });
            return new Promise(function (resolve, reject) {
                wx.redirectTo(Object.assign({}, options, {
                    success: function (res) {
                        success && success(res);
                        resolve(undefined);
                    },
                    fail: function (err) {
                        fail && fail(err);
                        reject(err);
                    },
                }));
            });
        } }, (0, page_common_1.makeCommonComponentMethods)(features, exceptionRouterDict, formData));
}
function makePageMethods(features, options) {
    var _a = (0, page_common_1.makePageMethods)(features, options), onPullDownRefresh = _a.onPullDownRefresh, onLoad = _a.onLoad, rest = tslib_1.__rest(_a, ["onPullDownRefresh", "onLoad"]);
    return tslib_1.__assign({ onPullDownRefresh: function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, onPullDownRefresh.call(this)];
                        case 1:
                            _a.sent();
                            if (!!this.state.oakLoading) return [3 /*break*/, 3];
                            return [4 /*yield*/, wx.stopPullDownRefresh()];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        }, onLoad: function (pageOption) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var data, key;
                var _a;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            data = {};
                            if (!options.properties) return [3 /*break*/, 2];
                            for (key in options.properties) {
                                // Number和Boolean类型小程序框架能自动处理吗？实测中再改
                                if (typeof pageOption[key] === 'string' && options.properties[key] !== String) {
                                    Object.assign(data, (_a = {},
                                        _a[key] = JSON.parse(pageOption[key]),
                                        _a));
                                }
                            }
                            if (!(Object.keys(data).length > 0)) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.setState(data)];
                        case 1:
                            _b.sent();
                            _b.label = 2;
                        case 2: return [4 /*yield*/, onLoad.call(this, pageOption)];
                        case 3:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        } }, rest);
}
function createPage(options, features, exceptionRouterDict) {
    var formData = options.formData, isList = options.isList;
    var hiddenMethods = (0, page_common_1.makeHiddenComponentMethods)();
    var commonMethods = makeCommonComponentMethods(features, exceptionRouterDict, formData);
    var listMethods = (0, page_common_1.makeListComponentMethods)(features);
    var _a = makePageMethods(features, options), onLoad = _a.onLoad, onPullDownRefresh = _a.onPullDownRefresh, onReachBottom = _a.onReachBottom, restPageMethods = tslib_1.__rest(_a, ["onLoad", "onPullDownRefresh", "onReachBottom"]);
    var methods = options.methods, lifetimes = options.lifetimes, pageLifetimes = options.pageLifetimes;
    return Component({
        data: Object.assign({}, options.data, {
            oakFullpath: '',
        }),
        properties: Object.assign({}, options.properties, {
            oakEntity: String,
            oakId: String,
            oakPath: String,
            oakParent: String,
            oakProjection: String,
            oakFilters: String,
            oakSorters: String,
            oakIsPicker: Boolean,
            oakParentEntity: String,
            oakFrom: String,
            oakActions: String,
            newOakActions: Array,
        }),
        methods: tslib_1.__assign(tslib_1.__assign(tslib_1.__assign(tslib_1.__assign(tslib_1.__assign({ setState: function (data, callback) {
                var _this = this;
                this.setData(data, function () {
                    _this.state = _this.data;
                    _this.props = _this.data;
                    callback && callback.call(_this);
                });
            }, onLoad: function (pageOption) {
                return tslib_1.__awaiter(this, void 0, void 0, function () {
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                this.props = this.data;
                                return [4 /*yield*/, onLoad.call(this, pageOption)];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                });
            }, onPullDownRefresh: function () {
                return tslib_1.__awaiter(this, void 0, void 0, function () {
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, onPullDownRefresh.call(this)];
                            case 1:
                                _a.sent();
                                (methods === null || methods === void 0 ? void 0 : methods.onPullDownRefresh) &&
                                    (methods === null || methods === void 0 ? void 0 : methods.onPullDownRefresh.call(this));
                                return [2 /*return*/];
                        }
                    });
                });
            }, onReachBottom: function () {
                return tslib_1.__awaiter(this, void 0, void 0, function () {
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, onReachBottom.call(this)];
                            case 1:
                                _a.sent();
                                (methods === null || methods === void 0 ? void 0 : methods.onReachBottom) && (methods === null || methods === void 0 ? void 0 : methods.onReachBottom.call(this));
                                return [2 /*return*/];
                        }
                    });
                });
            } }, hiddenMethods), commonMethods), listMethods), restPageMethods), (methods
            ? (0, lodash_1.omit)(methods, [
                'onLoad',
                'onPullDownRefresh',
                'onReachBottom',
            ])
            : {})),
        lifetimes: {
            created: function () {
                var _this = this;
                var setData = this.setData;
                this.state = this.data;
                this.props = this.data;
                this.features = features;
                this.setData = function (data, callback) {
                    setData.call(_this, data, function () {
                        _this.state = _this.data;
                        _this.props = _this.data;
                        callback && callback.call(_this);
                    });
                };
                (lifetimes === null || lifetimes === void 0 ? void 0 : lifetimes.created) && lifetimes.created.call(this);
            },
            attached: function () {
                var _a;
                // this.subscribe();
                if (typeof formData === 'function') {
                    this.subscribe();
                }
                var i18nInstance = (0, i18n_1.getI18nInstanceWechatMp)();
                if (i18nInstance) {
                    this.setState((_a = {},
                        _a[i18n_1.CURRENT_LOCALE_KEY] = i18nInstance.currentLocale,
                        _a[i18n_1.CURRENT_LOCALE_DATA] = i18nInstance.translations,
                        _a));
                }
                (lifetimes === null || lifetimes === void 0 ? void 0 : lifetimes.attached) && lifetimes.attached.call(this);
            },
            ready: function () {
                if (typeof formData === 'function') {
                    this.reRender();
                }
                (lifetimes === null || lifetimes === void 0 ? void 0 : lifetimes.ready) && lifetimes.ready.call(this);
            },
            detached: function () {
                features.runningTree.destroyNode(this.data.oakFullpath);
                // this.unsubscribe();
                if (typeof formData === 'function') {
                    this.unsubscribe();
                }
                (lifetimes === null || lifetimes === void 0 ? void 0 : lifetimes.detached) && lifetimes.detached.call(this);
            },
            error: function (err) {
                console.error(err);
                (lifetimes === null || lifetimes === void 0 ? void 0 : lifetimes.error) && lifetimes.error.call(this, err);
            },
            moved: function () {
                (lifetimes === null || lifetimes === void 0 ? void 0 : lifetimes.moved) && lifetimes.moved.call(this);
            },
        },
        pageLifetimes: {
            show: function () {
                if (typeof formData === 'function') {
                    this.subscribe();
                    this.reRender();
                }
                // this.subscribe();
                // if (this.data.oakFullpath) {
                //     this.reRender();
                // }
                (pageLifetimes === null || pageLifetimes === void 0 ? void 0 : pageLifetimes.show) && pageLifetimes.show.call(this);
            },
            hide: function () {
                if (typeof formData === 'function') {
                    this.unsubscribe();
                }
                //this.unsubscribe();
                (pageLifetimes === null || pageLifetimes === void 0 ? void 0 : pageLifetimes.hide) && pageLifetimes.hide.call(this);
            },
            resize: function (size) {
                (pageLifetimes === null || pageLifetimes === void 0 ? void 0 : pageLifetimes.resize) && pageLifetimes.resize.call(this, size);
            },
        },
    });
}
exports.createPage = createPage;
function createComponent(options, features, exceptionRouterDict) {
    var formData = options.formData, isList = options.isList, entity = options.entity, methods = options.methods, lifetimes = options.lifetimes, pageLifetimes = options.pageLifetimes, data = options.data, properties = options.properties, actions = options.actions, observers = options.observers, restOptions = tslib_1.__rest(options, ["formData", "isList", "entity", "methods", "lifetimes", "pageLifetimes", "data", "properties", "actions", "observers"]);
    var hiddenMethods = (0, page_common_1.makeHiddenComponentMethods)();
    var commonMethods = makeCommonComponentMethods(features, exceptionRouterDict, formData);
    var listMethods = (0, page_common_1.makeListComponentMethods)(features);
    return Component(tslib_1.__assign({ data: Object.assign({}, data, {
            oakEntity: '',
            oakFullpath: '',
        }), properties: Object.assign({}, properties, {
            oakEntity: String,
            oakPath: String,
            oakParent: String,
        }), observers: tslib_1.__assign(tslib_1.__assign({}, observers), { oakPath: function (path) {
                this.onPropsChanged({
                    path: path,
                });
                (observers === null || observers === void 0 ? void 0 : observers.oakPath) && observers.oakPath.call(this, path);
            }, oakParent: function (parent) {
                this.onPropsChanged({
                    parent: parent,
                });
                (observers === null || observers === void 0 ? void 0 : observers.oakParent) && observers.oakParent.call(this, parent);
            } }), methods: tslib_1.__assign(tslib_1.__assign(tslib_1.__assign(tslib_1.__assign({ setState: function (data, callback) {
                var _this = this;
                this.setData(data, function () {
                    _this.state = _this.data;
                    _this.props = _this.data;
                    callback && callback();
                });
            }, onPropsChanged: function (options) {
                return tslib_1.__awaiter(this, void 0, void 0, function () {
                    var path2, parent2, oakFullpath2;
                    return tslib_1.__generator(this, function (_a) {
                        path2 = options.hasOwnProperty('path')
                            ? options.path
                            : this.data.oakPath;
                        parent2 = options.hasOwnProperty('parent')
                            ? options.parent
                            : this.data.oakParent;
                        if (path2 && parent2) {
                            oakFullpath2 = "".concat(parent2, ".").concat(path2);
                            if (oakFullpath2 !== this.data.oakFullpath) {
                                this.setState({
                                    oakFullpath: oakFullpath2,
                                    oakEntity: entity,
                                });
                                this.reRender();
                            }
                        }
                        return [2 /*return*/];
                    });
                });
            } }, hiddenMethods), commonMethods), listMethods), methods), lifetimes: {
            created: function () {
                return tslib_1.__awaiter(this, void 0, void 0, function () {
                    var setData;
                    var _this = this;
                    return tslib_1.__generator(this, function (_a) {
                        this.state = this.data;
                        this.props = this.data;
                        this.features = features;
                        setData = this.setData;
                        this.setData = function (data, callback) {
                            setData.call(_this, data, function () {
                                _this.state = _this.data;
                                _this.props = _this.data;
                                callback && callback.call(_this);
                            });
                        };
                        (lifetimes === null || lifetimes === void 0 ? void 0 : lifetimes.created) && lifetimes.created.call(this);
                        return [2 /*return*/];
                    });
                });
            },
            ready: function () {
                return tslib_1.__awaiter(this, void 0, void 0, function () {
                    var _a, oakPath, oakParent, oakFullpath;
                    return tslib_1.__generator(this, function (_b) {
                        _a = this.data, oakPath = _a.oakPath, oakParent = _a.oakParent;
                        if (oakParent && oakPath) {
                            oakFullpath = "".concat(oakParent, ".").concat(oakPath);
                            this.setState({
                                oakFullpath: oakFullpath,
                                oakEntity: entity,
                            }, function () {
                                //this.reRender();
                            });
                        }
                        if (typeof formData === 'function') {
                            this.reRender();
                        }
                        (lifetimes === null || lifetimes === void 0 ? void 0 : lifetimes.ready) && lifetimes.ready.call(this);
                        return [2 /*return*/];
                    });
                });
            },
            attached: function () {
                return tslib_1.__awaiter(this, void 0, void 0, function () {
                    var i18nInstance;
                    var _a;
                    return tslib_1.__generator(this, function (_b) {
                        //this.subscribe();
                        if (typeof formData === 'function') {
                            this.subscribe();
                        }
                        i18nInstance = (0, i18n_1.getI18nInstanceWechatMp)();
                        if (i18nInstance) {
                            this.setState((_a = {},
                                _a[i18n_1.CURRENT_LOCALE_KEY] = i18nInstance.currentLocale,
                                _a[i18n_1.CURRENT_LOCALE_DATA] = i18nInstance.translations,
                                _a));
                        }
                        (lifetimes === null || lifetimes === void 0 ? void 0 : lifetimes.attached) && lifetimes.attached.call(this);
                        return [2 /*return*/];
                    });
                });
            },
            detached: function () {
                return tslib_1.__awaiter(this, void 0, void 0, function () {
                    return tslib_1.__generator(this, function (_a) {
                        // this.unsubscribe();
                        if (typeof formData === 'function') {
                            this.unsubscribe();
                        }
                        (lifetimes === null || lifetimes === void 0 ? void 0 : lifetimes.detached) && lifetimes.detached.call(this);
                        return [2 /*return*/];
                    });
                });
            },
            error: function (err) {
                (lifetimes === null || lifetimes === void 0 ? void 0 : lifetimes.error) && lifetimes.error.call(this, err);
            },
            moved: function () {
                (lifetimes === null || lifetimes === void 0 ? void 0 : lifetimes.moved) && lifetimes.moved.call(this);
            },
        }, pageLifetimes: {
            show: function () {
                // this.subscribe();
                // if (this.data.oakFullpath) {
                //     this.reRender();
                // }
                if (typeof formData === 'function') {
                    this.subscribe();
                    this.reRender();
                }
                (pageLifetimes === null || pageLifetimes === void 0 ? void 0 : pageLifetimes.show) && pageLifetimes.show.call(this);
            },
            hide: function () {
                if (typeof formData === 'function') {
                    this.unsubscribe();
                }
                //this.unsubscribe();
                (pageLifetimes === null || pageLifetimes === void 0 ? void 0 : pageLifetimes.hide) && pageLifetimes.hide.call(this);
            },
            resize: function (size) {
                (pageLifetimes === null || pageLifetimes === void 0 ? void 0 : pageLifetimes.resize) && pageLifetimes.resize.call(this, size);
            },
        } }, restOptions));
}
exports.createComponent = createComponent;
