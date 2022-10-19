"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComponent = void 0;
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
/// <reference path="../node_modules/@types/wechat-miniprogram/index.d.ts" />
var assert_1 = tslib_1.__importDefault(require("assert"));
var react_1 = tslib_1.__importDefault(require("react"));
var web_1 = require("./platforms/web");
var lodash_1 = require("oak-domain/lib/utils/lodash");
var page_common_1 = require("./page.common");
var OakComponentBase = /** @class */ (function (_super) {
    tslib_1.__extends(OakComponentBase, _super);
    function OakComponentBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    OakComponentBase.prototype.subscribe = function () {
        page_common_1.subscribe.call(this);
    };
    OakComponentBase.prototype.unsubscribe = function () {
        page_common_1.unsubscribe.call(this);
    };
    OakComponentBase.prototype.onPathSet = function () {
        page_common_1.onPathSet.call(this, this.option);
    };
    OakComponentBase.prototype.triggerEvent = function (name, detail, options) {
    };
    OakComponentBase.prototype.sub = function (type, callback) {
        this.features.eventBus.sub(type, callback);
    };
    OakComponentBase.prototype.unsub = function (type, callback) {
        this.features.eventBus.unsub(type, callback);
    };
    OakComponentBase.prototype.pub = function (type, options) {
        this.features.eventBus.pub(type, options);
    };
    OakComponentBase.prototype.unsubAll = function (type) {
        this.features.eventBus.unsubAll(type);
    };
    OakComponentBase.prototype.save = function (key, item) {
        this.features.localStorage.save(key, item);
    };
    OakComponentBase.prototype.load = function (key) {
        return this.features.localStorage.load(key);
    };
    OakComponentBase.prototype.clear = function () {
        this.features.localStorage.clear();
    };
    OakComponentBase.prototype.resolveInput = function (input, keys) {
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
    };
    OakComponentBase.prototype.setNotification = function (data) {
        this.features.notification.setNotification(data);
    };
    OakComponentBase.prototype.consumeNotification = function () {
        return this.features.notification.consumeNotification();
    };
    OakComponentBase.prototype.setMessage = function (data) {
        this.features.message.setMessage(data);
    };
    OakComponentBase.prototype.consumeMessage = function () {
        return this.features.message.consumeMessage();
    };
    OakComponentBase.prototype.reRender = function (extra) {
        return page_common_1.reRender.call(this, this.option, extra);
    };
    OakComponentBase.prototype.navigateTo = function (options, state, disableNamespace) {
        var url = options.url, rest = tslib_1.__rest(options, ["url"]);
        var url2 = url.includes('?')
            ? url.concat(this.state.oakFullpath
                ? "&oakFrom=".concat(this.state.oakFullpath)
                : '')
            : url.concat(this.state.oakFullpath ? "?oakFrom=".concat(this.state.oakFullpath) : '');
        for (var param in rest) {
            var param2 = param;
            if (rest[param2] !== undefined) {
                url2 += "".concat(url2.includes('?') ? '&' : '?').concat(param, "=").concat(typeof rest[param2] === 'string'
                    ? rest[param2]
                    : JSON.stringify(rest[param2]));
            }
        }
        // 路由传入namespace
        if (!disableNamespace && this.props.namespace) {
            url2 =
                (this.props.namespace.startsWith('/') ? '' : '/') +
                    (this.props.namespace === '/' ? '' : this.props.namespace) +
                    (url2.startsWith('/') ? '' : '/') +
                    url2;
        }
        return this.props.navigate(url2, { replace: false, state: state });
    };
    OakComponentBase.prototype.navigateBack = function (option) {
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
    };
    OakComponentBase.prototype.redirectTo = function (options, state, disableNamespace) {
        var url = options.url, rest = tslib_1.__rest(options, ["url"]);
        var url2 = url.includes('?')
            ? url.concat(this.state.oakFullpath
                ? "&oakFrom=".concat(this.state.oakFullpath)
                : '')
            : url.concat(this.state.oakFullpath
                ? "?oakFrom=".concat(this.state.oakFullpath)
                : '');
        for (var param in rest) {
            var param2 = param;
            if (rest[param2] !== undefined) {
                url2 += "".concat(url2.includes('?') ? '&' : '?').concat(param, "=").concat(typeof rest[param2] === 'string'
                    ? rest[param2]
                    : JSON.stringify(rest[param2]));
            }
        }
        // 路由传入namespace
        if (!disableNamespace && this.props.namespace) {
            url2 =
                (this.props.namespace.startsWith('/') ? '' : '/') +
                    (this.props.namespace === '/' ? '' : this.props.namespace) +
                    (url2.startsWith('/') ? '' : '/') +
                    url2;
        }
        return this.props.navigate(url2, { replace: true, state: state });
    };
    OakComponentBase.prototype.setProps = function (props, usingState) {
        var url = window.location.pathname;
        if (usingState) {
            return this.props.navigate(url, { replace: true, state: props });
        }
        else {
            // 这里nodejs的url用不了，先简单写一个
            var url2 = void 0;
            var search = window.location.search;
            if (!search) {
                var search_1 = '';
                for (var k in props) {
                    if (search_1) {
                        search_1 + '&';
                    }
                    if (props[k] !== undefined) {
                        search_1 += "".concat(k, "=").concat(typeof props[k] === 'string' ? props[k] : JSON.stringify(props[k]));
                    }
                }
                url2 = "".concat(url, "?").concat(search_1);
            }
            else {
                (0, assert_1.default)(search.startsWith('?'));
                var searchParams = search.slice(1).split('&');
                var _loop_1 = function (k) {
                    var origin_1 = searchParams.find(function (ele) { return ele.startsWith("".concat(k, "=")); });
                    if (origin_1) {
                        var idx = searchParams.indexOf(origin_1);
                        searchParams.splice(idx, 1);
                        searchParams.push("".concat(k, "=").concat(typeof props[k] === 'string' ? props[k] : JSON.stringify(props[k])));
                    }
                    else {
                        searchParams.push("".concat(k, "=").concat(typeof props[k] === 'string' ? props[k] : JSON.stringify(props[k])));
                    }
                };
                for (var k in props) {
                    _loop_1(k);
                }
                url2 = "".concat(url, "?").concat(searchParams.join('&'));
            }
            return this.props.navigate(url2, { replace: true });
        }
    };
    OakComponentBase.prototype.addOperation = function (operation, beforeExecute, afterExecute) {
        return this.features.runningTree.addOperation(this.state.oakFullpath, operation, beforeExecute, afterExecute);
    };
    OakComponentBase.prototype.cleanOperation = function () {
        return this.features.runningTree.clean(this.state.oakFullpath);
    };
    OakComponentBase.prototype.t = function (key, params) {
        return this.props.t(key, params);
    };
    OakComponentBase.prototype.callPicker = function (attr, params) {
        if (params === void 0) { params = {}; }
        return page_common_1.callPicker.call(this, attr, params);
    };
    OakComponentBase.prototype.execute = function () {
        return page_common_1.execute.call(this);
    };
    OakComponentBase.prototype.checkOperation = function (entity, action, filter, checkerTypes) {
        return this.features.cache.checkOperation(entity, action, filter, checkerTypes);
    };
    OakComponentBase.prototype.tryExecute = function () {
        return this.features.runningTree.tryExecute(this.state.oakFullpath);
    };
    OakComponentBase.prototype.refresh = function () {
        return page_common_1.refresh.call(this);
    };
    OakComponentBase.prototype.setUpdateData = function (attr, data) {
        return page_common_1.setUpdateData.call(this, attr, data);
    };
    OakComponentBase.prototype.loadMore = function () {
        return page_common_1.loadMore.call(this);
    };
    OakComponentBase.prototype.setId = function (id) {
        return this.features.runningTree.setId(this.state.oakFullpath, id);
    };
    OakComponentBase.prototype.setFilters = function (filters) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.features.runningTree.setNamedFilters(this.state.oakFullpath, filters)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    OakComponentBase.prototype.getFilters = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var namedFilters, filters;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.state.oakFullpath) return [3 /*break*/, 2];
                        namedFilters = this.features.runningTree.getNamedFilters(this.state.oakFullpath);
                        return [4 /*yield*/, Promise.all(namedFilters.map(function (_a) {
                                var filter = _a.filter;
                                if (typeof filter === 'function') {
                                    return filter();
                                }
                                return filter;
                            }))];
                    case 1:
                        filters = _a.sent();
                        return [2 /*return*/, filters];
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    OakComponentBase.prototype.getFilterByName = function (name) {
        if (this.state.oakFullpath) {
            var filter = this.features.runningTree.getNamedFilterByName(this.state.oakFullpath, name);
            if (filter === null || filter === void 0 ? void 0 : filter.filter) {
                if (typeof filter.filter === 'function') {
                    return filter.filter();
                }
                return filter.filter;
            }
        }
    };
    OakComponentBase.prototype.addNamedFilter = function (namedFilter, refresh) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.features.runningTree.addNamedFilter(this.state.oakFullpath, namedFilter, refresh)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    OakComponentBase.prototype.removeNamedFilter = function (namedFilter, refresh) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.features.runningTree.removeNamedFilter(this.state.oakFullpath, namedFilter, refresh)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    OakComponentBase.prototype.removeNamedFilterByName = function (name, refresh) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.features.runningTree.removeNamedFilterByName(this.state.oakFullpath, name, refresh)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    OakComponentBase.prototype.setNamedSorters = function (namedSorters) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.features.runningTree.setNamedSorters(this.state.oakFullpath, namedSorters)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    OakComponentBase.prototype.getSorters = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var namedSorters, sorters;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.state.oakFullpath) return [3 /*break*/, 2];
                        namedSorters = this.features.runningTree.getNamedSorters(this.state.oakFullpath);
                        return [4 /*yield*/, Promise.all(namedSorters.map(function (_a) {
                                var sorter = _a.sorter;
                                if (typeof sorter === 'function') {
                                    return sorter();
                                }
                                return sorter;
                            }))];
                    case 1:
                        sorters = (_a.sent()).filter(function (ele) { return !!ele; });
                        return [2 /*return*/, sorters];
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    OakComponentBase.prototype.getSorterByName = function (name) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var sorter;
            return tslib_1.__generator(this, function (_a) {
                if (this.state.oakFullpath) {
                    sorter = this.features.runningTree.getNamedSorterByName(this.state.oakFullpath, name);
                    if (sorter === null || sorter === void 0 ? void 0 : sorter.sorter) {
                        if (typeof sorter.sorter === 'function') {
                            return [2 /*return*/, sorter.sorter()];
                        }
                        return [2 /*return*/, sorter.sorter];
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    OakComponentBase.prototype.addNamedSorter = function (namedSorter, refresh) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.features.runningTree.addNamedSorter(this.state.oakFullpath, namedSorter, refresh)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    OakComponentBase.prototype.removeNamedSorter = function (namedSorter, refresh) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.features.runningTree.removeNamedSorter(this.state.oakFullpath, namedSorter, refresh)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    OakComponentBase.prototype.removeNamedSorterByName = function (name, refresh) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.features.runningTree.removeNamedSorterByName(this.state.oakFullpath, name, refresh)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    OakComponentBase.prototype.getPagination = function () {
        if (this.state.oakFullpath) {
            return this.features.runningTree.getPagination(this.state.oakFullpath);
        }
    };
    OakComponentBase.prototype.setPageSize = function (pageSize) {
        this.features.runningTree.setPageSize(this.state.oakFullpath, pageSize);
    };
    OakComponentBase.prototype.setCurrentPage = function (currentPage) {
        (0, assert_1.default)(currentPage !== 0);
        if (this.state.oakEntity && this.state.oakFullpath) {
            this.features.runningTree.setCurrentPage(this.state.oakFullpath, currentPage);
        }
    };
    return OakComponentBase;
}(react_1.default.PureComponent));
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
                        if ((0, lodash_1.get)(props, k) !== (0, lodash_1.get)(prevProps, k) ||
                            (0, lodash_1.get)(state, k) !== (0, lodash_1.get)(prevState, k)) {
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
                            args.push((0, lodash_1.get)(props, k) === undefined
                                ? (0, lodash_1.get)(state, k)
                                : (0, lodash_1.get)(props, k));
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
        },
    };
}
var DEFAULT_REACH_BOTTOM_DISTANCE = 50;
function createComponent(option, features, exceptionRouterDict) {
    var _a = option, data = _a.data, projection = _a.projection, properties = _a.properties, entity = _a.entity, methods = _a.methods, lifetimes = _a.lifetimes, observers = _a.observers, render = _a.render, path = _a.path;
    var fn = translateObservers(observers).fn;
    var OakComponentWrapper = /** @class */ (function (_super) {
        tslib_1.__extends(OakComponentWrapper, _super);
        function OakComponentWrapper(props) {
            var _a;
            var _this = _super.call(this, props) || this;
            _this.features = features;
            _this.option = option;
            _this.isReachBottom = false;
            _this.scrollEvent = function () {
                _this.checkReachBottom();
            };
            if (methods) {
                for (var m in methods) {
                    Object.assign(_this, (_a = {},
                        _a[m] = methods[m].bind(_this),
                        _a));
                }
            }
            _this.state = Object.assign({}, data, {
                oakLoading: false,
                oakLoadingMore: false,
                oakIsReady: false,
                oakExeucting: false,
                oakDirty: false,
            });
            (lifetimes === null || lifetimes === void 0 ? void 0 : lifetimes.created) && lifetimes.created.call(_this);
            return _this;
        }
        // todo 这里还需要根据path和location来判断自己是不是page
        OakComponentWrapper.prototype.iAmThePage = function () {
            return !!path;
        };
        OakComponentWrapper.prototype.supportPullDownRefresh = function () {
            return this.props.width === 'xs' && this.iAmThePage();
        };
        OakComponentWrapper.prototype.registerPageScroll = function () {
            var _a = this.props.useBodyScroll, useBodyScroll = _a === void 0 ? false : _a;
            if (useBodyScroll) {
                window.addEventListener('scroll', this.scrollEvent);
            }
            else {
                this.lv && this.lv.addEventListener('scroll', this.scrollEvent);
            }
        };
        OakComponentWrapper.prototype.unregisterPageScroll = function () {
            var _a = this.props.useBodyScroll, useBodyScroll = _a === void 0 ? false : _a;
            if (useBodyScroll) {
                window.removeEventListener('scroll', this.scrollEvent);
            }
            else {
                this.lv && this.lv.removeEventListener('scroll', this.scrollEvent);
            }
        };
        OakComponentWrapper.prototype.checkReachBottom = function () {
            if (!this.supportPullDownRefresh()) {
                return;
            }
            var isCurrentReachBottom = document.body.scrollHeight -
                (window.innerHeight + window.scrollY) <=
                DEFAULT_REACH_BOTTOM_DISTANCE;
            if (!this.isReachBottom && isCurrentReachBottom && option.isList) {
                this.isReachBottom = true;
                // 执行触底事件
                this.loadMore();
                return;
            }
            this.isReachBottom = isCurrentReachBottom;
        };
        OakComponentWrapper.prototype.componentDidMount = function () {
            this.registerPageScroll();
            this.subscribe();
            var oakPath = this.props.oakPath;
            if (oakPath || this.iAmThePage() && path) {
                this.onPathSet();
            }
            else {
                this.reRender();
            }
            (lifetimes === null || lifetimes === void 0 ? void 0 : lifetimes.attached) && lifetimes.attached.call(this);
            (lifetimes === null || lifetimes === void 0 ? void 0 : lifetimes.ready) && lifetimes.ready.call(this);
            (lifetimes === null || lifetimes === void 0 ? void 0 : lifetimes.show) && lifetimes.show.call(this);
        };
        OakComponentWrapper.prototype.componentWillUnmount = function () {
            this.state.oakFullpath && this.features.runningTree.destroyNode(this.state.oakFullpath);
            (lifetimes === null || lifetimes === void 0 ? void 0 : lifetimes.detached) && lifetimes.detached.call(this);
            this.unsubscribe();
            this.unregisterPageScroll();
        };
        OakComponentWrapper.prototype.componentDidUpdate = function (prevProps, prevState) {
            if (!prevProps.oakPath && this.props.oakPath) {
                this.onPathSet();
            }
            if (this.props.oakId !== prevProps.oakId) {
                this.setId(this.props.oakId);
            }
            // todo 这里似乎还可能对oakProjection这些东西加以更新，等遇到再添加 by Xc
            fn && fn.call(this, prevProps, prevState);
        };
        OakComponentWrapper.prototype.render = function () {
            var _this = this;
            var Render = render.call(this);
            var oakLoading = this.state.oakLoading;
            var _a = this.props.useBodyScroll, useBodyScroll = _a === void 0 ? false : _a;
            if (this.supportPullDownRefresh()) {
                var child = react_1.default.cloneElement((0, jsx_runtime_1.jsx)(web_1.PullToRefresh, { onRefresh: function () {
                        _this.refresh();
                    }, refreshing: oakLoading, distanceToRefresh: DEFAULT_REACH_BOTTOM_DISTANCE, indicator: {
                        activate: this.t('common:ptrActivate'),
                        deactivate: this.t('common:ptrDeactivate'),
                        release: this.t('common:ptrRelease'),
                        finish: this.t('common:ptrFinish'),
                    } }), {
                    getScrollContainer: function () { return useBodyScroll ? document.body : _this.lv; },
                }, Render);
                return useBodyScroll ? (child) : ((0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ ref: function (el) { return (_this.lv = el); }, style: { height: '100%', overflow: 'auto' } }, { children: child })));
            }
            return Render;
        };
        return OakComponentWrapper;
    }(OakComponentBase));
    ;
    return (0, web_1.withRouter)(OakComponentWrapper, false, option.path);
}
exports.createComponent = createComponent;
