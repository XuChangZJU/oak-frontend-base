"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComponent = exports.createPage = void 0;
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var React = tslib_1.__importStar(require("react"));
var PullToRefresh_1 = tslib_1.__importDefault(require("./platforms/web/PullToRefresh"));
var router_1 = tslib_1.__importDefault(require("./platforms/web/router"));
var lodash_1 = require("oak-domain/lib/utils/lodash");
var page_common_1 = require("./page.common");
function makeCommonComponentMethods(features, exceptionRouterDict, formData) {
    return tslib_1.__assign({ t: function (key, params) {
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
            var url = options.url, events = options.events, fail = options.fail, complete = options.complete, success = options.success, rest = tslib_1.__rest(options, ["url", "events", "fail", "complete", "success"]);
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
            // 路由传入namespace
            if (this.props.namespace) {
                url2 = '/' + this.props.namespace + (url2.startsWith('/') ? '' : '/') + url2;
            }
            return this.props.navigate(url2, { replace: false, state: state });
        }, redirectTo: function (options, state) {
            var url = options.url, events = options.events, fail = options.fail, complete = options.complete, success = options.success, rest = tslib_1.__rest(options, ["url", "events", "fail", "complete", "success"]);
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
            // 路由传入namespace
            if (this.props.namespace) {
                url2 = '/' + this.props.namespace + (url2.startsWith('/') ? '' : '/') + url2;
            }
            return this.props.navigate(url2, { replace: true, state: state });
        } }, (0, page_common_1.makeCommonComponentMethods)(features, exceptionRouterDict, formData));
}
function makePageMethods(features, options, context) {
    var _a = (0, page_common_1.makePageMethods)(features, options, context), onPullDownRefresh = _a.onPullDownRefresh, rest = tslib_1.__rest(_a, ["onPullDownRefresh"]);
    return tslib_1.__assign({ onPullDownRefresh: function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
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
                    for (var keys_1 = (e_1 = void 0, tslib_1.__values(keys)), keys_1_1 = keys_1.next(); !keys_1_1.done; keys_1_1 = keys_1.next()) {
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
                        for (var keys_2 = (e_2 = void 0, tslib_1.__values(keys)), keys_2_1 = keys_2.next(); !keys_2_1.done; keys_2_1 = keys_2.next()) {
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
    var _b = makePageMethods(features, options, context), onLoad = _b.onLoad, onPullDownRefresh = _b.onPullDownRefresh, onReachBottom = _b.onReachBottom, restPageMethods = tslib_1.__rest(_b, ["onLoad", "onPullDownRefresh", "onReachBottom"]);
    var methods = options.methods, lifetimes = options.lifetimes, pageLifetimes = options.pageLifetimes, data = options.data, observers = options.observers;
    var fn = translateObservers(observers).fn;
    var OakPageWrapper = /** @class */ (function (_super) {
        tslib_1.__extends(OakPageWrapper, _super);
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
                var onPullDownRefresh_1 = methods.onPullDownRefresh, onReachBottom_1 = methods.onReachBottom, restMethods = tslib_1.__rest(methods, ["onPullDownRefresh", "onReachBottom"]);
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
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
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
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
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
            return React.cloneElement((0, jsx_runtime_1.jsx)(PullToRefresh_1.default, { onRefresh: function () {
                    if (methods === null || methods === void 0 ? void 0 : methods.onPullDownRefresh) {
                        methods.onPullDownRefresh.call(_this);
                        return;
                    }
                    if (_this.props.width === 'xs') {
                        onPullDownRefresh.call(_this);
                    }
                }, refreshing: oakLoading, distanceToRefresh: DEFAULT_REACH_BOTTOM_DISTANCE, indicator: {
                    activate: commonMethods.t.call(this, 'common:ptrActivate'),
                    deactivate: commonMethods.t.call(this, 'common:ptrDeactivate'),
                    release: commonMethods.t.call(this, 'common:ptrRelease'),
                    finish: commonMethods.t.call(this, 'common:ptrFinish'),
                } }), {}, Render);
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
        tslib_1.__extends(OakComponentWrapper, _super);
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
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _a, oakPath, oakParent, oakFullpath;
                var _this = this;
                return tslib_1.__generator(this, function (_b) {
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
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
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
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var path2, parent2, oakFullpath2;
                return tslib_1.__generator(this, function (_a) {
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
