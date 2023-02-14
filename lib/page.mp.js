"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComponent = void 0;
var tslib_1 = require("tslib");
/// <reference path="../node_modules/@types/wechat-miniprogram/index.d.ts" />
var assert_1 = tslib_1.__importDefault(require("assert"));
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
var oakBehavior = Behavior({
    methods: {
        setDisablePulldownRefresh: function (able) {
            this.setState({
                oakDisablePulldownRefresh: able,
            });
        },
        t: function (key, params) {
            //  common: {
            //        GREETING: 'Hello {{name}}, nice to see you.',
            //   },
            // t('common:GREETING', {name: "John Doe" })
            var i18nInstance = (0, i18n_1.getI18nInstanceWechatMp)();
            if (!i18nInstance) {
                throw new Error('[i18n] ensure run initI18nWechatMp() in app.js before using I18n library');
            }
            return i18nInstance.getString(key, params);
        },
        resolveInput: function (input, keys) {
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
        },
        iAmThePage: function () {
            var pages = getCurrentPages();
            if (pages[pages.length - 1] === this) {
                return true;
            }
            return false;
        },
        setState: function (data, callback) {
            var _this = this;
            this.setData(data, function () {
                _this.state = _this.data;
                callback && callback.call(_this);
            });
        },
        reRender: function () {
            return page_common_1.reRender.call(this, this.oakOption);
        },
        onLoad: function (query) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _a, properties, path, dataResolved, assignProps, key, type2, key;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = this.oakOption, properties = _a.properties, path = _a.path;
                            dataResolved = {};
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
                                            case Object:
                                            case Array: {
                                                value = JSON.parse(data[property]);
                                                break;
                                            }
                                            default: {
                                                (0, assert_1.default)(false);
                                            }
                                        }
                                    }
                                    Object.assign(dataResolved, (_a = {},
                                        _a[property] = value,
                                        _a));
                                }
                            };
                            if (properties) {
                                for (key in properties) {
                                    type2 = typeof properties[key] === 'object' ?
                                        properties[key].type :
                                        properties[key];
                                    if (query[key]) {
                                        assignProps(query, key, type2);
                                    }
                                    else if (this.data) {
                                        assignProps(this.data, key, type2);
                                    }
                                }
                            }
                            for (key in OakProperties) {
                                if (query[key]) {
                                    assignProps(query, key, OakProperties[key]);
                                }
                                else if (this.data) {
                                    assignProps(this.data, key, OakProperties[key]);
                                }
                            }
                            if (Object.keys(dataResolved).length > 0) {
                                this.setState(dataResolved);
                            }
                            if (!(this.props.oakPath || (this.iAmThePage() && path))) return [3 /*break*/, 2];
                            return [4 /*yield*/, page_common_1.onPathSet.call(this, this.oakOption)];
                        case 1:
                            _b.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            this.reRender();
                            _b.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        onPullDownRefresh: function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(!this.state.oakLoading &&
                                this.iAmThePage() &&
                                !this.state.oakDisablePulldownRefresh &&
                                !this.props.oakDisablePulldownRefresh)) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.refresh()];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2: return [4 /*yield*/, wx.stopPullDownRefresh()];
                        case 3:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        },
        onReachBottom: function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(!this.state.oakLoadingMore &&
                                this.iAmThePage() &&
                                this.oakOption.isList)) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.loadMore()];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2: return [2 /*return*/];
                    }
                });
            });
        },
        sub: function (type, callback) {
            this.features.eventBus.sub(type, callback);
        },
        unsub: function (type, callback) {
            this.features.eventBus.unsub(type, callback);
        },
        pub: function (type, option) {
            this.features.eventBus.pub(type, option);
        },
        unsubAll: function (type) {
            this.features.eventBus.unsubAll(type);
        },
        save: function (key, item) {
            this.features.localStorage.save(key, item);
        },
        load: function (key) {
            return this.features.localStorage.load(key);
        },
        clear: function () {
            this.features.localStorage.clear();
        },
        setNotification: function (data) {
            this.features.notification.setNotification(data);
        },
        consumeNotification: function () {
            return this.features.notification.consumeNotification();
        },
        setMessage: function (data) {
            return this.features.message.setMessage(data);
        },
        consumeMessage: function () {
            return this.features.message.consumeMessage();
        },
        navigateBack: function (delta) {
            return this.features.navigator.navigateBack(delta);
        },
        navigateTo: function (option, state) {
            return this.features.navigator.navigateTo(option, state);
        },
        redirectTo: function (option, state) {
            return this.features.navigator.redirectTo(option, state);
        },
        clean: function (path) {
            var path2 = path
                ? "".concat(this.state.oakFullpath, ".").concat(path)
                : this.state.oakFullpath;
            return this.features.runningTree.clean(path2);
        },
        execute: function (action, messageProps) {
            return page_common_1.execute.call(this, action, undefined, messageProps);
        },
        getFreshValue: function (path) {
            var path2 = path
                ? "".concat(this.state.oakFullpath, ".").concat(path)
                : this.state.oakFullpath;
            return this.features.runningTree.getFreshValue(path2);
        },
        checkOperation: function (entity, action, filter, checkerTypes) {
            return this.features.cache.checkOperation(entity, action, filter, checkerTypes);
        },
        tryExecute: function (path) {
            var path2 = path
                ? "".concat(this.state.oakFullpath, ".").concat(path)
                : this.state.oakFullpath;
            return this.features.runningTree.tryExecute(path2);
        },
        getOperations: function (path) {
            var path2 = path
                ? "".concat(this.state.oakFullpath, ".").concat(path)
                : this.state.oakFullpath;
            return this.features.runningTree.getOperations(path2);
        },
        refresh: function () {
            return page_common_1.refresh.call(this);
        },
        loadMore: function () {
            return page_common_1.loadMore.call(this);
        },
        getId: function () {
            return this.features.runningTree.getId(this.state.oakFullpath);
        },
        setFilters: function (filters, path) {
            var path2 = path ? "".concat(this.state.oakFullpath, ".").concat(path) : this.state.oakFullpath;
            this.features.runningTree.setNamedFilters(path2, filters);
        },
        getFilters: function (path) {
            if (this.state.oakFullpath) {
                var path2 = path ? "".concat(this.state.oakFullpath, ".").concat(path) : this.state.oakFullpath;
                var namedFilters = this.features.runningTree.getNamedFilters(this.state.oakFullpath);
                return namedFilters.map(function (_a) {
                    var filter = _a.filter;
                    if (typeof filter === 'function') {
                        return filter();
                    }
                    return filter;
                });
            }
        },
        getFilterByName: function (name, path) {
            if (this.state.oakFullpath) {
                var path2 = path ? "".concat(this.state.oakFullpath, ".").concat(path) : this.state.oakFullpath;
                var filter = this.features.runningTree.getNamedFilterByName(path2, name);
                if (filter === null || filter === void 0 ? void 0 : filter.filter) {
                    if (typeof filter.filter === 'function') {
                        return filter.filter();
                    }
                    return filter.filter;
                }
            }
        },
        addNamedFilter: function (namedFilter, refresh, path) {
            var path2 = path ? "".concat(this.state.oakFullpath, ".").concat(path) : this.state.oakFullpath;
            this.features.runningTree.addNamedFilter(path2, namedFilter, refresh);
        },
        removeNamedFilter: function (namedFilter, refresh, path) {
            var path2 = path ? "".concat(this.state.oakFullpath, ".").concat(path) : this.state.oakFullpath;
            this.features.runningTree.removeNamedFilter(path2, namedFilter, refresh);
        },
        removeNamedFilterByName: function (name, refresh, path) {
            var path2 = path ? "".concat(this.state.oakFullpath, ".").concat(path) : this.state.oakFullpath;
            this.features.runningTree.removeNamedFilterByName(path2, name, refresh);
        },
        setNamedSorters: function (namedSorters, path) {
            var path2 = path ? "".concat(this.state.oakFullpath, ".").concat(path) : this.state.oakFullpath;
            this.features.runningTree.setNamedSorters(path2, namedSorters);
        },
        getSorters: function (path) {
            if (this.state.oakFullpath) {
                var path2 = path ? "".concat(this.state.oakFullpath, ".").concat(path) : this.state.oakFullpath;
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
        },
        getSorterByName: function (name, path) {
            if (this.state.oakFullpath) {
                var path2 = path ? "".concat(this.state.oakFullpath, ".").concat(path) : this.state.oakFullpath;
                var sorter = this.features.runningTree.getNamedSorterByName(path2, name);
                if (sorter === null || sorter === void 0 ? void 0 : sorter.sorter) {
                    if (typeof sorter.sorter === 'function') {
                        return sorter.sorter();
                    }
                    return sorter.sorter;
                }
            }
        },
        addNamedSorter: function (namedSorter, refresh, path) {
            var path2 = path ? "".concat(this.state.oakFullpath, ".").concat(path) : this.state.oakFullpath;
            this.features.runningTree.addNamedSorter(path2, namedSorter, refresh);
        },
        removeNamedSorter: function (namedSorter, refresh, path) {
            var path2 = path ? "".concat(this.state.oakFullpath, ".").concat(path) : this.state.oakFullpath;
            this.features.runningTree.removeNamedSorter(path2, namedSorter, refresh);
        },
        removeNamedSorterByName: function (name, refresh, path) {
            var path2 = path ? "".concat(this.state.oakFullpath, ".").concat(path) : this.state.oakFullpath;
            this.features.runningTree.removeNamedSorterByName(path2, name, refresh);
        },
        getPagination: function (path) {
            if (this.state.oakFullpath) {
                var path2 = path ? "".concat(this.state.oakFullpath, ".").concat(path) : this.state.oakFullpath;
                return this.features.runningTree.getPagination(path2);
            }
        },
        setPageSize: function (pageSize, path) {
            var path2 = path ? "".concat(this.state.oakFullpath, ".").concat(path) : this.state.oakFullpath;
            this.features.runningTree.setPageSize(path2, pageSize);
        },
        setCurrentPage: function (currentPage, path) {
            (0, assert_1.default)(currentPage !== 0);
            if (this.state.oakEntity && this.state.oakFullpath) {
                var path2 = path ? "".concat(this.state.oakFullpath, ".").concat(path) : this.state.oakFullpath;
                this.features.runningTree.setCurrentPage(path2, currentPage);
            }
        },
        addItem: function (data, beforeExecute, afterExecute, path) {
            var path2 = path ? "".concat(this.state.oakFullpath, ".").concat(path) : this.state.oakFullpath;
            return this.features.runningTree.addItem(path2, data, beforeExecute, afterExecute);
        },
        updateItem: function (data, id, action, beforeExecute, afterExecute, path) {
            var path2 = path ? "".concat(this.state.oakFullpath, ".").concat(path) : this.state.oakFullpath;
            return this.features.runningTree.updateItem(path2, data, id, action, beforeExecute, afterExecute);
        },
        removeItem: function (id, beforeExecute, afterExecute, path) {
            var path2 = path ? "".concat(this.state.oakFullpath, ".").concat(path) : this.state.oakFullpath;
            return this.features.runningTree.removeItem(path2, id, beforeExecute, afterExecute);
        },
        recoverItem: function (id, path) {
            var path2 = path ? "".concat(this.state.oakFullpath, ".").concat(path) : this.state.oakFullpath;
            return this.features.runningTree.recoverItem(path2, id);
        },
        resetItem: function (id, path) {
            var path2 = path
                ? "".concat(this.state.oakFullpath, ".").concat(path)
                : this.state.oakFullpath;
            this.features.runningTree.resetItem(path2, id);
        },
        setId: function (id) {
            return this.features.runningTree.setId(this.state.oakFullpath, id);
        },
        unsetId: function () {
            return this.features.runningTree.unsetId(this.state.oakFullpath);
        },
        isCreation: function (path) {
            var path2 = path
                ? "".concat(this.state.oakFullpath, ".").concat(path)
                : this.state.oakFullpath;
            return this.features.runningTree.isCreation(path2);
        },
        update: function (data, action, beforeExecute, afterExecute, path) {
            var path2 = path ? "".concat(this.state.oakFullpath, ".").concat(path) : this.state.oakFullpath;
            return this.features.runningTree.update(path2, data, action, beforeExecute, afterExecute);
        },
        remove: function (beforeExecute, afterExecute, path) {
            var path2 = path ? "".concat(this.state.oakFullpath, ".").concat(path) : this.state.oakFullpath;
            return this.features.runningTree.remove(path2, beforeExecute, afterExecute);
        },
        aggregate: function (aggregation) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.features.cache.aggregate(this.state.oakEntity, aggregation)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        },
    },
    observers: {
        oakPath: function (data) {
            if (data && data !== this.state.oakFullpath) {
                page_common_1.onPathSet.call(this, this.oakOption);
            }
        },
        oakId: function (data) {
            if (data !== this.props.oakId) {
                if (this.state.oakFullpath) {
                    this.features.runningTree.setId(this.state.oakFullpath, data);
                }
            }
        },
    },
    pageLifetimes: {
        show: function () {
            var show = (this.oakOption.lifetimes || {}).show;
            this.reRender();
            show && show.call(this);
        },
        hide: function () {
            var hide = (this.oakOption.lifetimes || {}).hide;
            hide && hide.call(this);
        },
    },
    lifetimes: {
        created: function () {
            var _this = this;
            var setData = this.setData;
            this.state = this.data;
            this.props = this.data;
            this.setData = function (data, callback) {
                setData.call(_this, data, function () {
                    _this.state = _this.data;
                    _this.props = _this.data;
                    callback && callback.call(_this);
                });
            };
        },
    },
});
function createComponent(option, features) {
    var data = option.data, properties = option.properties, methods = option.methods, wechatMp = option.wechatMp, lifetimes = option.lifetimes, observers = option.observers;
    var _a = lifetimes || {}, attached = _a.attached, show = _a.show, hide = _a.hide, created = _a.created, detached = _a.detached, ready = _a.ready, moved = _a.moved, error = _a.error;
    var _b = wechatMp || {}, options = _b.options, externalClasses = _b.externalClasses;
    return Component({
        externalClasses: externalClasses,
        // options,
        behaviors: [oakBehavior],
        data: typeof data !== 'function' ? Object.assign({}, data, {
            oakFullpath: '',
        }) : {
            oakFullpath: '',
        },
        properties: Object.assign({}, properties, OakProperties),
        methods: tslib_1.__assign({}, methods),
        observers: tslib_1.__assign({}, observers),
        pageLifetimes: {
            show: function () {
                // this.reRender();
                show && show.call(this);
            },
            hide: function () {
                hide && hide.call(this);
            },
        },
        lifetimes: {
            created: function () {
                this.oakOption = option;
                this.features = features;
                this.subscribed = [];
                created && created.call(this);
            },
            attached: function () {
                var _a;
                var _this = this;
                var i18nInstance = (0, i18n_1.getI18nInstanceWechatMp)();
                if (i18nInstance) {
                    this.setState((_a = {},
                        _a[i18n_1.CURRENT_LOCALE_KEY] = i18nInstance.currentLocale,
                        _a[i18n_1.CURRENT_LOCALE_DATA] = i18nInstance.translations,
                        _a));
                }
                if (option.entity) {
                    this.subscribed.push(features.cache.subscribe(function () { return _this.reRender(); }));
                }
                attached && attached.call(this);
            },
            detached: function () {
                this.subscribed.forEach(function (ele) { return ele(); });
                this.state.oakFullpath &&
                    (this.iAmThePage() || this.props.oakAutoUnmount) &&
                    page_common_1.destroyNode.call(this);
                detached && detached.call(this);
            },
            ready: function () {
                if (typeof data === 'function') {
                    // ts的编译好像有问题，这里不硬写as过不去 
                    var data2 = data.call(this);
                    this.setData(data2);
                }
                ready && ready.call(this);
            },
            moved: function () {
                moved && moved.call(this);
            },
            error: function (err) {
                error && error.call(this, err);
            },
        },
    });
}
exports.createComponent = createComponent;
