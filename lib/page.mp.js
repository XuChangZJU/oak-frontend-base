"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComponent = void 0;
/// <reference path="../node_modules/@types/wechat-miniprogram/index.d.ts" />
const assert_1 = require("oak-domain/lib/utils/assert");
const page_common_1 = require("./page.common");
const lodash_1 = require("oak-domain/lib/utils/lodash");
const OakProperties = {
    oakId: '',
    oakPath: '',
    oakParentEntity: '',
    oakFrom: '',
    oakActions: '',
    oakAutoUnmount: false,
    oakDisablePulldownRefresh: false,
};
const OakPropertyTypes = {
    oakId: String,
    oakPath: String,
    oakParentEntity: String,
    oakFrom: String,
    oakActions: String,
    oakAutoUnmount: Boolean,
    oakDisablePulldownRefresh: Boolean,
};
const oakBehavior = Behavior({
    methods: {
        t(key, params) {
            return this.features.locales.t(key, params);
        },
        addFeatureSub(name, callback) {
            const unsubHandler = this.features[name].subscribe(callback);
            this.featuresSubscribed.push({
                name,
                callback,
                unsubHandler,
            });
        },
        removeFeatureSub(name, callback) {
            const f = this.featuresSubscribed.find((ele) => ele.callback === callback && ele.name === name);
            (0, lodash_1.pull)(this.featuresSubscribed, f);
            f.unsubHandler && f.unsubHandler();
        },
        unsubscribeAll() {
            this.featuresSubscribed.forEach((ele) => {
                (0, assert_1.assert)(ele.unsubHandler);
                ele.unsubHandler();
                ele.unsubHandler = undefined;
            });
        },
        subscribeAll() {
            this.featuresSubscribed.forEach((ele) => {
                if (!ele.unsubHandler) {
                    ele.unsubHandler = this.features[ele.name].subscribe(ele.callback);
                }
            });
        },
        iAmThePage() {
            const pages = getCurrentPages();
            if (pages[pages.length - 1] === this) {
                return true;
            }
            return false;
        },
        setState(data, callback) {
            this.setData(data, () => {
                this.state = this.data;
                callback && callback.call(this);
            });
        },
        reRender() {
            return page_common_1.reRender.call(this, this.oakOption);
        },
        async onLoad(query) {
            /**
             * 小程序以props传递数据，和以页面间参数传递数据的处理不一样，都在这里处理
             * 目前处理的还不是很完善，在实际处理中再做
             */
            const { properties, path } = this.oakOption;
            const dataResolved = {};
            const assignProps = (data, property, type) => {
                if (data.hasOwnProperty(property)) {
                    let value = data[property];
                    if (typeof data[property] === 'string' &&
                        type !== 'string') {
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
                                (0, assert_1.assert)(false);
                            }
                        }
                    }
                    Object.assign(dataResolved, {
                        [property]: value,
                    });
                }
            };
            /**
             * query是跳页面时从queryString里传值
             * this.data是properties中有定义的时候在会自动赋值，这里没必要再处理一遍
             */
            if (properties) {
                for (const key in properties) {
                    if (query[key]) {
                        assignProps(query, key, typeof properties[key]);
                    }
                }
            }
            for (const key in OakProperties) {
                if (query[key]) {
                    assignProps(query, key, typeof OakProperties[key]);
                }
            }
            if (Object.keys(dataResolved).length > 0) {
                this.setState(dataResolved);
            }
            // if (this.props.oakPath || (this.iAmThePage() && path)) {
            //     const pathState = onPathSet.call(this as any, this.oakOption as any);
            //     if (this.unmounted) {
            //         return;
            //     }
            //     this.setState(pathState as any, () => {
            //         const { oakFullpath } = this.state;
            //         if (oakFullpath) {
            //             this.refresh();
            //         }
            //         else {
            //             this.reRender();
            //         }
            //     });
            // }
            // else if(!this.oakOption.entity) {
            //     this.reRender();
            // }
        },
        subEvent(type, callback) {
            this.features.eventBus.sub(type, callback);
        },
        unsubEvent(type, callback) {
            this.features.eventBus.unsub(type, callback);
        },
        pubEvent(type, option) {
            this.features.eventBus.pub(type, option);
        },
        unsubAllEvents(type) {
            this.features.eventBus.unsubAll(type);
        },
        save(key, item) {
            return this.features.localStorage.save(key, item);
        },
        load(key) {
            return this.features.localStorage.load(key);
        },
        clear(key) {
            if (key) {
                return this.features.localStorage.remove(key);
            }
            return this.features.localStorage.clear();
        },
        setNotification(data) {
            this.features.notification.setNotification(data);
        },
        consumeNotification() {
            return this.features.notification.consumeNotification();
        },
        setMessage(data) {
            return this.features.message.setMessage(data);
        },
        consumeMessage() {
            return this.features.message.consumeMessage();
        },
        navigateBack(delta) {
            return this.features.navigator.navigateBack(delta);
        },
        navigateTo(option, state) {
            return this.features.navigator.navigateTo(option, state);
        },
        redirectTo(option, state) {
            return this.features.navigator.redirectTo(option, state);
        },
        switchTab(option, state) {
            return this.features.navigator.switchTab(option, state);
        },
        clean(path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            return this.features.runningTree.clean(path2);
        },
        isDirty(path) {
            return this.features.runningTree.isDirty(path || this.state.oakFullpath);
        },
        execute(action, messageProps, path) {
            return page_common_1.execute.call(this, action, path, messageProps);
        },
        getFreshValue(path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            return this.features.runningTree.getFreshValue(path2);
        },
        checkOperation(entity, action, data, filter, checkerTypes) {
            if (checkerTypes?.includes('relation')) {
                return (this.features.relationAuth.checkRelation(entity, {
                    action,
                    data,
                    filter,
                }) &&
                    this.features.cache.checkOperation(entity, action, data, filter, checkerTypes));
            }
            return this.features.cache.checkOperation(entity, action, data, filter, checkerTypes);
        },
        tryExecute(path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            return this.features.runningTree.tryExecute(path2);
        },
        getOperations(path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            return this.features.runningTree.getOperations(path2);
        },
        async refresh() {
            return page_common_1.refresh.call(this);
        },
        loadMore() {
            return page_common_1.loadMore.call(this);
        },
        getId() {
            return this.features.runningTree.getId(this.state.oakFullpath);
        },
        setNamedFilters(filters, refresh, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            this.features.runningTree.setNamedFilters(path2, filters, refresh);
        },
        setFilters(filters, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            this.features.runningTree.setNamedFilters(path2, filters);
        },
        getFilters(path) {
            if (this.state.oakFullpath) {
                const path2 = path
                    ? `${this.state.oakFullpath}.${path}`
                    : this.state.oakFullpath;
                const namedFilters = this.features.runningTree.getNamedFilters(this.state.oakFullpath);
                return namedFilters.map(({ filter }) => {
                    if (typeof filter === 'function') {
                        return filter();
                    }
                    return filter;
                });
            }
        },
        getFilterByName(name, path) {
            if (this.state.oakFullpath) {
                const path2 = path
                    ? `${this.state.oakFullpath}.${path}`
                    : this.state.oakFullpath;
                const filter = this.features.runningTree.getNamedFilterByName(path2, name);
                if (filter?.filter) {
                    if (typeof filter.filter === 'function') {
                        return filter.filter();
                    }
                    return filter.filter;
                }
            }
        },
        addNamedFilter(namedFilter, refresh, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            this.features.runningTree.addNamedFilter(path2, namedFilter, refresh);
        },
        removeNamedFilter(namedFilter, refresh, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            this.features.runningTree.removeNamedFilter(path2, namedFilter, refresh);
        },
        removeNamedFilterByName(name, refresh, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            this.features.runningTree.removeNamedFilterByName(path2, name, refresh);
        },
        setNamedSorters(namedSorters, refresh, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            this.features.runningTree.setNamedSorters(path2, namedSorters, refresh);
        },
        getSorters(path) {
            if (this.state.oakFullpath) {
                const path2 = path
                    ? `${this.state.oakFullpath}.${path}`
                    : this.state.oakFullpath;
                const namedSorters = this.features.runningTree.getNamedSorters(path2);
                const sorters = namedSorters
                    .map(({ sorter }) => {
                    if (typeof sorter === 'function') {
                        return sorter();
                    }
                    return sorter;
                })
                    .filter((ele) => !!ele);
                return sorters;
            }
        },
        getSorterByName(name, path) {
            if (this.state.oakFullpath) {
                const path2 = path
                    ? `${this.state.oakFullpath}.${path}`
                    : this.state.oakFullpath;
                const sorter = this.features.runningTree.getNamedSorterByName(path2, name);
                if (sorter?.sorter) {
                    if (typeof sorter.sorter === 'function') {
                        const sortItem = sorter.sorter();
                        // 要支持自定义sorter函数返回完整的sorter，但这种sorter应当确保是无名的不被查找
                        (0, assert_1.assert)(!(sortItem instanceof Array), '不应该有非item的sorter被查找');
                        return sortItem;
                    }
                    return sorter.sorter;
                }
            }
        },
        addNamedSorter(namedSorter, refresh, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            this.features.runningTree.addNamedSorter(path2, namedSorter, refresh);
        },
        removeNamedSorter(namedSorter, refresh, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            this.features.runningTree.removeNamedSorter(path2, namedSorter, refresh);
        },
        removeNamedSorterByName(name, refresh, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            this.features.runningTree.removeNamedSorterByName(path2, name, refresh);
        },
        getPagination(path) {
            if (this.state.oakFullpath) {
                const path2 = path
                    ? `${this.state.oakFullpath}.${path}`
                    : this.state.oakFullpath;
                return this.features.runningTree.getPagination(path2);
            }
        },
        setPageSize(pageSize, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            this.features.runningTree.setPageSize(path2, pageSize);
        },
        setCurrentPage(currentPage, path) {
            (0, assert_1.assert)(currentPage !== 0);
            if (this.state.oakEntity && this.state.oakFullpath) {
                const path2 = path
                    ? `${this.state.oakFullpath}.${path}`
                    : this.state.oakFullpath;
                this.features.runningTree.setCurrentPage(path2, currentPage);
            }
        },
        addItem(data, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            return this.features.runningTree.addItem(path2, data);
        },
        updateItem(data, id, action, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            return this.features.runningTree.updateItem(path2, data, id, action);
        },
        removeItem(id, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            return this.features.runningTree.removeItem(path2, id);
        },
        recoverItem(id, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            return this.features.runningTree.recoverItem(path2, id);
        },
        resetItem(id, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            this.features.runningTree.resetItem(path2, id);
        },
        setId(id) {
            return this.features.runningTree.setId(this.state.oakFullpath, id);
        },
        unsetId() {
            return this.features.runningTree.unsetId(this.state.oakFullpath);
        },
        update(data, action, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            return this.features.runningTree.update(path2, data, action);
        },
        create(data, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            return this.features.runningTree.create(path2, data);
        },
        remove(path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            return this.features.runningTree.remove(path2);
        },
        isCreation(path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            return this.features.runningTree.isCreation(path2);
        },
        async aggregate(aggregation) {
            return await this.features.cache.aggregate(this.state.oakEntity, aggregation);
        },
        loadMissedLocales(key) {
            this.features.locales.loadMissedLocale(key);
        },
        subData(data, callback) {
            return this.features.subscriber.sub(data, callback);
        },
        unSubData(ids) {
            return this.features.subscriber.unsub(ids);
        },
    },
    observers: {
        oakPath(data) {
            if (data && data !== this.state.oakFullpath) {
                const pathState = page_common_1.onPathSet.call(this, this.oakOption);
                if (this.unmounted) {
                    return;
                }
                this.setState(pathState, () => {
                    if (data === undefined) {
                        // 如果每个页面都在oakFullpath形成后再渲染子结点，这个if感觉是不应该命中的
                        console.warn('发生了结点先形成再配置oakPath的情况，请检查代码修正');
                        this.oakOption.lifetimes?.ready &&
                            this.oakOption.lifetimes?.ready.call(this);
                        const { oakFullpath } = this.state;
                        if (oakFullpath &&
                            !this.features.runningTree.checkIsModiNode(oakFullpath) &&
                            !this.features.runningTree.isListDescandent(oakFullpath)) {
                            this.refresh();
                        }
                        else {
                            this.reRender();
                        }
                    }
                });
            }
        },
        oakId(data) {
            if (data !== this.props.oakId) {
                if (this.state.oakFullpath) {
                    this.features.runningTree.setId(this.state.oakFullpath, data);
                }
            }
        },
    },
});
function translateListeners(listeners) {
    if (listeners) {
        const result = {};
        for (const ln in listeners) {
            result[ln] = function (...args) {
                // 实测中小程序也是在update之后再调用observer，此时state上的值已经变成后项，因此增加prevState来缓存之
                const propNames = ln.split(',');
                const prev = {};
                const next = {};
                let dirty = false;
                propNames.forEach((pn, idx) => {
                    prev[pn] = this.prevState[pn];
                    next[pn] = args[idx];
                    if (prev[pn] !== next[pn]) {
                        dirty = true;
                    }
                });
                if (dirty) {
                    listeners[ln].call(this, prev, next);
                }
            };
        }
        return result;
    }
}
function translatePropertiesToPropertyDefinitions(properties) {
    const definitions = {};
    if (properties) {
        Object.keys(properties).forEach((prop) => {
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
                case 'function': {
                    Object.assign(definitions, {
                        [prop]: Function,
                    });
                }
                default: {
                    // 小程序也支持传函数 https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/wxml-wxss.html
                    // 其它什么类型都写null，小程序能识别出来
                    Object.assign(definitions, {
                        [prop]: null,
                    });
                    break;
                }
            }
        });
    }
    return definitions;
}
function createComponent(option, features) {
    const { entity, data, properties, methods, wechatMp, lifetimes, listeners, } = option;
    const { attached, show, hide, created, detached, ready, moved, error } = lifetimes || {};
    const { options, externalClasses } = wechatMp || {};
    const { onPullDownRefresh, onReachBottom, ...restMethods } = (methods || {});
    const observers = translateListeners(listeners);
    return Component({
        externalClasses,
        behaviors: [oakBehavior],
        data: typeof data !== 'function'
            ? Object.assign({}, data, {
                oakFullpath: '',
                oakLoading: !!option.entity && !!option.projection,
            })
            : {
                oakFullpath: '',
                oakLoading: !!option.entity && !!option.projection,
            },
        properties: Object.assign({}, translatePropertiesToPropertyDefinitions(properties), OakPropertyTypes),
        methods: {
            async onPullDownRefresh() {
                if (!this.state.oakLoading &&
                    this.iAmThePage() &&
                    !this.state.oakDisablePulldownRefresh &&
                    !this.props.oakDisablePulldownRefresh) {
                    await (onPullDownRefresh
                        ? onPullDownRefresh.call(this)
                        : this.refresh());
                }
                await wx.stopPullDownRefresh();
            },
            async onReachBottom() {
                if (!this.state.oakLoadingMore &&
                    this.iAmThePage() &&
                    this.oakOption.isList) {
                    await (onReachBottom
                        ? onReachBottom.call(this)
                        : this.loadMore());
                }
            },
            ...restMethods,
        },
        observers,
        pageLifetimes: {
            show() {
                const { show } = this.oakOption.lifetimes || {};
                this.reRender();
                show && show.call(this);
                this.subscribeAll();
            },
            hide() {
                const { hide } = this.oakOption.lifetimes || {};
                hide && hide.call(this);
                this.unsubscribeAll();
            },
            resize(size) {
                const { resize } = this.oakOption.lifetimes || {};
                resize && resize.call(this, size);
            }
        },
        lifetimes: {
            created() {
                const { setData } = this;
                this.state = this.data;
                this.props = this.data;
                this.prevState = {};
                this.setData = (data, callback) => {
                    this.prevState = (0, lodash_1.cloneDeep)(this.data);
                    setData.call(this, data, () => {
                        this.state = this.data;
                        this.props = this.data;
                        callback && callback.call(this);
                    });
                };
                this.oakOption = option;
                this.features = features;
                this.featuresSubscribed = [];
                created && created.call(this);
            },
            attached() {
                if (typeof data === 'function') {
                    // ts的编译好像有问题，这里不硬写as过不去
                    const data2 = data.call(this);
                    this.setData(data2, () => {
                        const fnData = {};
                        for (const k in this.data) {
                            if (typeof this.data[k] === 'function') {
                                // this.data[k] = this.data[k].bind(this);
                                fnData[k] = this.data[k].bind(this);
                            }
                        }
                        if (Object.keys(fnData).length > 0) {
                            this.setData(fnData);
                        }
                    });
                }
                else {
                    const fnData = {};
                    for (const k in this.data) {
                        if (typeof this.data[k] === 'function') {
                            // this.data[k] = this.data[k].bind(this);
                            fnData[k] = this.data[k].bind(this);
                        }
                    }
                    if (Object.keys(fnData).length > 0) {
                        this.setData(fnData);
                    }
                }
                this.umounted = false;
                this.addFeatureSub('locales', () => this.reRender());
                if (option.entity) {
                    this.addFeatureSub('cache', () => this.reRender());
                }
                if (option.features) {
                    option.features.forEach((ele) => {
                        if (typeof ele === 'string') {
                            this.addFeatureSub(ele, () => this.reRender());
                        }
                        else {
                            (0, assert_1.assert)(typeof ele === 'object');
                            const { feature, behavior, callback } = ele;
                            if (behavior) {
                                this.addFeatureSub(feature, () => {
                                    switch (behavior) {
                                        case 'reRender': {
                                            this.reRender();
                                            return;
                                        }
                                        default: {
                                            (0, assert_1.assert)(behavior === 'refresh');
                                            this.refresh();
                                            return;
                                        }
                                    }
                                });
                            }
                            else if (callback) {
                                callback();
                            }
                            else {
                                this.reRender();
                            }
                        }
                    });
                }
                if (this.props.oakPath ||
                    (this.iAmThePage() && this.oakOption.path)) {
                    const pathState = page_common_1.onPathSet.call(this, this.oakOption);
                    if (this.unmounted) {
                        return;
                    }
                    this.setState(pathState, () => {
                        const { oakFullpath } = this.state;
                        if (oakFullpath && !features.runningTree.checkIsModiNode(oakFullpath) && !features.runningTree.isListDescandent(oakFullpath)) {
                            this.refresh();
                        }
                        else {
                            this.reRender();
                        }
                    });
                }
                else if (!this.oakOption.entity) {
                    this.reRender();
                }
                attached && attached.call(this);
            },
            detached() {
                this.unsubscribeAll();
                this.state.oakFullpath &&
                    (this.iAmThePage() || this.props.oakAutoUnmount) &&
                    page_common_1.destroyNode.call(this);
                detached && detached.call(this);
                this.umounted = true;
            },
            ready() {
                // 等oakFullpath构建完成后再ready
                if (this.state.oakFullpath) {
                    ready && ready.call(this);
                }
                else if (!this.oakOption.entity) {
                    ready && ready.call(this);
                }
            },
            moved() {
                moved && moved.call(this);
            },
            error(err) {
                error && error.call(this, err);
            },
        },
    });
}
exports.createComponent = createComponent;
