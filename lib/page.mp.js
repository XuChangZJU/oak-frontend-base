"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComponent = void 0;
var tslib_1 = require("tslib");
/// <reference path="../node_modules/@types/wechat-miniprogram/index.d.ts" />
var assert_1 = tslib_1.__importDefault(require("assert"));
var page_common_1 = require("./page.common");
var i18n_1 = require("./platforms/wechatMp/i18n");
var lodash_1 = require("oak-domain/lib/utils/lodash");
var OakProperties = {
    oakId: '',
    oakPath: '',
    oakFilters: [],
    oakSorters: [],
    oakProjection: {},
    oakParentEntity: '',
    oakFrom: '',
    oakActions: '',
    oakAutoUnmount: false,
    oakDisablePulldownRefresh: false,
};
var OakPropertyTypes = {
    oakId: String,
    oakPath: String,
    // 这几个不能写成Array或Object，小程序会初始化成空对象和空数组
    oakFilters: null,
    oakSorters: null,
    oakProjection: null,
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
                var _a, properties, path, dataResolved, assignProps, key, key;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = this.oakOption, properties = _a.properties, path = _a.path;
                            dataResolved = {};
                            assignProps = function (data, property, type) {
                                var _a;
                                if (data.hasOwnProperty(property)) {
                                    var value = data[property];
                                    if (typeof data[property] === 'string' && type !== 'string') {
                                        switch (type) {
                                            case 'boolean': {
                                                value = new Boolean(data[property]);
                                                break;
                                            }
                                            case 'number': {
                                                value = new Number(data[property]);
                                                break;
                                            }
                                            case 'object': {
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
                            /**
                             * query是跳页面时从queryString里传值
                             * this.data是properties中有定义的时候在会自动赋值，这里没必要再处理一遍
                             */
                            if (properties) {
                                for (key in properties) {
                                    if (query[key]) {
                                        assignProps(query, key, typeof properties[key]);
                                    }
                                }
                            }
                            for (key in OakProperties) {
                                if (query[key]) {
                                    assignProps(query, key, typeof OakProperties[key]);
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
        switchTab: function (option, state) {
            return this.features.navigator.switchTab(option, state);
        },
        clean: function (path) {
            var path2 = path
                ? "".concat(this.state.oakFullpath, ".").concat(path)
                : this.state.oakFullpath;
            return this.features.runningTree.clean(path2);
        },
        isDirty: function (path) {
            return this.features.runningTree.isDirty(path || this.state.oakFullpath);
        },
        execute: function (action, messageProps, path) {
            return page_common_1.execute.call(this, action, path, messageProps);
        },
        getFreshValue: function (path) {
            var path2 = path
                ? "".concat(this.state.oakFullpath, ".").concat(path)
                : this.state.oakFullpath;
            return this.features.runningTree.getFreshValue(path2);
        },
        checkOperation: function (entity, action, data, filter, checkerTypes) {
            return this.features.cache.checkOperation(entity, action, data, filter, checkerTypes);
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
        setNamedFilters: function (filters, refresh, path) {
            var path2 = path
                ? "".concat(this.state.oakFullpath, ".").concat(path)
                : this.state.oakFullpath;
            this.features.runningTree.setNamedFilters(path2, filters, refresh);
        },
        setFilters: function (filters, path) {
            var path2 = path
                ? "".concat(this.state.oakFullpath, ".").concat(path)
                : this.state.oakFullpath;
            this.features.runningTree.setNamedFilters(path2, filters);
        },
        getFilters: function (path) {
            if (this.state.oakFullpath) {
                var path2 = path
                    ? "".concat(this.state.oakFullpath, ".").concat(path)
                    : this.state.oakFullpath;
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
        },
        addNamedFilter: function (namedFilter, refresh, path) {
            var path2 = path
                ? "".concat(this.state.oakFullpath, ".").concat(path)
                : this.state.oakFullpath;
            this.features.runningTree.addNamedFilter(path2, namedFilter, refresh);
        },
        removeNamedFilter: function (namedFilter, refresh, path) {
            var path2 = path
                ? "".concat(this.state.oakFullpath, ".").concat(path)
                : this.state.oakFullpath;
            this.features.runningTree.removeNamedFilter(path2, namedFilter, refresh);
        },
        removeNamedFilterByName: function (name, refresh, path) {
            var path2 = path
                ? "".concat(this.state.oakFullpath, ".").concat(path)
                : this.state.oakFullpath;
            this.features.runningTree.removeNamedFilterByName(path2, name, refresh);
        },
        setNamedSorters: function (namedSorters, refresh, path) {
            var path2 = path
                ? "".concat(this.state.oakFullpath, ".").concat(path)
                : this.state.oakFullpath;
            this.features.runningTree.setNamedSorters(path2, namedSorters, refresh);
        },
        getSorters: function (path) {
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
        },
        getSorterByName: function (name, path) {
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
        },
        addNamedSorter: function (namedSorter, refresh, path) {
            var path2 = path
                ? "".concat(this.state.oakFullpath, ".").concat(path)
                : this.state.oakFullpath;
            this.features.runningTree.addNamedSorter(path2, namedSorter, refresh);
        },
        removeNamedSorter: function (namedSorter, refresh, path) {
            var path2 = path
                ? "".concat(this.state.oakFullpath, ".").concat(path)
                : this.state.oakFullpath;
            this.features.runningTree.removeNamedSorter(path2, namedSorter, refresh);
        },
        removeNamedSorterByName: function (name, refresh, path) {
            var path2 = path
                ? "".concat(this.state.oakFullpath, ".").concat(path)
                : this.state.oakFullpath;
            this.features.runningTree.removeNamedSorterByName(path2, name, refresh);
        },
        getPagination: function (path) {
            if (this.state.oakFullpath) {
                var path2 = path
                    ? "".concat(this.state.oakFullpath, ".").concat(path)
                    : this.state.oakFullpath;
                return this.features.runningTree.getPagination(path2);
            }
        },
        setPageSize: function (pageSize, path) {
            var path2 = path
                ? "".concat(this.state.oakFullpath, ".").concat(path)
                : this.state.oakFullpath;
            this.features.runningTree.setPageSize(path2, pageSize);
        },
        setCurrentPage: function (currentPage, path) {
            (0, assert_1.default)(currentPage !== 0);
            if (this.state.oakEntity && this.state.oakFullpath) {
                var path2 = path
                    ? "".concat(this.state.oakFullpath, ".").concat(path)
                    : this.state.oakFullpath;
                this.features.runningTree.setCurrentPage(path2, currentPage);
            }
        },
        addItem: function (data, beforeExecute, afterExecute, path) {
            var path2 = path
                ? "".concat(this.state.oakFullpath, ".").concat(path)
                : this.state.oakFullpath;
            return this.features.runningTree.addItem(path2, data, beforeExecute, afterExecute);
        },
        updateItem: function (data, id, action, beforeExecute, afterExecute, path) {
            var path2 = path
                ? "".concat(this.state.oakFullpath, ".").concat(path)
                : this.state.oakFullpath;
            return this.features.runningTree.updateItem(path2, data, id, action, beforeExecute, afterExecute);
        },
        removeItem: function (id, beforeExecute, afterExecute, path) {
            var path2 = path
                ? "".concat(this.state.oakFullpath, ".").concat(path)
                : this.state.oakFullpath;
            return this.features.runningTree.removeItem(path2, id, beforeExecute, afterExecute);
        },
        recoverItem: function (id, path) {
            var path2 = path
                ? "".concat(this.state.oakFullpath, ".").concat(path)
                : this.state.oakFullpath;
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
        update: function (data, action, beforeExecute, afterExecute, path) {
            var path2 = path
                ? "".concat(this.state.oakFullpath, ".").concat(path)
                : this.state.oakFullpath;
            return this.features.runningTree.update(path2, data, action, beforeExecute, afterExecute);
        },
        create: function (data, beforeExecute, afterExecute, path) {
            var path2 = path
                ? "".concat(this.state.oakFullpath, ".").concat(path)
                : this.state.oakFullpath;
            return this.features.runningTree.create(path2, data, beforeExecute, afterExecute);
        },
        remove: function (beforeExecute, afterExecute, path) {
            var path2 = path
                ? "".concat(this.state.oakFullpath, ".").concat(path)
                : this.state.oakFullpath;
            return this.features.runningTree.remove(path2, beforeExecute, afterExecute);
        },
        isCreation: function (path) {
            var path2 = path
                ? "".concat(this.state.oakFullpath, ".").concat(path)
                : this.state.oakFullpath;
            return this.features.runningTree.isCreation(path2);
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
        /* oakFilters(data) {
            if (data !== this.props.oakFilters) {
                // 如果oakFilters被置空或重置，会完全重置当前结点上所有的nameFilter并重取数据。这个逻辑可能有问题，对oakFilters要慎用
                if (!data) {
                    this.setNamedFilters([], true);
                }
                else {
                    const namedFilters = JSON.parse(data);
                    this.setNamedFilters(namedFilters, true);
                }
            }
        },
        oakSorters(data) {
            if (data !== this.props.oakSorters) {
                // 如果oakSorters被置空或重置，会完全重置当前结点上所有的nameSorter并重取数据。这个逻辑可能有问题，对oakSorter要慎用
                if (!data) {
                    this.setNamedSorters([], true);
                }
                else {
                    const namedSorters = JSON.parse(data);
                    this.setNamedSorters(namedSorters, true);
                }
            }
        },
        oakProjection(data) {
            assert(data === this.props.oakProjection, 'oakProjection暂不支持变化');
        } */
    },
    pageLifetimes: {
        show: function () {
            var show = (this.oakOption.lifetimes || {}).show;
            // this.reRender();
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
            this.prevState = {};
            this.setData = function (data, callback) {
                _this.prevState = (0, lodash_1.cloneDeep)(_this.data);
                setData.call(_this, data, function () {
                    _this.state = _this.data;
                    _this.props = _this.data;
                    callback && callback.call(_this);
                });
            };
        },
    },
});
function translateListeners(listeners) {
    if (listeners) {
        var result = {};
        var _loop_1 = function (ln) {
            result[ln] = function () {
                var _this = this;
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                // 实测中小程序也是在update之后再调用observer，此时state上的值已经变成后项，因此增加prevState来缓存之
                var propNames = ln.split(',');
                var prev = {};
                var next = {};
                var dirty = false;
                propNames.forEach(function (pn, idx) {
                    prev[pn] = _this.prevState[pn];
                    next[pn] = args[idx];
                    if (prev[pn] !== next[pn]) {
                        dirty = true;
                    }
                });
                if (dirty) {
                    listeners[ln].call(this, prev, next);
                }
            };
        };
        for (var ln in listeners) {
            _loop_1(ln);
        }
        return result;
    }
}
function translatePropertiesToPropertyDefinitions(properties) {
    var definitions = {};
    if (properties) {
        Object.keys(properties).forEach(function (prop) {
            var _a;
            switch (typeof properties[prop]) {
                case 'string': {
                    if (properties[prop]) {
                        definitions[prop] = {
                            type: String,
                            value: properties[prop],
                        };
                    }
                    else {
                        definitions[prop] = String;
                    }
                    break;
                }
                case 'boolean': {
                    definitions[prop] = {
                        type: Boolean,
                        value: properties[prop],
                    };
                    break;
                }
                case 'number': {
                    definitions[prop] = {
                        type: Number,
                        value: properties[prop],
                    };
                    break;
                }
                case 'object': {
                    if (properties[prop] instanceof Array) {
                        if (properties[prop].length > 0) {
                            definitions[prop] = {
                                type: Array,
                                value: properties[prop],
                            };
                        }
                        else {
                            definitions[prop] = Array;
                        }
                    }
                    else {
                        if (Object.keys(properties[prop]).length > 0) {
                            definitions[prop] = {
                                type: Object,
                                value: properties[prop],
                            };
                        }
                        else {
                            definitions[prop] = Object;
                        }
                    }
                    break;
                }
                case 'function':
                default: {
                    // 小程序也支持传函数 https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/wxml-wxss.html
                    // 其它什么类型都写null，小程序能识别出来
                    Object.assign(definitions, (_a = {},
                        _a[prop] = null,
                        _a));
                    break;
                }
            }
        });
    }
    return definitions;
}
function createComponent(option, features) {
    var entity = option.entity, data = option.data, properties = option.properties, methods = option.methods, wechatMp = option.wechatMp, lifetimes = option.lifetimes, listeners = option.listeners;
    var _a = lifetimes || {}, attached = _a.attached, show = _a.show, hide = _a.hide, created = _a.created, detached = _a.detached, ready = _a.ready, moved = _a.moved, error = _a.error;
    var _b = wechatMp || {}, options = _b.options, externalClasses = _b.externalClasses;
    var _c = (methods || {}), onPullDownRefresh = _c.onPullDownRefresh, onReachBottom = _c.onReachBottom, restMethods = tslib_1.__rest(_c, ["onPullDownRefresh", "onReachBottom"]);
    var observers = translateListeners(listeners);
    return Component({
        externalClasses: externalClasses,
        // options,
        behaviors: [oakBehavior],
        data: typeof data !== 'function' ? Object.assign({}, data, {
            oakFullpath: '',
            oakLoading: !!option.entity && !!option.projection,
        }) : {
            oakFullpath: '',
            oakLoading: !!option.entity && !!option.projection,
        },
        properties: Object.assign({}, translatePropertiesToPropertyDefinitions(properties), OakPropertyTypes),
        methods: tslib_1.__assign({ onPullDownRefresh: function () {
                return tslib_1.__awaiter(this, void 0, void 0, function () {
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!(!this.state.oakLoading &&
                                    this.iAmThePage() &&
                                    !this.state.oakDisablePulldownRefresh &&
                                    !this.props.oakDisablePulldownRefresh)) return [3 /*break*/, 2];
                                return [4 /*yield*/, (onPullDownRefresh ? onPullDownRefresh.call(this) : this.refresh())];
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
            }, onReachBottom: function () {
                return tslib_1.__awaiter(this, void 0, void 0, function () {
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!(!this.state.oakLoadingMore &&
                                    this.iAmThePage() &&
                                    this.oakOption.isList)) return [3 /*break*/, 2];
                                return [4 /*yield*/, (onReachBottom ? onReachBottom.call(this) : this.loadMore())];
                            case 1:
                                _a.sent();
                                _a.label = 2;
                            case 2: return [2 /*return*/];
                        }
                    });
                });
            } }, restMethods),
        observers: observers,
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
