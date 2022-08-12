"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComponent = exports.createPage = void 0;
var lodash_1 = require("oak-domain/lib/utils/lodash");
var url_1 = __importDefault(require("url"));
var assert_1 = require("oak-domain/lib/utils/assert");
var page_common_1 = require("./page.common");
var i18n_1 = require("./platforms/wechatMp/i18n");
function makeCommonComponentMethods(features, exceptionRouterDict, formData) {
    return __assign({ t: function (key, params) {
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
            var url = options.url, events = options.events, fail = options.fail, complete = options.complete, success = options.success, rest = __rest(options, ["url", "events", "fail", "complete", "success"]);
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
            var url = options.url, events = options.events, fail = options.fail, complete = options.complete, success = options.success, rest = __rest(options, ["url", "events", "fail", "complete", "success"]);
            var urlParse = url_1.default.parse(url, true);
            var _a = urlParse, pathname = _a.pathname, search = _a.search;
            if (/^\//.test(pathname)) {
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
function makePageMethods(features, options, context) {
    var _a = (0, page_common_1.makePageMethods)(features, options, context), onPullDownRefresh = _a.onPullDownRefresh, onLoad = _a.onLoad, rest = __rest(_a, ["onPullDownRefresh", "onLoad"]);
    return __assign({ onPullDownRefresh: function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
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
            return __awaiter(this, void 0, void 0, function () {
                var data, key;
                var _a;
                return __generator(this, function (_b) {
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
function createPage(options, features, exceptionRouterDict, context) {
    var formData = options.formData, isList = options.isList;
    var hiddenMethods = (0, page_common_1.makeHiddenComponentMethods)();
    var commonMethods = makeCommonComponentMethods(features, exceptionRouterDict, formData);
    var listMethods = (0, page_common_1.makeListComponentMethods)(features);
    var _a = makePageMethods(features, options, context), onLoad = _a.onLoad, onPullDownRefresh = _a.onPullDownRefresh, onReachBottom = _a.onReachBottom, restPageMethods = __rest(_a, ["onLoad", "onPullDownRefresh", "onReachBottom"]);
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
        methods: __assign(__assign(__assign(__assign(__assign({ setState: function (data, callback) {
                var _this = this;
                this.setData(data, function () {
                    _this.state = _this.data;
                    _this.props = _this.data;
                    callback && callback.call(_this);
                });
            }, onLoad: function (pageOption) {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                this.props = this.data;
                                return [4 /*yield*/, onLoad.call(this, pageOption)];
                            case 1:
                                _a.sent();
                                (methods === null || methods === void 0 ? void 0 : methods.onLoad) && (methods === null || methods === void 0 ? void 0 : methods.onLoad.call(this, pageOption));
                                return [2 /*return*/];
                        }
                    });
                });
            }, onPullDownRefresh: function () {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
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
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
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
                this.subscribe();
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
                (lifetimes === null || lifetimes === void 0 ? void 0 : lifetimes.ready) && lifetimes.ready.call(this);
            },
            detached: function () {
                features.runningTree.destroyNode(this.data.oakFullpath);
                this.unsubscribe();
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
                this.subscribe();
                if (this.data.oakFullpath) {
                    context.setScene(this.data.oakFullpath);
                    this.reRender();
                }
                (pageLifetimes === null || pageLifetimes === void 0 ? void 0 : pageLifetimes.show) && pageLifetimes.show.call(this);
            },
            hide: function () {
                this.unsubscribe();
                (pageLifetimes === null || pageLifetimes === void 0 ? void 0 : pageLifetimes.hide) && pageLifetimes.hide.call(this);
            },
            resize: function (size) {
                (pageLifetimes === null || pageLifetimes === void 0 ? void 0 : pageLifetimes.resize) && pageLifetimes.resize.call(this, size);
            },
        },
    });
}
exports.createPage = createPage;
function createComponent(options, features, exceptionRouterDict, context) {
    var formData = options.formData, isList = options.isList, entity = options.entity, methods = options.methods, lifetimes = options.lifetimes, pageLifetimes = options.pageLifetimes, data = options.data, properties = options.properties, actions = options.actions, observers = options.observers, restOptions = __rest(options, ["formData", "isList", "entity", "methods", "lifetimes", "pageLifetimes", "data", "properties", "actions", "observers"]);
    var hiddenMethods = (0, page_common_1.makeHiddenComponentMethods)();
    var commonMethods = makeCommonComponentMethods(features, exceptionRouterDict, formData);
    var listMethods = (0, page_common_1.makeListComponentMethods)(features);
    return Component(__assign({ data: Object.assign({}, data, {
            oakEntity: '',
            oakFullpath: '',
        }), properties: Object.assign({}, properties, {
            oakEntity: String,
            oakPath: String,
            oakParent: String,
        }), observers: __assign(__assign({}, observers), { oakPath: function (path) {
                this.onPropsChanged({
                    path: path,
                });
                (observers === null || observers === void 0 ? void 0 : observers.oakPath) && observers.oakPath.call(this, path);
            }, oakParent: function (parent) {
                this.onPropsChanged({
                    parent: parent,
                });
                (observers === null || observers === void 0 ? void 0 : observers.oakParent) && observers.oakParent.call(this, parent);
            } }), methods: __assign(__assign(__assign(__assign({ setState: function (data, callback) {
                var _this = this;
                this.setData(data, function () {
                    _this.state = _this.data;
                    _this.props = _this.data;
                    callback && callback();
                });
            }, onPropsChanged: function (options) {
                return __awaiter(this, void 0, void 0, function () {
                    var path2, parent2, oakFullpath2;
                    return __generator(this, function (_a) {
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
                return __awaiter(this, void 0, void 0, function () {
                    var setData;
                    var _this = this;
                    return __generator(this, function (_a) {
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
                return __awaiter(this, void 0, void 0, function () {
                    var _a, oakPath, oakParent, oakFullpath;
                    return __generator(this, function (_b) {
                        _a = this.data, oakPath = _a.oakPath, oakParent = _a.oakParent;
                        if (oakParent && oakPath) {
                            oakFullpath = "".concat(oakParent, ".").concat(oakPath);
                            this.setState({
                                oakFullpath: oakFullpath,
                                oakEntity: entity,
                            });
                            this.reRender();
                        }
                        (lifetimes === null || lifetimes === void 0 ? void 0 : lifetimes.ready) && lifetimes.ready.call(this);
                        return [2 /*return*/];
                    });
                });
            },
            attached: function () {
                return __awaiter(this, void 0, void 0, function () {
                    var i18nInstance;
                    var _a;
                    return __generator(this, function (_b) {
                        this.subscribe();
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
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        this.unsubscribe();
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
                this.subscribe();
                if (this.data.oakFullpath) {
                    this.reRender();
                }
                (pageLifetimes === null || pageLifetimes === void 0 ? void 0 : pageLifetimes.show) && pageLifetimes.show.call(this);
            },
            hide: function () {
                this.unsubscribe();
                (pageLifetimes === null || pageLifetimes === void 0 ? void 0 : pageLifetimes.hide) && pageLifetimes.hide.call(this);
            },
            resize: function (size) {
                (pageLifetimes === null || pageLifetimes === void 0 ? void 0 : pageLifetimes.resize) && pageLifetimes.resize.call(this, size);
            },
        } }, restOptions));
}
exports.createComponent = createComponent;
