"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComponent = exports.createPage = void 0;
var React = __importStar(require("react"));
var PullToRefresh_1 = __importDefault(require("./platforms/web/PullToRefresh"));
var router_1 = __importDefault(require("./platforms/web/router"));
var lodash_1 = require("oak-domain/lib/utils/lodash");
var page_common_1 = require("./page.common");
function makeCommonComponentMethods(features, exceptionRouterDict, formData) {
    return __assign({ t: function (key, params) {
            //  common: {
            //        GREETING: 'Hello {{name}}, nice to see you.',
            //   },
            // t('common:GREETING', {name: "John Doe" })
            return this.props.t(key, params);
        }, resolveInput: function (input, keys) {
            var currentTarget = input.currentTarget, target = input.target;
            var value = Object.assign({}, currentTarget, target).value;
            var dataset = currentTarget.dataset;
            var result = {
                dataset: dataset,
                value: value,
            };
            if (keys) {
                keys.forEach(function (k) {
                    var _a;
                    return Object.assign(result, (_a = {},
                        _a[k] = target[k],
                        _a));
                });
            }
            return result;
        }, navigateBack: function (option) {
            var _this = this;
            var delta = (option || {}).delta;
            return new Promise(function (resolve, reject) {
                try {
                    _this.props.navigate(delta || -1);
                    resolve(undefined);
                }
                catch (err) {
                    reject(err);
                }
            });
        }, navigateTo: function (options, state) {
            var url = options.url, events = options.events, fail = options.fail, complete = options.complete, success = options.success, rest = __rest(options, ["url", "events", "fail", "complete", "success"]);
            var url2 = url.includes('?')
                ? url.concat("&oakFrom=".concat(this.state.oakFullpath))
                : url.concat("?oakFrom=".concat(this.state.oakFullpath));
            for (var param in rest) {
                var param2 = param;
                if (rest[param2] !== undefined) {
                    url2 += "&".concat(param, "=").concat(typeof rest[param2] === 'string'
                        ? rest[param2]
                        : JSON.stringify(rest[param2]));
                }
            }
            return this.props.navigate(url2, { replace: false, state: state });
        }, redirectTo: function (options, state) {
            var url = options.url, events = options.events, fail = options.fail, complete = options.complete, success = options.success, rest = __rest(options, ["url", "events", "fail", "complete", "success"]);
            var url2 = url.includes('?')
                ? url.concat("&oakFrom=".concat(this.state.oakFullpath))
                : url.concat("?oakFrom=".concat(this.state.oakFullpath));
            for (var param in rest) {
                var param2 = param;
                if (rest[param2] !== undefined) {
                    url2 += "&".concat(param, "=").concat(typeof rest[param2] === 'string'
                        ? rest[param2]
                        : JSON.stringify(rest[param2]));
                }
            }
            return this.props.navigate(url2, { replace: true, state: state });
        } }, (0, page_common_1.makeCommonComponentMethods)(features, exceptionRouterDict, formData));
}
function makePageMethods(features, options, context) {
    var _a = (0, page_common_1.makePageMethods)(features, options, context), onPullDownRefresh = _a.onPullDownRefresh, rest = __rest(_a, ["onPullDownRefresh"]);
    return __assign({ onPullDownRefresh: function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, onPullDownRefresh.call(this)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        } }, rest);
}
function translateObservers(observers) {
    return {
        fn: function (prevProps, prevState) {
            var e_1, _a, e_2, _b;
            var _c = this, state = _c.state, props = _c.props;
            for (var obs in observers) {
                var keys = obs.split(',').map(function (ele) { return ele.trim(); });
                var changed = false;
                try {
                    for (var keys_1 = (e_1 = void 0, __values(keys)), keys_1_1 = keys_1.next(); !keys_1_1.done; keys_1_1 = keys_1.next()) {
                        var k = keys_1_1.value;
                        if (k.includes('*')) {
                            throw new Error('web模式下带*的observer通配符暂不支持');
                        }
                        if ((0, lodash_1.get)(props, k) !== (0, lodash_1.get)(prevProps, k) || (0, lodash_1.get)(state, k) !== (0, lodash_1.get)(prevState, k)) {
                            changed = true;
                            break;
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (keys_1_1 && !keys_1_1.done && (_a = keys_1.return)) _a.call(keys_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                var args = [];
                if (changed) {
                    try {
                        for (var keys_2 = (e_2 = void 0, __values(keys)), keys_2_1 = keys_2.next(); !keys_2_1.done; keys_2_1 = keys_2.next()) {
                            var k = keys_2_1.value;
                            args.push((0, lodash_1.get)(props, k) === undefined ? (0, lodash_1.get)(state, k) : (0, lodash_1.get)(props, k));
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (keys_2_1 && !keys_2_1.done && (_b = keys_2.return)) _b.call(keys_2);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                    observers[obs].apply(this, args);
                }
            }
        }
    };
}
function makeMiniprogramCompatibleFunctions() {
    return {
        triggerEvent: function (name, detail, option) {
            throw new Error('method not implemented yet');
        },
        animate: function (selector, frames, duration, timeline) {
            throw new Error('method not implemented yet');
        },
        clearAnimation: function (selector, option, callback) {
            throw new Error('method not implemented yet');
        }
    };
}
var DEFAULT_REACH_BOTTOM_DISTANCE = 50;
function createPage(options, features, exceptionRouterDict, context) {
    var _a = options, formData = _a.formData, isList = _a.isList, render = _a.render;
    var hiddenMethods = (0, page_common_1.makeHiddenComponentMethods)();
    var commonMethods = makeCommonComponentMethods(features, exceptionRouterDict, formData);
    var listMethods = (0, page_common_1.makeListComponentMethods)(features);
    var _b = makePageMethods(features, options, context), onLoad = _b.onLoad, onPullDownRefresh = _b.onPullDownRefresh, onReachBottom = _b.onReachBottom, restPageMethods = __rest(_b, ["onLoad", "onPullDownRefresh", "onReachBottom"]);
    var methods = options.methods, lifetimes = options.lifetimes, pageLifetimes = options.pageLifetimes, data = options.data, observers = options.observers;
    var fn = translateObservers(observers).fn;
    var OakPageWrapper = /** @class */ (function (_super) {
        __extends(OakPageWrapper, _super);
        function OakPageWrapper(props) {
            var _a, _b, _c, _d;
            var _this = _super.call(this, props) || this;
            _this.features = features;
            _this.isReachBottom = false;
            _this.componentDidUpdate = fn;
            _this.scrollEvent = function () {
                _this.checkReachBottom();
                var event = { scrollTop: window.scrollY };
            };
            _this.state = (data || {});
            /* for (const m in hiddenMethods) {
                Object.assign(this, {
                    [m]: hiddenMethods[m as keyof typeof hiddenMethods]!.bind(this),
                });
            } */
            for (var m in commonMethods) {
                Object.assign(_this, (_a = {},
                    _a[m] = commonMethods[m].bind(_this),
                    _a));
            }
            for (var m in listMethods) {
                Object.assign(_this, (_b = {},
                    _b[m] = listMethods[m].bind(_this),
                    _b));
            }
            for (var m in restPageMethods) {
                Object.assign(_this, (_c = {},
                    _c[m] = restPageMethods[m].bind(_this),
                    _c));
            }
            if (methods) {
                var onPullDownRefresh_1 = methods.onPullDownRefresh, onReachBottom_1 = methods.onReachBottom, restMethods = __rest(methods, ["onPullDownRefresh", "onReachBottom"]);
                for (var m in restMethods) {
                    Object.assign(_this, (_d = {},
                        _d[m] = restMethods[m].bind(_this),
                        _d));
                }
            }
            context.setScene(options.path);
            (lifetimes === null || lifetimes === void 0 ? void 0 : lifetimes.created) && lifetimes.created.call(_this);
            return _this;
        }
        OakPageWrapper.prototype.registerPageScroll = function () {
            window.addEventListener('scroll', this.scrollEvent);
        };
        OakPageWrapper.prototype.unregisterPageScroll = function () {
            window.removeEventListener('scroll', this.scrollEvent);
        };
        OakPageWrapper.prototype.checkReachBottom = function () {
            var isCurrentReachBottom = document.body.scrollHeight -
                (window.innerHeight + window.scrollY) <=
                DEFAULT_REACH_BOTTOM_DISTANCE;
            if (!this.isReachBottom && isCurrentReachBottom) {
                this.isReachBottom = true;
                // 执行触底事件
                if (methods === null || methods === void 0 ? void 0 : methods.onReachBottom) {
                    methods.onReachBottom.call(this);
                    return;
                }
                if (this.props.width === 'xs') {
                    onReachBottom.call(this);
                }
                return;
            }
            this.isReachBottom = isCurrentReachBottom;
        };
        OakPageWrapper.prototype.componentDidMount = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.registerPageScroll();
                            hiddenMethods.subscribe.call(this);
                            return [4 /*yield*/, onLoad.call(this, this.props)];
                        case 1:
                            _a.sent();
                            (methods === null || methods === void 0 ? void 0 : methods.onLoad) && methods.onLoad.call(this, this.props);
                            (methods === null || methods === void 0 ? void 0 : methods.onReady) && methods.onReady.call(this);
                            (lifetimes === null || lifetimes === void 0 ? void 0 : lifetimes.attached) && lifetimes.attached.call(this);
                            (lifetimes === null || lifetimes === void 0 ? void 0 : lifetimes.ready) && lifetimes.ready.call(this);
                            (pageLifetimes === null || pageLifetimes === void 0 ? void 0 : pageLifetimes.show) && pageLifetimes.show.call(this);
                            return [2 /*return*/];
                    }
                });
            });
        };
        OakPageWrapper.prototype.componentWillUnmount = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    this.unregisterPageScroll();
                    if (this.state.oakFullpath) {
                        features.runningTree.destroyNode(this.state.oakFullpath);
                    }
                    hiddenMethods.unsubscribe.call(this);
                    (methods === null || methods === void 0 ? void 0 : methods.onUnload) && methods.onUnload.call(this);
                    (lifetimes === null || lifetimes === void 0 ? void 0 : lifetimes.detached) && lifetimes.detached.call(this);
                    return [2 /*return*/];
                });
            });
        };
        OakPageWrapper.prototype.render = function () {
            var _this = this;
            var Render = render.call(this);
            var oakLoading = this.state.oakLoading;
            return React.cloneElement(<PullToRefresh_1.default onRefresh={function () {
                    if (methods === null || methods === void 0 ? void 0 : methods.onPullDownRefresh) {
                        methods.onPullDownRefresh.call(_this);
                        return;
                    }
                    if (_this.props.width === 'xs') {
                        onPullDownRefresh.call(_this);
                    }
                }} refreshing={oakLoading} distanceToRefresh={DEFAULT_REACH_BOTTOM_DISTANCE} indicator={{
                    activate: commonMethods.t.call(this, 'common:ptrActivate'),
                    deactivate: commonMethods.t.call(this, 'common:ptrDeactivate'),
                    release: commonMethods.t.call(this, 'common:ptrRelease'),
                    finish: commonMethods.t.call(this, 'common:ptrFinish'),
                }}/>, {}, Render);
        };
        return OakPageWrapper;
    }(React.PureComponent));
    ;
    // 可能有问题，by Xc
    Object.assign(OakPageWrapper, makeMiniprogramCompatibleFunctions());
    return (0, router_1.default)(OakPageWrapper);
}
exports.createPage = createPage;
function createComponent(options, features, exceptionRouterDict, context) {
    var _a = options, formData = _a.formData, isList = _a.isList, entity = _a.entity, methods = _a.methods, lifetimes = _a.lifetimes, pageLifetimes = _a.pageLifetimes, data = _a.data, properties = _a.properties, observers = _a.observers, render = _a.render;
    var hiddenMethods = (0, page_common_1.makeHiddenComponentMethods)();
    var commonMethods = makeCommonComponentMethods(features, exceptionRouterDict, formData);
    var listMethods = (0, page_common_1.makeListComponentMethods)(features);
    var fn = translateObservers(observers).fn;
    var OakComponentWrapper = /** @class */ (function (_super) {
        __extends(OakComponentWrapper, _super);
        function OakComponentWrapper(props) {
            var _a, _b, _c;
            var _this = _super.call(this, props) || this;
            _this.features = features;
            _this.isReachBottom = false;
            _this.state = (data || {});
            /* for (const m in hiddenMethods) {
                Object.assign(this, {
                    [m]: hiddenMethods[m as keyof typeof hiddenMethods]!.bind(this),
                });
            } */
            for (var m in commonMethods) {
                Object.assign(_this, (_a = {},
                    _a[m] = commonMethods[m].bind(_this),
                    _a));
            }
            for (var m in listMethods) {
                Object.assign(_this, (_b = {},
                    _b[m] = listMethods[m].bind(_this),
                    _b));
            }
            if (methods) {
                for (var m in methods) {
                    Object.assign(_this, (_c = {},
                        _c[m] = methods[m].bind(_this),
                        _c));
                }
            }
            (lifetimes === null || lifetimes === void 0 ? void 0 : lifetimes.created) && lifetimes.created.call(_this);
            return _this;
        }
        OakComponentWrapper.prototype.componentDidMount = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, oakPath, oakParent, oakFullpath;
                var _this = this;
                return __generator(this, function (_b) {
                    hiddenMethods.subscribe.call(this);
                    _a = this.props, oakPath = _a.oakPath, oakParent = _a.oakParent;
                    if (oakParent && oakPath) {
                        oakFullpath = "".concat(oakParent, ".").concat(oakPath);
                        this.setState({
                            oakFullpath: oakFullpath,
                            oakEntity: entity,
                        }, function () {
                            commonMethods.reRender.call(_this);
                        });
                    }
                    (lifetimes === null || lifetimes === void 0 ? void 0 : lifetimes.attached) && lifetimes.attached.call(this);
                    (lifetimes === null || lifetimes === void 0 ? void 0 : lifetimes.ready) && lifetimes.ready.call(this);
                    (pageLifetimes === null || pageLifetimes === void 0 ? void 0 : pageLifetimes.show) && pageLifetimes.show.call(this);
                    return [2 /*return*/];
                });
            });
        };
        OakComponentWrapper.prototype.componentWillUnmount = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    hiddenMethods.unsubscribe.call(this);
                    (lifetimes === null || lifetimes === void 0 ? void 0 : lifetimes.detached) && lifetimes.detached.call(this);
                    return [2 /*return*/];
                });
            });
        };
        OakComponentWrapper.prototype.componentDidUpdate = function (prevProps, prevState) {
            if (this.props.oakPath &&
                prevProps.oakPath !== this.props.oakPath) {
                this.onPropsChanged({
                    path: this.props.oakPath,
                });
            }
            if (this.props.oakParent &&
                prevProps.oakParent !== this.props.oakParent) {
                this.onPropsChanged({
                    parent: this.props.oakParent,
                });
            }
            fn === null || fn === void 0 ? void 0 : fn.call(this, prevProps, prevState);
        };
        OakComponentWrapper.prototype.onPropsChanged = function (options) {
            return __awaiter(this, void 0, void 0, function () {
                var path2, parent2, oakFullpath2;
                return __generator(this, function (_a) {
                    path2 = options.hasOwnProperty('path')
                        ? options.path
                        : this.props.oakPath;
                    parent2 = options.hasOwnProperty('parent')
                        ? options.parent
                        : this.props.oakParent;
                    if (path2 && parent2) {
                        oakFullpath2 = "".concat(parent2, ".").concat(path2);
                        if (oakFullpath2 !== this.state.oakFullpath) {
                            this.setState({
                                oakFullpath: oakFullpath2,
                                oakEntity: entity,
                            });
                            commonMethods.reRender.call(this);
                        }
                    }
                    return [2 /*return*/];
                });
            });
        };
        OakComponentWrapper.prototype.render = function () {
            var Render = render.call(this);
            return Render;
        };
        OakComponentWrapper.prototype.triggerEvent = function (name, detail, options) {
            // 需要兼容
        };
        return OakComponentWrapper;
    }(React.PureComponent));
    ;
    // 可能有问题，by Xc
    Object.assign(OakComponentWrapper, makeMiniprogramCompatibleFunctions());
    return (0, router_1.default)(OakComponentWrapper);
}
exports.createComponent = createComponent;
