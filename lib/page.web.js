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
    OakComponentBase.prototype.setDisablePulldownRefresh = function (able) {
        this.setState({
            oakDisablePulldownRefresh: able,
        });
    };
    OakComponentBase.prototype.onPathSet = function () {
        return page_common_1.onPathSet.call(this, this.oakOption);
    };
    OakComponentBase.prototype.triggerEvent = function (name, detail, options) { };
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
        return this.features.message.setMessage(data);
    };
    OakComponentBase.prototype.consumeMessage = function () {
        return this.features.message.consumeMessage();
    };
    OakComponentBase.prototype.reRender = function (extra) {
        return page_common_1.reRender.call(this, this.oakOption, extra);
    };
    OakComponentBase.prototype.navigateTo = function (options, state, disableNamespace) {
        // 路由传入namespace
        return this.features.navigator.navigateTo(options, state, disableNamespace);
    };
    OakComponentBase.prototype.navigateBack = function (delta) {
        return this.features.navigator.navigateBack(delta);
    };
    OakComponentBase.prototype.redirectTo = function (options, state, disableNamespace) {
        return this.features.navigator.redirectTo(options, state, disableNamespace);
    };
    OakComponentBase.prototype.switchTab = function (options, state, disableNamespace) {
        return this.features.navigator.switchTab(options, state, disableNamespace);
    };
    /* setProps(props: Record<string, any>, usingState?: true) {
        const url = window.location.pathname;
        const search = window.location.search;
        if (usingState) {
            return this.props.navigate(`${url}${search}`, { replace: true, state: props });
        }
        else {
            // 这里nodejs的url用不了，先简单写一个
            let url2: string;
            if (!search) {
                let search = '';
                for (const k in props) {
                    if (search) {
                        search + '&';
                    }
                    if (props[k] !== undefined) {
                        search += `${k}=${typeof props[k] === 'string' ? props[k] : JSON.stringify(props[k])}`;
                    }
                }
                url2 = `${url}?${search}`;
            }
            else {
                assert(search.startsWith('?'));
                const searchParams = search.slice(1).split('&');
                for (const k in props) {
                    const origin = searchParams.find(ele => ele.startsWith(`${k}=`));
                    if (origin) {
                        const idx = searchParams.indexOf(origin);
                        searchParams.splice(idx, 1);
                        searchParams.push(`${k}=${typeof props[k] === 'string' ? props[k] : JSON.stringify(props[k])}`);
                    }
                    else {
                        searchParams.push(`${k}=${typeof props[k] === 'string' ? props[k] : JSON.stringify(props[k])}`);
                    }
                }
                url2 = `${url}?${searchParams.join('&')}`;
            }
            return this.props.navigate(url2, { replace: true });
        }
    } */
    OakComponentBase.prototype.addItem = function (data, beforeExecute, afterExecute, path) {
        var path2 = path
            ? "".concat(this.state.oakFullpath, ".").concat(path)
            : this.state.oakFullpath;
        this.features.runningTree.addItem(this.state.oakFullpath, data, beforeExecute, afterExecute);
    };
    OakComponentBase.prototype.removeItem = function (id, beforeExecute, afterExecute, path) {
        var path2 = path
            ? "".concat(this.state.oakFullpath, ".").concat(path)
            : this.state.oakFullpath;
        this.features.runningTree.removeItem(path2, id, beforeExecute, afterExecute);
    };
    OakComponentBase.prototype.updateItem = function (data, id, action, beforeExecute, afterExecute, path) {
        var path2 = path
            ? "".concat(this.state.oakFullpath, ".").concat(path)
            : this.state.oakFullpath;
        this.features.runningTree.updateItem(path2, data, id, action, beforeExecute, afterExecute);
    };
    OakComponentBase.prototype.recoverItem = function (id, path) {
        var path2 = path
            ? "".concat(this.state.oakFullpath, ".").concat(path)
            : this.state.oakFullpath;
        this.features.runningTree.recoverItem(path2, id);
    };
    OakComponentBase.prototype.resetItem = function (id, path) {
        var path2 = path
            ? "".concat(this.state.oakFullpath, ".").concat(path)
            : this.state.oakFullpath;
        this.features.runningTree.resetItem(path2, id);
    };
    /* create<T extends keyof ED>(data: Omit<ED[T]['CreateSingle']['data'], 'id'>, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>) {
        this.features.runningTree.create(this.state.oakFullpath, data, beforeExecute, afterExecute);
    } */
    OakComponentBase.prototype.update = function (data, action, beforeExecute, afterExecute, path) {
        var path2 = path
            ? "".concat(this.state.oakFullpath, ".").concat(path)
            : this.state.oakFullpath;
        this.features.runningTree.update(path2, data, action, beforeExecute, afterExecute);
    };
    OakComponentBase.prototype.create = function (data, beforeExecute, afterExecute, path) {
        var path2 = path
            ? "".concat(this.state.oakFullpath, ".").concat(path)
            : this.state.oakFullpath;
        this.features.runningTree.create(path2, data, beforeExecute, afterExecute);
    };
    OakComponentBase.prototype.remove = function (beforeExecute, afterExecute, path) {
        var path2 = path
            ? "".concat(this.state.oakFullpath, ".").concat(path)
            : this.state.oakFullpath;
        this.features.runningTree.remove(path2, beforeExecute, afterExecute);
    };
    OakComponentBase.prototype.isCreation = function (path) {
        var path2 = path
            ? "".concat(this.state.oakFullpath, ".").concat(path)
            : this.state.oakFullpath;
        return this.features.runningTree.isCreation(path2);
    };
    OakComponentBase.prototype.clean = function (path) {
        var path2 = path
            ? "".concat(this.state.oakFullpath, ".").concat(path)
            : this.state.oakFullpath;
        this.features.runningTree.clean(path2);
    };
    OakComponentBase.prototype.t = function (key, params) {
        return this.features.locales.t(key, params);
    };
    OakComponentBase.prototype.execute = function (action, messageProps, path) {
        return page_common_1.execute.call(this, action, path, messageProps);
    };
    OakComponentBase.prototype.isDirty = function (path) {
        return this.features.runningTree.isDirty(path || this.state.oakFullpath);
    };
    OakComponentBase.prototype.getFreshValue = function (path) {
        var path2 = path
            ? "".concat(this.state.oakFullpath, ".").concat(path)
            : this.state.oakFullpath;
        return this.features.runningTree.getFreshValue(path2);
    };
    OakComponentBase.prototype.checkOperation = function (entity, action, data, filter, checkerTypes) {
        if (checkerTypes === null || checkerTypes === void 0 ? void 0 : checkerTypes.includes('relation')) {
            return this.features.relationAuth.checkRelation(entity, {
                action: action,
                data: data,
                filter: filter,
            }) && this.features.cache.checkOperation(entity, action, data, filter, checkerTypes);
        }
        return this.features.cache.checkOperation(entity, action, data, filter, checkerTypes);
    };
    OakComponentBase.prototype.tryExecute = function (path) {
        var path2 = path
            ? "".concat(this.state.oakFullpath, ".").concat(path)
            : this.state.oakFullpath;
        return this.features.runningTree.tryExecute(path2);
    };
    OakComponentBase.prototype.getOperations = function (path) {
        var path2 = path
            ? "".concat(this.state.oakFullpath, ".").concat(path)
            : this.state.oakFullpath;
        return this.features.runningTree.getOperations(path2);
    };
    OakComponentBase.prototype.refresh = function () {
        return page_common_1.refresh.call(this);
    };
    OakComponentBase.prototype.loadMore = function () {
        return page_common_1.loadMore.call(this);
    };
    OakComponentBase.prototype.setId = function (id) {
        return this.features.runningTree.setId(this.state.oakFullpath, id);
    };
    OakComponentBase.prototype.unsetId = function () {
        return this.features.runningTree.unsetId(this.state.oakFullpath);
    };
    OakComponentBase.prototype.getId = function (path) {
        var path2 = path
            ? "".concat(this.state.oakFullpath, ".").concat(path)
            : this.state.oakFullpath;
        return this.features.runningTree.getId(path2);
    };
    OakComponentBase.prototype.setFilters = function (filters, path) {
        var path2 = path
            ? "".concat(this.state.oakFullpath, ".").concat(path)
            : this.state.oakFullpath;
        this.features.runningTree.setNamedFilters(path2, filters);
    };
    OakComponentBase.prototype.setNamedFilters = function (filters, refresh, path) {
        var path2 = path
            ? "".concat(this.state.oakFullpath, ".").concat(path)
            : this.state.oakFullpath;
        this.features.runningTree.setNamedFilters(path2, filters, refresh);
    };
    OakComponentBase.prototype.getFilters = function (path) {
        if (this.state.oakFullpath) {
            var path2 = path
                ? "".concat(this.state.oakFullpath, ".").concat(path)
                : this.state.oakFullpath;
            var namedFilters = this.features.runningTree.getNamedFilters(path2);
            var filters = namedFilters.map(function (_a) {
                var filter = _a.filter;
                if (typeof filter === 'function') {
                    return filter();
                }
                return filter;
            });
            return filters;
        }
    };
    OakComponentBase.prototype.getFilterByName = function (name, path) {
        if (this.state.oakFullpath) {
            var path2 = path
                ? "".concat(this.state.oakFullpath, ".").concat(path)
                : this.state.oakFullpath;
            var filter = this.features.runningTree.getNamedFilterByName(path2, name);
            if (filter === null || filter === void 0 ? void 0 : filter.filter) {
                if (typeof filter.filter === 'function') {
                    return filter.filter();
                }
                return filter.filter;
            }
        }
    };
    OakComponentBase.prototype.addNamedFilter = function (namedFilter, refresh, path) {
        var path2 = path
            ? "".concat(this.state.oakFullpath, ".").concat(path)
            : this.state.oakFullpath;
        this.features.runningTree.addNamedFilter(path2, namedFilter, refresh);
    };
    OakComponentBase.prototype.removeNamedFilter = function (namedFilter, refresh, path) {
        var path2 = path
            ? "".concat(this.state.oakFullpath, ".").concat(path)
            : this.state.oakFullpath;
        this.features.runningTree.removeNamedFilter(path2, namedFilter, refresh);
    };
    OakComponentBase.prototype.removeNamedFilterByName = function (name, refresh, path) {
        var path2 = path
            ? "".concat(this.state.oakFullpath, ".").concat(path)
            : this.state.oakFullpath;
        this.features.runningTree.removeNamedFilterByName(path2, name, refresh);
    };
    OakComponentBase.prototype.setNamedSorters = function (namedSorters, refresh, path) {
        var path2 = path
            ? "".concat(this.state.oakFullpath, ".").concat(path)
            : this.state.oakFullpath;
        this.features.runningTree.setNamedSorters(path2, namedSorters, refresh);
    };
    OakComponentBase.prototype.getSorters = function (path) {
        if (this.state.oakFullpath) {
            var path2 = path
                ? "".concat(this.state.oakFullpath, ".").concat(path)
                : this.state.oakFullpath;
            var namedSorters = this.features.runningTree.getNamedSorters(path2);
            var sorters = namedSorters
                .map(function (_a) {
                var sorter = _a.sorter;
                if (typeof sorter === 'function') {
                    return sorter();
                }
                return sorter;
            })
                .filter(function (ele) { return !!ele; });
            return sorters;
        }
    };
    OakComponentBase.prototype.getSorterByName = function (name, path) {
        if (this.state.oakFullpath) {
            var path2 = path
                ? "".concat(this.state.oakFullpath, ".").concat(path)
                : this.state.oakFullpath;
            var sorter = this.features.runningTree.getNamedSorterByName(path2, name);
            if (sorter === null || sorter === void 0 ? void 0 : sorter.sorter) {
                if (typeof sorter.sorter === 'function') {
                    return sorter.sorter();
                }
                return sorter.sorter;
            }
        }
    };
    OakComponentBase.prototype.addNamedSorter = function (namedSorter, refresh, path) {
        var path2 = path
            ? "".concat(this.state.oakFullpath, ".").concat(path)
            : this.state.oakFullpath;
        this.features.runningTree.addNamedSorter(path2, namedSorter, refresh);
    };
    OakComponentBase.prototype.removeNamedSorter = function (namedSorter, refresh, path) {
        var path2 = path
            ? "".concat(this.state.oakFullpath, ".").concat(path)
            : this.state.oakFullpath;
        this.features.runningTree.removeNamedSorter(path2, namedSorter, refresh);
    };
    OakComponentBase.prototype.removeNamedSorterByName = function (name, refresh, path) {
        var path2 = path
            ? "".concat(this.state.oakFullpath, ".").concat(path)
            : this.state.oakFullpath;
        this.features.runningTree.removeNamedSorterByName(path2, name, refresh);
    };
    OakComponentBase.prototype.getPagination = function (path) {
        if (this.state.oakFullpath) {
            var path2 = path
                ? "".concat(this.state.oakFullpath, ".").concat(path)
                : this.state.oakFullpath;
            return this.features.runningTree.getPagination(path2);
        }
    };
    OakComponentBase.prototype.setPageSize = function (pageSize, path) {
        if (this.state.oakFullpath) {
            var path2 = path
                ? "".concat(this.state.oakFullpath, ".").concat(path)
                : this.state.oakFullpath;
            this.features.runningTree.setPageSize(path2, pageSize);
        }
    };
    OakComponentBase.prototype.setCurrentPage = function (currentPage, path) {
        (0, assert_1.default)(currentPage !== 0);
        if (this.state.oakEntity && this.state.oakFullpath) {
            var path2 = path
                ? "".concat(this.state.oakFullpath, ".").concat(path)
                : this.state.oakFullpath;
            this.features.runningTree.setCurrentPage(path2, currentPage);
        }
    };
    return OakComponentBase;
}(react_1.default.PureComponent));
function translateListeners(listeners) {
    return {
        fn: function (prevProps, prevState) {
            var e_1, _a, e_2, _b;
            var _c = this, state = _c.state, props = _c.props;
            for (var obs in listeners) {
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
                var prev = {};
                var next = {};
                if (changed) {
                    try {
                        for (var keys_2 = (e_2 = void 0, tslib_1.__values(keys)), keys_2_1 = keys_2.next(); !keys_2_1.done; keys_2_1 = keys_2.next()) {
                            var k = keys_2_1.value;
                            next[k] = (0, lodash_1.get)(props, k) === undefined
                                ? (0, lodash_1.get)(state, k)
                                : (0, lodash_1.get)(props, k);
                            prev[k] = (0, lodash_1.get)(prevProps, k) === undefined
                                ? (0, lodash_1.get)(prevState, k)
                                : (0, lodash_1.get)(prevProps, k);
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (keys_2_1 && !keys_2_1.done && (_b = keys_2.return)) _b.call(keys_2);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                    listeners && listeners[obs] && listeners[obs].call(this, prev, next);
                }
            }
        },
    };
}
var DEFAULT_REACH_BOTTOM_DISTANCE = 50;
function createComponent(option, features) {
    var _a = option, data = _a.data, methods = _a.methods, lifetimes = _a.lifetimes, getRender = _a.getRender, path = _a.path, listeners = _a.listeners;
    var fn = translateListeners(listeners).fn;
    var OakComponentWrapper = /** @class */ (function (_super) {
        tslib_1.__extends(OakComponentWrapper, _super);
        function OakComponentWrapper(props) {
            var _this = _super.call(this, props) || this;
            _this.features = features;
            _this.oakOption = option;
            _this.isReachBottom = false;
            _this.subscribed = [];
            _this.scrollEvent = function () {
                _this.checkReachBottom();
            };
            var methodProps = {
                setDisablePulldownRefresh: function (able) {
                    return _this.setDisablePulldownRefresh(able);
                },
                t: function (key, params) { return _this.t(key, params); },
                execute: function (action, messageProps, path) {
                    return _this.execute(action, messageProps, path);
                },
                isDirty: function (path) { return _this.isDirty(path); },
                aggregate: function (aggregation) {
                    return _this.features.cache.aggregate(_this.state.oakEntity, aggregation);
                },
                refresh: function () {
                    return _this.refresh();
                },
                setNotification: function (data) {
                    return _this.setNotification(data);
                },
                setMessage: function (data) {
                    return _this.setMessage(data);
                },
                navigateTo: function (options, state, disableNamespace) {
                    return _this.navigateTo(options, state, disableNamespace);
                },
                navigateBack: function (delta) {
                    return _this.navigateBack(delta);
                },
                redirectTo: function (options, state, disableNamespace) {
                    return _this.redirectTo(options, state, disableNamespace);
                },
                clean: function (path) {
                    return _this.clean(path);
                },
                checkOperation: function (entity, action, data, filter, checkerTypes) {
                    return _this.checkOperation(entity, action, data, filter, checkerTypes);
                }
            };
            Object.assign(methodProps, {
                addItem: function (data, beforeExecute, afterExecute, path) {
                    return _this.addItem(data, beforeExecute, afterExecute, path);
                },
                removeItem: function (id, beforeExecute, afterExecute, path) {
                    return _this.removeItem(id, beforeExecute, afterExecute, path);
                },
                updateItem: function (data, id, action, beforeExecute, afterExecute, path) {
                    return _this.updateItem(data, id, action, beforeExecute, afterExecute, path);
                },
                setFilters: function (filters, path) {
                    return _this.setFilters(filters, path);
                },
                setNamedFilters: function (filters, refresh, path) {
                    return _this.setNamedFilters(filters, refresh, path);
                },
                addNamedFilter: function (filter, refresh, path) {
                    return _this.addNamedFilter(filter, refresh, path);
                },
                removeNamedFilter: function (filter, refresh, path) {
                    return _this.removeNamedFilter(filter, refresh, path);
                },
                removeNamedFilterByName: function (name, refresh, path) {
                    return _this.removeNamedFilterByName(name, refresh, path);
                },
                setNamedSorters: function (sorters, refresh, path) {
                    return _this.setNamedSorters(sorters, refresh, path);
                },
                addNamedSorter: function (sorter, refresh, path) {
                    return _this.addNamedSorter(sorter, refresh, path);
                },
                removeNamedSorter: function (sorter, refresh, path) {
                    return _this.removeNamedSorter(sorter, refresh, path);
                },
                removeNamedSorterByName: function (name, refresh, path) {
                    return _this.removeNamedSorterByName(name, refresh, path);
                },
                setPageSize: function (pageSize, path) {
                    return _this.setPageSize(pageSize, path);
                },
                setCurrentPage: function (current, path) {
                    return _this.setCurrentPage(current, path);
                },
                loadMore: function () {
                    return _this.loadMore();
                },
                recoverItem: function (id, path) {
                    return _this.recoverItem(id, path);
                },
                resetItem: function (id, path) {
                    return _this.resetItem(id, path);
                }
            });
            Object.assign(methodProps, {
                /* create: (data: Omit<ED[T]['CreateSingle']['data'], 'id'>, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>) => {
                    return this.create(data, beforeExecute, afterExecute);
                }, */
                update: function (data, action, beforeExecute, afterExecute, path) {
                    return _this.update(data, action, beforeExecute, afterExecute, path);
                },
                create: function (data, beforeExecute, afterExecute, path) {
                    return _this.create(data, beforeExecute, afterExecute, path);
                },
                remove: function (beforeExecute, afterExecute, path) {
                    return _this.remove(beforeExecute, afterExecute, path);
                },
                isCreation: function (path) {
                    return _this.isCreation(path);
                }
            });
            if (methods) {
                var _loop_1 = function (m) {
                    var _a, _b;
                    Object.assign(this_1, (_a = {},
                        _a[m] = function () {
                            var _a;
                            var args = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                args[_i] = arguments[_i];
                            }
                            return (_a = methods[m]).call.apply(_a, tslib_1.__spreadArray([_this], tslib_1.__read(args), false));
                        },
                        _a));
                    Object.assign(methodProps, (_b = {},
                        _b[m] = function () {
                            var _a;
                            var args = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                args[_i] = arguments[_i];
                            }
                            return (_a = methods[m]).call.apply(_a, tslib_1.__spreadArray([_this], tslib_1.__read(args), false));
                        },
                        _b));
                };
                var this_1 = this;
                for (var m in methods) {
                    _loop_1(m);
                }
            }
            var data2 = typeof data === 'function' ? data.call(_this) : data;
            _this.state = Object.assign({}, data2, {
                oakLoading: !!option.entity && !!option.projection,
                oakLoadingMore: false,
                oakPullDownRefreshLoading: false,
                oakExecuting: false,
                oakDirty: false,
            });
            _this.methodProps = methodProps;
            // 处理默认的properties
            _this.defaultProperties = {};
            var properties = option.properties;
            if (properties) {
                for (var property in properties) {
                    _this.defaultProperties[property] = properties[property];
                }
            }
            (lifetimes === null || lifetimes === void 0 ? void 0 : lifetimes.created) && lifetimes.created.call(_this);
            return _this;
        }
        // todo 这里还需要根据path和location来判断自己是不是page
        OakComponentWrapper.prototype.iAmThePage = function () {
            return this.props.routeMatch;
        };
        OakComponentWrapper.prototype.supportPullDownRefresh = function () {
            var _a = this.props.oakDisablePulldownRefresh, oakDisablePulldownRefresh = _a === void 0 ? false : _a;
            var disable2 = this.state.oakDisablePulldownRefresh;
            return this.props.width === 'xs' && this.iAmThePage() && !oakDisablePulldownRefresh && !disable2;
        };
        OakComponentWrapper.prototype.registerPageScroll = function () {
            window.addEventListener('scroll', this.scrollEvent);
        };
        OakComponentWrapper.prototype.unregisterPageScroll = function () {
            window.removeEventListener('scroll', this.scrollEvent);
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
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var oakPath;
                var _this = this;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.registerPageScroll();
                            this.subscribed.push(features.locales.subscribe(function () { return _this.reRender(); }));
                            if (option.entity) {
                                this.subscribed.push(features.cache.subscribe(function () { return _this.reRender(); }));
                            }
                            (lifetimes === null || lifetimes === void 0 ? void 0 : lifetimes.attached) && lifetimes.attached.call(this);
                            oakPath = this.props.oakPath;
                            if (!option.entity) return [3 /*break*/, 3];
                            if (!(oakPath || this.iAmThePage() && path)) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.onPathSet()];
                        case 1:
                            _a.sent();
                            (lifetimes === null || lifetimes === void 0 ? void 0 : lifetimes.ready) && lifetimes.ready.call(this);
                            (lifetimes === null || lifetimes === void 0 ? void 0 : lifetimes.show) && lifetimes.show.call(this);
                            _a.label = 2;
                        case 2: return [3 /*break*/, 6];
                        case 3:
                            if (!(oakPath || this.iAmThePage() && path)) return [3 /*break*/, 5];
                            return [4 /*yield*/, this.onPathSet()];
                        case 4:
                            _a.sent();
                            _a.label = 5;
                        case 5:
                            (lifetimes === null || lifetimes === void 0 ? void 0 : lifetimes.ready) && lifetimes.ready.call(this);
                            (lifetimes === null || lifetimes === void 0 ? void 0 : lifetimes.show) && lifetimes.show.call(this);
                            this.reRender();
                            _a.label = 6;
                        case 6:
                            if (option.features) {
                                option.features.forEach(function (ele) {
                                    if (typeof ele === 'string') {
                                        _this.subscribed.push(features[ele].subscribe(function () { return _this.reRender(); }));
                                    }
                                    else {
                                        (0, assert_1.default)(typeof ele === 'object');
                                        var feature = ele.feature, behavior_1 = ele.behavior;
                                        _this.subscribed.push(features[feature].subscribe(function () {
                                            switch (behavior_1) {
                                                case 'reRender': {
                                                    _this.reRender();
                                                    return;
                                                }
                                                default: {
                                                    (0, assert_1.default)(behavior_1 === 'refresh');
                                                    _this.refresh();
                                                    return;
                                                }
                                            }
                                        }));
                                    }
                                });
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        OakComponentWrapper.prototype.componentWillUnmount = function () {
            this.subscribed.forEach(function (ele) { return ele(); });
            this.unregisterPageScroll();
            this.state.oakFullpath && (this.iAmThePage() || this.props.oakAutoUnmount) && page_common_1.destroyNode.call(this);
            (lifetimes === null || lifetimes === void 0 ? void 0 : lifetimes.detached) && lifetimes.detached.call(this);
        };
        OakComponentWrapper.prototype.componentDidUpdate = function (prevProps, prevState) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(prevProps.oakPath !== this.props.oakPath)) return [3 /*break*/, 2];
                            // oakPath如果是用变量初始化，在这里再执行onPathSet，如果有entity的结点在此执行ready
                            (0, assert_1.default)(this.props.oakPath);
                            return [4 /*yield*/, this.onPathSet()];
                        case 1:
                            _a.sent();
                            if (option.entity) {
                                (lifetimes === null || lifetimes === void 0 ? void 0 : lifetimes.ready) && lifetimes.ready.call(this);
                                (lifetimes === null || lifetimes === void 0 ? void 0 : lifetimes.show) && lifetimes.show.call(this);
                            }
                            _a.label = 2;
                        case 2:
                            if (this.props.oakId !== prevProps.oakId) {
                                (0, assert_1.default)(this.props.oakId); // 好像不可能把已有的id设空的界面需求吧
                                this.setId(this.props.oakId);
                            }
                            /*  这几个东西暂不支持变化，必须在初始化时确定
                            // 如果上层将oakFilters和oakSorters作为props传入，这里会将当前的filters和sorters清空，所以使用这两个props时最好是静态不变的
                            if (this.props.oakFilters !== prevProps.oakFilters) {
                                if (this.props.oakFilters) {
                                    const namedFilters = JSON.parse(this.props.oakFilters!);
                                    this.setNamedFilters(namedFilters, true);
                                }
                                else {
                                    this.setNamedFilters([], true);
                                }
                            }
                            if (this.props.oakSorters !== prevProps.oakSorters) {
                                if (this.props.oakSorters) {
                                    const namedSorters = JSON.parse(this.props.oakSorters!);
                                    this.setNamedSorters(namedSorters, true);
                                }
                                else {
                                    this.setNamedSorters([], true);
                                }
                            }
                            if (this.props.oakProjection !== prevProps.oakProjection) {
                                assert(false, 'oakProjection参数暂不允许变动');
                            } */
                            fn && fn.call(this, prevProps, prevState);
                            return [2 /*return*/];
                    }
                });
            });
        };
        OakComponentWrapper.prototype.render = function () {
            var _this = this;
            var oakPullDownRefreshLoading = this.state.oakPullDownRefreshLoading;
            var Render = getRender.call(this);
            if (this.supportPullDownRefresh()) {
                return ((0, jsx_runtime_1.jsx)(web_1.PullToRefresh, tslib_1.__assign({ onRefresh: function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                        return tslib_1.__generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    this.pullDownRefresh = true;
                                    return [4 /*yield*/, this.refresh()];
                                case 1:
                                    _a.sent();
                                    this.pullDownRefresh = false;
                                    return [2 /*return*/];
                            }
                        });
                    }); }, refreshing: oakPullDownRefreshLoading, distanceToRefresh: DEFAULT_REACH_BOTTOM_DISTANCE, indicator: {
                        activate: this.t('common::ptrActivate', { '#oakModule': 'oak-frontend-base' }),
                        deactivate: this.t('common::ptrDeactivate', { '#oakModule': 'oak-frontend-base' }),
                        release: this.t('common::ptrRelease', { '#oakModule': 'oak-frontend-base' }),
                        finish: this.t('common::ptrFinish', { '#oakModule': 'oak-frontend-base' }),
                    } }, { children: (0, jsx_runtime_1.jsx)(Render, { methods: this.methodProps, data: tslib_1.__assign(tslib_1.__assign(tslib_1.__assign({}, this.defaultProperties), this.state), this.props) }) })));
            }
            return (0, jsx_runtime_1.jsx)(Render, { methods: this.methodProps, data: tslib_1.__assign(tslib_1.__assign(tslib_1.__assign({}, this.defaultProperties), this.state), this.props) });
        };
        return OakComponentWrapper;
    }(OakComponentBase));
    ;
    return (0, web_1.withRouter)(OakComponentWrapper, option);
}
exports.createComponent = createComponent;
