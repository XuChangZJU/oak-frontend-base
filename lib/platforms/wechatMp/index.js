"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
require("./polyfill");
const types_1 = require("oak-domain/lib/types");
const initialize_1 = require("../../initialize");
const assert_1 = __importDefault(require("assert"));
const lodash_1 = require("lodash");
;
async function execute(features, fullpath, action) {
    await features.runningNode.execute(fullpath, action);
}
function callPicker(features, attr, params, entity, parent) {
    const relation = features.cache.judgeRelation(entity, attr);
    let subEntity;
    if (relation === 2) {
        subEntity = attr;
    }
    else {
        (0, assert_1.default)(typeof relation === 'string');
        subEntity = relation;
    }
    let url = `/pages/pickers/${subEntity}/index?oakIsPicker=true&oakParentEntity=${entity}&oakParent=${parent}&oakPath=${attr}`;
    for (const k in params) {
        url += `&${k}=${JSON.stringify(params[k])}`;
    }
    wx.navigateTo({
        url,
    });
}
function createPageOptions(options, doSubscribe, features, exceptionRouterDict) {
    const { formData, isList, pagination } = options;
    const componentOptions = {
        properties: {
            oakEntity: String,
            oakId: String,
            oakPath: String,
            oakParent: String,
            oakProjection: Object,
            oakFilters: Array,
            oakSorters: Array,
            oakIsPicker: Boolean,
            oakParentEntity: String,
            oakFrom: String,
            oakActions: Array,
        },
        methods: {
            async reRender() {
                if (this.data.oakFullpath) {
                    const $rows = await features.runningNode.get(this.data.oakFullpath);
                    const data = await formData.call(this, $rows, features);
                    for (const k in data) {
                        if (data[k] === undefined) {
                            (0, lodash_1.assign)(data, {
                                [k]: null,
                            });
                        }
                    }
                    const dirty = await features.runningNode.isDirty(this.data.oakFullpath);
                    (0, lodash_1.assign)(data, { oakDirty: dirty });
                    if (this.data.oakActions) {
                        const oakLegalActions = [];
                        for (const action of this.data.oakActions) {
                            try {
                                await features.runningNode.testAction(this.data.oakFullpath, action);
                                oakLegalActions.push(action);
                            }
                            catch (e) {
                                if (e instanceof types_1.OakInputIllegalException) {
                                    oakLegalActions.push(action);
                                }
                            }
                        }
                        (0, lodash_1.assign)(data, {
                            oakLegalActions,
                        });
                    }
                    this.setData(data);
                }
            },
            async addNode(path, updateData) {
                await features.runningNode.addNode({
                    parent: path ? `${this.data.oakFullpath}.${path}` : this.data.oakFullpath,
                    updateData,
                });
            },
            async refresh() {
                if (options.projection) {
                    await features.runningNode.refresh(this.data.oakFullpath);
                }
            },
            async onPullDownRefresh() {
                console.log('onPullDownRefresh');
                if (options.projection) {
                    await this.refresh();
                }
            },
            subscribe() {
                if (!this.subscribed) {
                    this.subscribed = doSubscribe(() => this.reRender());
                }
            },
            unsubscribe() {
                if (this.subscribed) {
                    this.subscribed();
                    this.subscribed = undefined;
                }
            },
            setUpdateData(attr, value) {
                if (this.data.oakExecuting) {
                    return;
                }
                return features.runningNode.setUpdateData(this.data.oakFullpath, attr, value);
            },
            callPicker(attr, params) {
                if (this.data.oakExecuting) {
                    return;
                }
                return callPicker(features, attr, params, this.data.oakEntity, this.data.oakFullpath);
            },
            async setForeignKey(id, goBackDelta = -1) {
                if (this.data.oakExecuting) {
                    return;
                }
                const { oakIsPicker } = this.data;
                (0, assert_1.default)(oakIsPicker);
                await features.runningNode.setForeignKey(this.data.oakFullpath, id);
                if (goBackDelta !== 0) {
                    wx.navigateBack({
                        delta: goBackDelta,
                    });
                }
            },
            onForeignKeyPicked(input) {
                const { id } = input.currentTarget.dataset;
                this.setForeignKey(id);
            },
            setFilters(filters) {
                return features.runningNode.setNamedFilters(this.data.oakFullpath, filters);
            },
            async getFilters() {
                const namedFilters = await features.runningNode.getNamedFilters(this.data.oakFullpath);
                const filters = await Promise.all(namedFilters.map(({ filter }) => {
                    if (typeof filter === 'function') {
                        return filter();
                    }
                    return filter;
                }));
                return filters;
            },
            getFilterByName(name) {
                return features.runningNode.getNamedFilterByName(this.data.oakFullpath, name);
            },
            addNamedFilter(filter, refresh = false) {
                return features.runningNode.addNamedFilter(this.data.oakFullpath, filter, refresh);
            },
            removeNamedFilter(filter, refresh = false) {
                return features.runningNode.removeNamedFilter(this.data.oakFullpath, filter, refresh);
            },
            removeNamedFilterByName(name, refresh = false) {
                return features.runningNode.removeNamedFilterByName(this.data.oakFullpath, name, refresh);
            },
            setNamedSorters(sorters) {
                return features.runningNode.setNamedSorters(this.data.oakFullpath, sorters);
            },
            async getSorters() {
                const namedSorters = await features.runningNode.getNamedSorters(this.data.oakFullpath);
                const sorters = await Promise.all(namedSorters.map(({ sorter }) => {
                    if (typeof sorter === 'function') {
                        return sorter();
                    }
                    return sorter;
                }));
                return sorters;
            },
            async getSorterByName(name) {
                const { sorter } = (await features.runningNode.getNamedSorterByName(this.data.oakFullpath, name));
                if (typeof sorter === 'function') {
                    return sorter();
                }
                return sorter;
            },
            addNamedSorter(sorter, refresh = false) {
                return features.runningNode.addNamedSorter(this.data.oakFullpath, sorter, refresh);
            },
            removeNamedSorter(sorter, refresh = false) {
                return features.runningNode.removeNamedSorter(this.data.oakFullpath, sorter, refresh);
            },
            removeSorterByName(name, refresh = false) {
                return features.runningNode.removeNamedSorterByName(this.data.oakFullpath, name, refresh);
            },
            async execute(action, afterExecuted) {
                if (this.data.oakExecuting) {
                    return;
                }
                this.setData({
                    oakExecuting: true,
                    oakFocused: {},
                });
                try {
                    await execute(features, this.data.oakFullpath, action);
                    this.setData({ oakExecuting: false });
                    this.setData({
                        oakError: {
                            type: 'success',
                            msg: '操作成功',
                        },
                    });
                    afterExecuted && afterExecuted();
                }
                catch (err) {
                    if (err instanceof types_1.OakException) {
                        if (err instanceof types_1.OakInputIllegalException) {
                            const attr = err.getAttributes()[0];
                            this.setData({
                                oakFocused: {
                                    [attr]: true,
                                },
                                oakExecuting: false,
                                oakError: {
                                    type: 'warning',
                                    msg: err.message,
                                },
                            });
                        }
                        else {
                            const { name } = err.constructor;
                            const handler = exceptionRouterDict[name];
                            if (handler) {
                                const { hidden, level, handler: fn, router } = handler;
                                if (fn) {
                                    this.setData({
                                        oakExecuting: false,
                                    });
                                    fn(err);
                                }
                                else if (router) {
                                    this.setData({
                                        oakExecuting: false,
                                    });
                                    this.navigateTo({
                                        url: router,
                                    });
                                }
                                else if (!hidden) {
                                    this.setData({
                                        oakExecuting: false,
                                        oakError: {
                                            type: level,
                                            msg: err.message,
                                        },
                                    });
                                }
                            }
                            else {
                                this.setData({
                                    oakExecuting: false,
                                    oakError: {
                                        type: 'warning',
                                        msg: err.message,
                                    },
                                });
                            }
                        }
                    }
                    else {
                        this.setData({
                            oakExecuting: false,
                            oakError: {
                                type: 'error',
                                msg: err.message,
                            },
                        });
                    }
                    throw err;
                }
            },
            navigateTo(options) {
                const { url, events, fail, complete, success, ...rest } = options;
                let url2 = url.includes('?') ? url.concat(`&oakFrom=${this.data.oakFullpath}`) : url.concat(`?oakFrom=${this.data.oakFullpath}`);
                for (const param in rest) {
                    const param2 = param;
                    url2 += `&${param}=${typeof rest[param2] === 'string' ? rest[param2] : JSON.stringify(rest[param2])}`;
                }
                (0, lodash_1.assign)(options, {
                    url: url2
                });
                return wx.navigateTo(options);
            },
            async onLoad() {
                const { oakId, oakEntity, oakPath, oakProjection, oakParent, oakSorters, oakFilters, oakIsPicker, oakFrom, oakActions } = this.data;
                (0, assert_1.default)(!(isList && oakId));
                const filters = [];
                if (oakFilters.length > 0) {
                    // 这里在跳页面的时候用this.navigate应该可以限制传过来的filter的格式
                    filters.push(...oakFilters);
                }
                else if (options.filters) {
                    filters.push(...options.filters.map((ele) => {
                        const { filter, "#name": name } = ele;
                        if (typeof filter === 'function') {
                            return {
                                filter: () => filter(features),
                                ['#name']: name,
                            };
                        }
                        return {
                            filter,
                            ['#name']: name,
                        };
                    }));
                }
                let proj = oakProjection;
                if (!proj && options.projection) {
                    const { projection } = options;
                    proj = typeof projection === 'function' ? () => projection(features) : projection;
                }
                let sorters = [];
                if (oakSorters.length > 0) {
                    // 这里在跳页面的时候用this.navigate应该可以限制传过来的sorter的格式
                    sorters.push(...oakSorters);
                }
                else if (options.sorters) {
                    sorters.push(...options.sorters.map((ele) => {
                        const { sorter, "#name": name } = ele;
                        if (typeof sorter === 'function') {
                            return {
                                sorter: () => sorter(features),
                                ['#name']: name,
                            };
                        }
                        return {
                            sorter,
                            ['#name']: name,
                        };
                    }));
                }
                const node = await features.runningNode.createNode({
                    path: oakPath || options.path,
                    parent: oakParent,
                    entity: (oakEntity || options.entity),
                    isList,
                    isPicker: oakIsPicker,
                    projection: proj,
                    pagination,
                    filters,
                    sorters,
                    id: oakId,
                });
                const oakFullpath = oakParent ? `${oakParent}.${oakPath || options.path}` : oakPath || options.path;
                this.setData({
                    oakEntity: node.getEntity(),
                    oakFullpath,
                    oakFrom,
                    oakActions: oakActions.length > 0 ? oakActions : options.actions || [],
                });
            }
        },
        lifetimes: {
            async created() {
                this.features = features;
            },
            async attached() {
                this.subscribe();
            },
            async ready() {
                await this.refresh();
            },
            async detached() {
                console.log('page detached');
                await features.runningNode.destroyNode(this.data.oakFullpath);
                this.unsubscribe();
                // await context.rollback();
            },
        },
        pageLifetimes: {
            show() {
                // this.subscribe();
            },
            hide() {
                // this.unsubscribe();
            }
        },
    };
    return componentOptions;
}
function createComponentOptions(options, features, exceptionRouterDict) {
    const { formData } = options;
    const componentOptions = {
        properties: {
            oakValue: Object,
            oakEntity: String,
            oakPath: String,
            oakParent: String,
        },
        observers: {
            "oakValue": function (value) {
                /* const $rows = value instanceof Array ? value : [value];
                const fileCarrier = this.data.oakFullpath && await features.runningNode.getFileCarrier(this.data.oakFullpath);
                const data = await formData.call(this, $rows, features, fileCarrier as any);
                for (const k in data) {
                    if (data[k] === undefined) {
                        assign(data, {
                            [k]: null,
                        });
                    }
                }
                const dirty = await features.runningNode.isDirty(this.data.oakFullpath);
                this.setData(assign({}, data, {
                    oakDirty: dirty,
                    oakValue: $rows,
                })); */
                return this.onPropsChanged({
                    value,
                });
            },
            "oakParent": function (parent) {
                return this.onPropsChanged({
                    parent,
                });
            }
        },
        methods: {
            async onPropsChanged(options) {
                const value2 = options.hasOwnProperty('value') ? options.value : this.data.oakValue;
                const parent2 = options.hasOwnProperty('parent') && options.parent;
                const $rows = value2 instanceof Array ? value2 : [value2];
                const data2 = {};
                if (parent2) {
                    const node = await features.runningNode.createNode({
                        path: this.data.oakPath,
                        parent: parent2,
                    });
                    (0, lodash_1.assign)(data2, {
                        oakFullpath: `${parent2}.${this.data.oakPath}`,
                        oakEntity: node.getEntity(),
                    });
                }
                const fullpath = data2.oakFullpath || this.data.oakFullpath;
                const data = await formData.call(this, $rows, features);
                for (const k in data) {
                    if (data[k] === undefined) {
                        (0, lodash_1.assign)(data, {
                            [k]: null,
                        });
                    }
                }
                const dirty = fullpath && await features.runningNode.isDirty(fullpath);
                this.setData((0, lodash_1.assign)(data2, data, {
                    oakDirty: !!dirty,
                    // oakValue: value2,
                }));
            },
            async addNode(path, updateData) {
                await features.runningNode.addNode({
                    parent: path ? `${this.data.oakFullpath}.${path}` : this.data.oakFullpath,
                    updateData,
                });
            },
            async getFilters() {
                const namedFilters = await features.runningNode.getNamedFilters(this.data.oakFullpath);
                const filters = await Promise.all(namedFilters.map(({ filter }) => {
                    if (typeof filter === 'function') {
                        return filter();
                    }
                    return filter;
                }));
                return filters;
            },
            getFilterByName(name) {
                return features.runningNode.getNamedFilterByName(this.data.oakFullpath, name);
            },
            addNamedFilter(namedFilter, refresh = false) {
                return features.runningNode.addNamedFilter(this.data.oakFullpath, namedFilter, refresh);
            },
            removeNamedFilter(namedFilter, refresh = false) {
                return features.runningNode.removeNamedFilter(this.data.oakFullpath, namedFilter, refresh);
            },
            removeNamedFilterByName(name, refresh = false) {
                return features.runningNode.removeNamedFilterByName(this.data.oakFullpath, name, refresh);
            },
            setNamedSorters(namedSorters) {
                return features.runningNode.setNamedSorters(this.data.oakFullpath, namedSorters);
            },
            async getSorters() {
                const namedSorters = await features.runningNode.getNamedSorters(this.data.oakFullpath);
                const sorters = await Promise.all(namedSorters.map(({ sorter }) => {
                    if (typeof sorter === 'function') {
                        return sorter();
                    }
                    return sorter;
                }));
                return sorters;
            },
            async getSorterByName(name) {
                const { sorter } = (await features.runningNode.getNamedSorterByName(this.data.oakFullpath, name));
                if (typeof sorter === 'function') {
                    return sorter();
                }
                return sorter;
            },
            addNamedSorter(namedSorter, refresh = false) {
                return features.runningNode.addNamedSorter(this.data.oakFullpath, namedSorter, refresh);
            },
            removeNamedSorter(namedSorter, refresh = false) {
                return features.runningNode.removeNamedSorter(this.data.oakFullpath, namedSorter, refresh);
            },
            removeSorterByName(name, refresh = false) {
                return features.runningNode.removeNamedSorterByName(this.data.oakFullpath, name, refresh);
            },
            setUpdateData(attr, value) {
                if (this.data.oakExecuting) {
                    return;
                }
                return features.runningNode.setUpdateData(this.data.oakFullpath, attr, value);
            },
            callPicker(attr, params) {
                if (this.data.oakExecuting) {
                    return;
                }
                return callPicker(features, attr, params, this.data.oakEntity, this.data.oakFullpath);
            },
            setFilters(filters) {
                return features.runningNode.setNamedFilters(this.data.oakFullpath, filters);
            },
            /* async execute(action, afterExecuted) {
                if (this.data.oakExecuting) {
                    return;
                }
                this.setData({
                    oakExecuting: true,
                    oakFocused: {},
                });
                try {
                    await execute(features, this.data.oakFullpath, action);
                    this.setData({ oakExecuting: false });
                    afterExecuted && afterExecuted();
                }
                catch (err) {
                    if (err instanceof OakException) {
                        if (err instanceof OakInputIllegalException) {
                            const attr = err.getAttributes()[0];
                            this.setData({
                                oakFocused: {
                                },
                                [attr]: true,
                                oakExecuting: false,
                                oakError: {
                                    level: 'warning',
                                    msg: err.message,
                                },
                            });
                        }
                        else {
                            const { name } = err.constructor;
                            const handler = exceptionRouterDict[name];
                            if (handler) {
                                const { hidden, level, handler: fn, router } = handler;
                                if (fn) {
                                    this.setData({
                                        oakExecuting: false,
                                    });
                                    fn(err);
                                }
                                else if (router) {
                                    this.setData({
                                        oakExecuting: false,
                                    });
                                    this.navigateTo({
                                        url: router,
                                    });
                                }
                                else if (!hidden) {
                                    this.setData({
                                        oakExecuting: false,
                                        oakError: {
                                            level: level!,
                                            msg: err.message,
                                        },
                                    });
                                }
                            }
                            else {
                                this.setData({
                                    oakExecuting: false,
                                    oakError: {
                                        level: 'warning',
                                        msg: err.message,
                                    },
                                });
                            }
                        }
                    }
                    else {
                        this.setData({
                            oakExecuting: false,
                            oakError: {
                                level: 'error',
                                msg: (err as Error).message,
                            },
                        });
                    }
                }
            }, */
            navigateTo(options) {
                const { url } = options;
                const url2 = url.includes('?') ? url.concat(`&oakFrom=${this.data.oakFullpath}`) : url.concat(`?oakFrom=${this.data.oakFullpath}`);
                (0, lodash_1.assign)(options, {
                    url: url2
                });
                return wx.navigateTo(options);
            }
        },
        lifetimes: {
            async created() {
                this.features = features;
            },
            async ready() {
                const { oakPath, oakParent, oakValue } = this.data;
                const $rows = oakValue instanceof Array ? oakValue : [oakValue];
                const data = await formData.call(this, $rows, features);
                for (const k in data) {
                    if (data[k] === undefined) {
                        (0, lodash_1.assign)(data, {
                            [k]: null,
                        });
                    }
                }
                if (oakParent) {
                    // 小程序component ready的时候，父组件还未构造完成
                    const oakFullpath = `${oakParent}.${oakPath}`;
                    const node = await features.runningNode.createNode({
                        path: oakPath,
                        parent: oakParent,
                    });
                    this.setData((0, lodash_1.assign)(data, {
                        oakFullpath,
                        oakEntity: node.getEntity,
                    }));
                }
                else {
                    this.setData(data);
                }
            },
            async detached() {
                console.log('component detached');
                await features.runningNode.destroyNode(this.data.oakFullpath);
            }
        },
    };
    return componentOptions;
}
function mergeLifetimes(lifetimes) {
    return {
        async created() {
            for (const ele of lifetimes) {
                if (ele.created) {
                    await ele.created.call(this);
                }
            }
        },
        async attached() {
            for (const ele of lifetimes) {
                if (ele.attached) {
                    await ele.attached.call(this);
                }
            }
        },
        async detached() {
            for (const ele of lifetimes) {
                if (ele.detached) {
                    await ele.detached.call(this);
                }
            }
        },
        async ready() {
            for (const ele of lifetimes) {
                if (ele.ready) {
                    await ele.ready.call(this);
                }
            }
        },
        async moved() {
            for (const ele of lifetimes) {
                if (ele.moved) {
                    await ele.moved.call(this);
                }
            }
        },
        async error(err) {
            for (const ele of lifetimes) {
                if (ele.error) {
                    await ele.error.call(this, err);
                }
            }
        },
    };
}
function mergePageLifetimes(lifetimes) {
    return {
        async show() {
            for (const ele of lifetimes) {
                if (ele.show) {
                    await ele.show.call(this);
                }
            }
        },
        async hide() {
            for (const ele of lifetimes) {
                if (ele.hide) {
                    await ele.hide.call(this);
                }
            }
        },
        async resize(size) {
            for (const ele of lifetimes) {
                if (ele.resize) {
                    await ele.resize.call(this, size);
                }
            }
        },
    };
}
function mergeMethods(methods) {
    const merged = {};
    const names = (0, lodash_1.union)(...(methods.map(ele => Object.keys(ele))));
    for (const name of names) {
        Object.assign(merged, {
            [name]: function () {
                let result;
                for (const m of methods) {
                    if (m[name]) {
                        result = m[name].apply(this, arguments);
                    }
                }
                return result;
            }
        });
    }
    return merged;
}
function initialize(storageSchema, createFeatures, createContext, exceptionRouters = [], triggers, checkers, aspectDict, initialData, actionDict) {
    const { subscribe, features } = (0, initialize_1.initialize)(storageSchema, createFeatures, createContext, triggers, checkers, aspectDict, initialData, actionDict);
    const exceptionRouterDict = {};
    for (const router of exceptionRouters) {
        (0, lodash_1.assign)(exceptionRouterDict, {
            [router[0].name]: router[1],
        });
    }
    return {
        OakPage: (options, componentOptions = {}) => {
            const oakOptions = createPageOptions(options, subscribe, features, exceptionRouterDict);
            const { properties, pageLifetimes, lifetimes, methods, data, observers } = oakOptions;
            const { properties: p2, pageLifetimes: pl2, lifetimes: l2, methods: m2, data: d2, observers: o2, ...restOptions } = componentOptions;
            const pls = [pageLifetimes];
            if (pl2) {
                pls.push(pl2);
            }
            const ls = [lifetimes];
            if (l2) {
                ls.push(l2);
            }
            return Component({
                data: (0, lodash_1.assign)({}, d2, data),
                properties: (0, lodash_1.assign)({}, p2, properties),
                observers: (0, lodash_1.assign)({}, o2, observers),
                methods: (m2 ? mergeMethods([methods, m2]) : methods),
                pageLifetimes: mergePageLifetimes(pls),
                lifetimes: mergeLifetimes(ls),
                ...restOptions,
            });
        },
        OakComponent: (options, componentOptions = {}) => {
            const oakOptions = createComponentOptions(options, features, exceptionRouterDict);
            const { properties, pageLifetimes, lifetimes, methods, data, observers } = oakOptions;
            const { properties: p2, pageLifetimes: pl2, lifetimes: l2, methods: m2, data: d2, observers: o2, ...restOptions } = componentOptions;
            const pls = [pageLifetimes, pl2].filter(ele => !!ele);
            const ls = [lifetimes, l2].filter(ele => !!ele);
            return Component({
                data: (0, lodash_1.assign)({}, d2, data),
                properties: (0, lodash_1.assign)({}, p2, properties),
                observers: (0, lodash_1.assign)({}, o2, observers),
                methods: (m2 ? mergeMethods([methods, m2]) : methods),
                pageLifetimes: mergePageLifetimes(pls),
                lifetimes: mergeLifetimes(ls),
                ...restOptions,
            });
        },
        features,
    };
}
exports.initialize = initialize;
