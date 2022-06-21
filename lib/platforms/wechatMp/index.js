"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeMethods = exports.mergePageLifetimes = exports.mergeLifetimes = exports.createComponentOptions = exports.createPageOptions = void 0;
const types_1 = require("oak-domain/lib/types");
const assert_1 = __importDefault(require("assert"));
const lodash_1 = require("lodash");
const index_1 = require("./i18n/index");
;
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
function makeComponentMethods(features, doSubscribe, formData, exceptionRouterDict) {
    return {
        t(key, params) {
            const i18nInstance = (0, index_1.getI18nInstanceWechatMp)();
            if (!i18nInstance) {
                throw new Error('[i18n] ensure run initI18nWechatMp() in app.js before using I18nWechatMp library');
            }
            return i18nInstance.getString(key, params);
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
        async reRender(extra) {
            if (this.data.oakFullpath) {
                const rows = await features.runningTree.getFreshValue(this.data.oakFullpath);
                const dirty = features.runningTree.isDirty(this.data.oakFullpath);
                const oakLegalActions = [];
                if (this.data.newOakActions) {
                    for (const action of this.data.newOakActions) {
                        try {
                            await features.runningTree.testAction(this.data.oakFullpath, action);
                            oakLegalActions.push(action);
                        }
                        catch (e) {
                            if (e instanceof types_1.OakInputIllegalException) {
                                oakLegalActions.push(action);
                            }
                        }
                    }
                }
                const data = await formData.call(this, {
                    data: rows,
                    features,
                    params: this.data,
                    legalActions: oakLegalActions,
                });
                for (const k in data) {
                    if (data[k] === undefined) {
                        (0, lodash_1.assign)(data, {
                            [k]: null,
                        });
                    }
                }
                (0, lodash_1.assign)(data, { oakDirty: dirty });
                if (extra) {
                    (0, lodash_1.assign)(data, extra);
                }
                (0, lodash_1.assign)(data, {
                    oakLegalActions,
                });
                this.setData(data);
            }
        },
        pushNode(path, options) {
            const path2 = path ? `${this.data.oakFullpath}.${path}` : this.data.oakFullpath;
            features.runningTree.pushNode(path2, options || {});
        },
        removeNode(parent, path) {
            features.runningTree.removeNode(parent, path);
        },
        async getFilters() {
            const namedFilters = features.runningTree.getNamedFilters(this.data.oakFullpath);
            const filters = await Promise.all(namedFilters.map(({ filter }) => {
                if (typeof filter === 'function') {
                    return filter();
                }
                return filter;
            }));
            return filters;
        },
        async getFilterByName(name) {
            const filter = features.runningTree.getNamedFilterByName(this.data.oakFullpath, name);
            if (filter?.filter) {
                if (typeof filter.filter === 'function') {
                    return filter.filter();
                }
                return filter.filter;
            }
            return;
        },
        addNamedFilter(namedFilter, refresh = false) {
            return features.runningTree.addNamedFilter(this.data.oakFullpath, namedFilter, refresh);
        },
        removeNamedFilter(namedFilter, refresh = false) {
            return features.runningTree.removeNamedFilter(this.data.oakFullpath, namedFilter, refresh);
        },
        removeNamedFilterByName(name, refresh = false) {
            return features.runningTree.removeNamedFilterByName(this.data.oakFullpath, name, refresh);
        },
        setNamedSorters(namedSorters) {
            return features.runningTree.setNamedSorters(this.data.oakFullpath, namedSorters);
        },
        async getSorters() {
            const namedSorters = features.runningTree.getNamedSorters(this.data.oakFullpath);
            const sorters = (await Promise.all(namedSorters.map(({ sorter }) => {
                if (typeof sorter === 'function') {
                    return sorter();
                }
                return sorter;
            }))).filter(ele => !!ele);
            return sorters;
        },
        async getSorterByName(name) {
            const sorter = features.runningTree.getNamedSorterByName(this.data.oakFullpath, name);
            if (sorter?.sorter) {
                if (typeof sorter.sorter === 'function') {
                    return sorter.sorter();
                }
                return sorter.sorter;
            }
            return;
        },
        addNamedSorter(namedSorter, refresh = false) {
            return features.runningTree.addNamedSorter(this.data.oakFullpath, namedSorter, refresh);
        },
        removeNamedSorter(namedSorter, refresh = false) {
            return features.runningTree.removeNamedSorter(this.data.oakFullpath, namedSorter, refresh);
        },
        removeNamedSorterByName(name, refresh = false) {
            return features.runningTree.removeNamedSorterByName(this.data.oakFullpath, name, refresh);
        },
        resetUpdateData() {
            return features.runningTree.resetUpdateData(this.data.oakFullpath);
        },
        setUpdateData(attr, value) {
            if (this.data.oakExecuting) {
                return;
            }
            return features.runningTree.setUpdateData(this.data.oakFullpath, attr, value);
        },
        callPicker(attr, params) {
            if (this.data.oakExecuting) {
                return;
            }
            const relation = features.cache.judgeRelation(this.data.oakEntity, attr);
            let subEntity;
            if (relation === 2) {
                subEntity = attr;
            }
            else {
                (0, assert_1.default)(typeof relation === 'string');
                subEntity = relation;
            }
            let url = `/pages/pickers/${subEntity}/index?oakIsPicker=true&oakParentEntity=${this.data.oakEntity}&oakParent=${this.data.oakFullpath}&oakPath=${attr}`;
            for (const k in params) {
                url += `&${k}=${JSON.stringify(params[k])}`;
            }
            wx.navigateTo({
                url,
            });
        },
        setFilters(filters) {
            return features.runningTree.setNamedFilters(this.data.oakFullpath, filters);
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
        async execute(action, legalExceptions) {
            if (this.data.oakExecuting) {
                return;
            }
            this.setData({
                oakExecuting: true,
                oakFocused: {},
            });
            try {
                const result = await features.runningTree.execute(this.data.oakFullpath, action);
                this.setData({ oakExecuting: false });
                this.setData({
                    oakError: {
                        type: 'success',
                        msg: '操作成功',
                    },
                });
                return result;
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
                        if (legalExceptions && legalExceptions.includes(name)) {
                            // 如果调用时就知道有异常，直接抛出
                            this.setData({
                                oakExecuting: false,
                            });
                            throw err;
                        }
                        else if (handler) {
                            const { hidden, level, handler: fn, router } = handler;
                            if (!hidden) {
                                this.setData({
                                    oakExecuting: false,
                                    oakError: {
                                        type: level,
                                        msg: err.message,
                                    },
                                });
                            }
                            else {
                                this.setData({
                                    oakExecuting: false,
                                });
                            }
                            if (fn) {
                                fn(err);
                                return;
                            }
                            else if (router) {
                                this.setData({
                                    oakExecuting: false,
                                });
                                this.navigateTo({
                                    url: router,
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
    };
}
function createPageOptions(options, doSubscribe, features, exceptionRouterDict) {
    const { formData, isList, pagination, append = true } = options;
    const componentOptions = {
        properties: {
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
        },
        methods: {
            async refresh() {
                if (options.projection && this.data.oakFullpath) {
                    this.setData({
                        oakLoading: true,
                    });
                    try {
                        await features.runningTree.refresh(this.data.oakFullpath);
                        this.setData({
                            oakLoading: false,
                        });
                    }
                    catch (err) {
                        this.setData({
                            oakLoading: false,
                            oakError: {
                                type: 'error',
                                msg: err.message,
                            },
                        });
                    }
                    ;
                }
            },
            async onPullDownRefresh() {
                if (options.projection) {
                    await this.refresh();
                    if (!this.data.oakLoading) {
                        await wx.stopPullDownRefresh();
                    }
                }
            },
            async onReachBottom() {
                if (isList && append && options.projection) {
                    this.setData({
                        oakMoreLoading: true,
                    });
                    try {
                        await features.runningTree.loadMore(this.data.oakFullpath);
                        this.setData({
                            oakMoreLoading: false,
                        });
                    }
                    catch (err) {
                        this.setData({
                            oakMoreLoading: false,
                            oakError: {
                                type: 'error',
                                msg: err.message,
                            },
                        });
                    }
                }
            },
            setForeignKey(id, goBackDelta = -1) {
                if (this.data.oakExecuting) {
                    return;
                }
                const { oakIsPicker, oakParent, oakPath } = this.data;
                (0, assert_1.default)(oakIsPicker);
                features.runningTree.setForeignKey(oakParent, oakPath, id);
                if (goBackDelta !== 0) {
                    wx.navigateBack({
                        delta: goBackDelta,
                    });
                }
            },
            addForeignKeys(ids, goBackDelta = -1) {
                if (this.data.oakExecuting) {
                    return;
                }
                const { oakIsPicker, oakParent, oakPath } = this.data;
                (0, assert_1.default)(oakIsPicker);
                features.runningTree.addForeignKeys(oakParent, oakPath, ids);
                if (goBackDelta !== 0) {
                    wx.navigateBack({
                        delta: goBackDelta,
                    });
                }
            },
            setUniqueForeignKeys(ids, goBackDelta = -1) {
                if (this.data.oakExecuting) {
                    return;
                }
                const { oakIsPicker, oakParent, oakPath } = this.data;
                (0, assert_1.default)(oakIsPicker);
                features.runningTree.setUniqueForeignKeys(oakParent, oakPath, ids);
                if (goBackDelta !== 0) {
                    wx.navigateBack({
                        delta: goBackDelta,
                    });
                }
            },
            async onLoad(options2) {
                console.log('oak:onLoad');
                const { oakId, oakEntity, oakPath, oakProjection, oakParent, oakSorters, oakFilters, oakIsPicker, oakFrom, oakActions, ...rest } = this.data;
                (0, assert_1.default)(!(isList && oakId));
                const filters = [];
                if (oakFilters?.length > 0) {
                    // 这里在跳页面的时候用this.navigate应该可以限制传过来的filter的格式
                    const oakFilters2 = JSON.parse(oakFilters);
                    filters.push(...oakFilters2);
                }
                else if (options.filters) {
                    for (const ele of options.filters) {
                        const { filter, "#name": name } = ele;
                        filters.push({
                            filter: typeof filter === 'function' ? await filter({
                                features,
                                rest,
                                onLoadOptions: options2,
                            }) : filter,
                            ['#name']: name,
                        });
                    }
                }
                let proj = oakProjection && JSON.parse(oakProjection);
                if (!proj && options.projection) {
                    const { projection } = options;
                    proj = typeof projection === 'function' ? () => projection({
                        features,
                        rest,
                        onLoadOptions: options2,
                    }) : projection;
                }
                let sorters = [];
                if (oakSorters?.length > 0) {
                    // 这里在跳页面的时候用this.navigate应该可以限制传过来的sorter的格式
                    const oakSorters2 = JSON.parse(oakSorters);
                    sorters.push(...oakSorters2);
                }
                else if (options.sorters) {
                    for (const ele of options.sorters) {
                        const { sorter, "#name": name } = ele;
                        sorters.push({
                            sorter: typeof sorter === 'function' ? await sorter({
                                features,
                                rest,
                                onLoadOptions: options2,
                            }) : sorter,
                            ['#name']: name,
                        });
                    }
                }
                const path2 = oakParent ? `${oakParent}:${oakPath || options.path}` : oakPath || options.path;
                const node = await features.runningTree.createNode({
                    path: path2,
                    entity: (oakEntity || options.entity),
                    isList,
                    isPicker: oakIsPicker,
                    projection: proj,
                    pagination,
                    filters,
                    sorters,
                    id: oakId,
                });
                // const oakFullpath = oakParent ? `${oakParent}.${oakPath || options.path}` : oakPath || options.path;
                this.setData({
                    oakEntity: node.getEntity(),
                    oakFullpath: path2,
                    oakFrom,
                    newOakActions: oakActions && JSON.parse(oakActions).length > 0
                        ? JSON.parse(oakActions)
                        : options.actions || [],
                }, () => {
                    this.isReady = true;
                    if (this.isReady) {
                        this.refresh();
                    }
                });
            },
            ...makeComponentMethods(features, doSubscribe, formData, exceptionRouterDict),
        },
        lifetimes: {
            created() {
                this.features = features;
                this.isReady = false;
            },
            attached() {
                this.subscribe();
                const i18nInstance = (0, index_1.getI18nInstanceWechatMp)();
                if (i18nInstance) {
                    this.setData({
                        [index_1.CURRENT_LOCALE_KEY]: i18nInstance.currentLocale,
                        [index_1.CURRENT_LOCALE_DATA]: i18nInstance.translations,
                    });
                }
            },
            ready() {
                this.refresh();
                this.isReady = true;
            },
            detached() {
                features.runningTree.destroyNode(this.data.oakFullpath);
                this.unsubscribe();
                // await context.rollback();
            },
        },
        pageLifetimes: {
            show() {
                this.reRender();
                this.subscribe();
            },
            hide() {
                this.unsubscribe();
            }
        },
    };
    return componentOptions;
}
exports.createPageOptions = createPageOptions;
function createComponentOptions(options, doSubscribe, features, exceptionRouterDict) {
    const { formData, entity } = options;
    const componentOptions = {
        properties: {
            oakEntity: String,
            oakPath: String,
            oakParent: String,
        },
        observers: {
            oakPath: function (path) {
                return this.onPropsChanged({
                    path,
                });
            },
            oakParent: function (parent) {
                return this.onPropsChanged({
                    parent,
                });
            },
        },
        methods: {
            async onPropsChanged(options) {
                const path2 = options.hasOwnProperty('path')
                    ? options.path
                    : this.data.oakPath;
                const parent2 = options.hasOwnProperty('parent')
                    ? options.parent
                    : this.data.oakParent;
                if (path2 && parent2) {
                    const oakFullpath2 = `${parent2}.${path2}`;
                    if (oakFullpath2 !== this.data.oakFullpath) {
                        this.setData({
                            oakFullpath: oakFullpath2,
                            oakEntity: entity,
                        });
                        this.reRender();
                    }
                }
            },
            ...makeComponentMethods(features, doSubscribe, formData, exceptionRouterDict),
        },
        lifetimes: {
            async created() {
                this.features = features;
            },
            async ready() {
                const { oakPath, oakParent } = this.data;
                if (oakParent && oakPath) {
                    const oakFullpath = `${oakParent}.${oakPath}`;
                    this.setData({
                        oakFullpath,
                        oakEntity: entity,
                    });
                    this.reRender();
                }
            },
            async attached() {
                this.subscribe();
                const i18nInstance = (0, index_1.getI18nInstanceWechatMp)();
                if (i18nInstance) {
                    this.setData({
                        [index_1.CURRENT_LOCALE_KEY]: i18nInstance.currentLocale,
                        [index_1.CURRENT_LOCALE_DATA]: i18nInstance.translations,
                    });
                }
            },
            async detached() {
                this.unsubscribe();
                // await context.rollback();
            },
        },
        pageLifetimes: {
            show() {
                this.reRender();
                this.subscribe();
            },
            hide() {
                this.unsubscribe();
            },
        },
    };
    return componentOptions;
}
exports.createComponentOptions = createComponentOptions;
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
exports.mergeLifetimes = mergeLifetimes;
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
exports.mergePageLifetimes = mergePageLifetimes;
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
exports.mergeMethods = mergeMethods;
