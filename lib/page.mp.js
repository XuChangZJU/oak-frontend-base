"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComponent = exports.createPage = void 0;
const assert_1 = __importDefault(require("assert"));
const lodash_1 = require("lodash");
const types_1 = require("oak-domain/lib/types");
const Feature_1 = require("./types/Feature");
function makeHiddenComponentMethods(features, formData) {
    return {
        subscribe() {
            if (!this.subscribed) {
                this.subscribed = (0, Feature_1.subscribe)(() => this.reRender());
            }
        },
        unsubscribe() {
            if (this.subscribed) {
                this.subscribed();
                this.subscribed = undefined;
            }
        },
        async reRender(extra) {
            if (this.state.oakFullpath) {
                const rows = features.runningTree.getFreshValue(this.state.oakFullpath);
                const dirty = features.runningTree.isDirty(this.state.oakFullpath);
                const oakLegalActions = [];
                if (this.state.newOakActions) {
                    for (const action of this.state.newOakActions) {
                        try {
                            await features.runningTree.testAction(this.state.oakFullpath, action);
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
                    params: this.state,
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
    };
}
function makeCommonComponentMethods(features, exceptionRouterDict) {
    return {
        t(key, params) {
            return 'not implemented';
        },
        callPicker(attr, params) {
            if (this.state.oakExecuting) {
                return;
            }
            const relation = features.cache.judgeRelation(this.state.oakEntity, attr);
            let subEntity;
            if (relation === 2) {
                subEntity = attr;
            }
            else {
                (0, assert_1.default)(typeof relation === 'string');
                subEntity = relation;
            }
            let url = `/pages/pickers/${subEntity}/index?oakIsPicker=true&oakParentEntity=${this.state.oakEntity}&oakParent=${this.state.oakFullpath}&oakPath=${attr}`;
            for (const k in params) {
                url += `&${k}=${JSON.stringify(params[k])}`;
            }
            wx.navigateTo({
                url,
            });
        },
        navigateTo(options) {
            const { url, events, fail, complete, success, ...rest } = options;
            let url2 = url.includes('?') ? url.concat(`&oakFrom=${this.state.oakFullpath}`) : url.concat(`?oakFrom=${this.state.oakFullpath}`);
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
            if (this.state.oakExecuting) {
                return;
            }
            this.setData({
                oakExecuting: true,
                oakFocused: {},
            });
            try {
                const result = await features.runningTree.execute(this.state.oakFullpath, action);
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
        resetUpdateData() {
            return features.runningTree.resetUpdateData(this.state.oakFullpath);
        },
        setUpdateData(attr, value) {
            if (this.state.oakExecuting) {
                return;
            }
            return features.runningTree.setUpdateData(this.state.oakFullpath, attr, value);
        },
    };
}
function makeListComponentMethods(features) {
    return {
        pushNode(path, options) {
            const path2 = path ? `${this.state.oakFullpath}.${path}` : this.state.oakFullpath;
            features.runningTree.pushNode(path2, options || {});
        },
        removeNode(parent, path) {
            features.runningTree.removeNode(parent, path);
        },
        async getFilters() {
            const namedFilters = features.runningTree.getNamedFilters(this.state.oakFullpath);
            const filters = await Promise.all(namedFilters.map(({ filter }) => {
                if (typeof filter === 'function') {
                    return filter();
                }
                return filter;
            }));
            return filters;
        },
        async getFilterByName(name) {
            const filter = features.runningTree.getNamedFilterByName(this.state.oakFullpath, name);
            if (filter?.filter) {
                if (typeof filter.filter === 'function') {
                    return filter.filter();
                }
                return filter.filter;
            }
            return;
        },
        addNamedFilter(namedFilter, refresh = false) {
            return features.runningTree.addNamedFilter(this.state.oakFullpath, namedFilter, refresh);
        },
        removeNamedFilter(namedFilter, refresh = false) {
            return features.runningTree.removeNamedFilter(this.state.oakFullpath, namedFilter, refresh);
        },
        removeNamedFilterByName(name, refresh = false) {
            return features.runningTree.removeNamedFilterByName(this.state.oakFullpath, name, refresh);
        },
        setNamedSorters(namedSorters) {
            return features.runningTree.setNamedSorters(this.state.oakFullpath, namedSorters);
        },
        async getSorters() {
            const namedSorters = features.runningTree.getNamedSorters(this.state.oakFullpath);
            const sorters = (await Promise.all(namedSorters.map(({ sorter }) => {
                if (typeof sorter === 'function') {
                    return sorter();
                }
                return sorter;
            }))).filter(ele => !!ele);
            return sorters;
        },
        async getSorterByName(name) {
            const sorter = features.runningTree.getNamedSorterByName(this.state.oakFullpath, name);
            if (sorter?.sorter) {
                if (typeof sorter.sorter === 'function') {
                    return sorter.sorter();
                }
                return sorter.sorter;
            }
            return;
        },
        addNamedSorter(namedSorter, refresh = false) {
            return features.runningTree.addNamedSorter(this.state.oakFullpath, namedSorter, refresh);
        },
        removeNamedSorter(namedSorter, refresh = false) {
            return features.runningTree.removeNamedSorter(this.state.oakFullpath, namedSorter, refresh);
        },
        removeNamedSorterByName(name, refresh = false) {
            return features.runningTree.removeNamedSorterByName(this.state.oakFullpath, name, refresh);
        },
        setFilters(filters) {
            return features.runningTree.setNamedFilters(this.state.oakFullpath, filters);
        },
    };
}
function makePageMethods(features, options) {
    return {
        async refresh() {
            if (options.projection && this.state.oakFullpath) {
                this.setData({
                    oakLoading: true,
                });
                try {
                    await features.runningTree.refresh(this.state.oakFullpath);
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
                if (!this.state.oakLoading) {
                    await wx.stopPullDownRefresh();
                }
            }
        },
        async onReachBottom() {
            if (options.isList && options.append && options.projection) {
                this.setData({
                    oakMoreLoading: true,
                });
                try {
                    await features.runningTree.loadMore(this.state.oakFullpath);
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
            if (this.state.oakExecuting) {
                return;
            }
            const { oakIsPicker, oakParent, oakPath } = this.state;
            (0, assert_1.default)(oakIsPicker);
            features.runningTree.setForeignKey(oakParent, oakPath, id);
            if (goBackDelta !== 0) {
                wx.navigateBack({
                    delta: goBackDelta,
                });
            }
        },
        addForeignKeys(ids, goBackDelta = -1) {
            if (this.state.oakExecuting) {
                return;
            }
            const { oakIsPicker, oakParent, oakPath } = this.state;
            (0, assert_1.default)(oakIsPicker);
            features.runningTree.addForeignKeys(oakParent, oakPath, ids);
            if (goBackDelta !== 0) {
                wx.navigateBack({
                    delta: goBackDelta,
                });
            }
        },
        setUniqueForeignKeys(ids, goBackDelta = -1) {
            if (this.state.oakExecuting) {
                return;
            }
            const { oakIsPicker, oakParent, oakPath } = this.state;
            (0, assert_1.default)(oakIsPicker);
            features.runningTree.setUniqueForeignKeys(oakParent, oakPath, ids);
            if (goBackDelta !== 0) {
                wx.navigateBack({
                    delta: goBackDelta,
                });
            }
        },
        async onLoad(pageOption) {
            const { oakId, oakEntity, oakPath, oakProjection, oakParent, oakSorters, oakFilters, oakIsPicker, oakFrom, oakActions, ...rest } = this.state;
            (0, assert_1.default)(!(options.isList && oakId));
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
                            onLoadOptions: pageOption,
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
                    onLoadOptions: pageOption,
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
                            onLoadOptions: pageOption,
                        }) : sorter,
                        ['#name']: name,
                    });
                }
            }
            const path2 = oakParent ? `${oakParent}:${oakPath || options.path}` : oakPath || options.path;
            const node = await features.runningTree.createNode({
                path: path2,
                entity: (oakEntity || options.entity),
                isList: options.isList,
                isPicker: oakIsPicker,
                projection: proj,
                pagination: options.pagination,
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
                this.refresh();
            });
        },
    };
}
function createPage(options, features, exceptionRouterDict, context) {
    const { formData, isList } = options;
    const hiddenMethods = makeHiddenComponentMethods(features, formData);
    const commonMethods = makeCommonComponentMethods(features, exceptionRouterDict);
    const listMethods = isList ? makeListComponentMethods(features) : {};
    const { onLoad, onPullDownRefresh, onReachBottom, ...restPageMethods } = makePageMethods(features, options);
    const { methods, lifetimes, pageLifetimes } = options;
    return Component({
        data: (0, lodash_1.assign)({}, options.data, {
            oakFullpath: '',
        }),
        properties: (0, lodash_1.assign)({}, options.properties, {
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
        methods: {
            setState(data, callback) {
                this.setData(data, () => {
                    this.state = this.data;
                    callback && callback();
                });
            },
            async onLoad(pageOption) {
                this.state = this.data;
                await onLoad(pageOption);
                methods?.onLoad && methods?.onLoad(pageOption);
            },
            async onPullDownRefresh() {
                await onPullDownRefresh();
                methods?.onPullDownRefresh && methods?.onPullDownRefresh();
            },
            async onReachBottom() {
                await onReachBottom();
                methods?.onReachBottom && methods?.onReachBottom();
            },
            ...hiddenMethods,
            ...commonMethods,
            ...listMethods,
            ...restPageMethods,
            ...(methods ? (0, lodash_1.omit)(methods, ['onLoad', 'onPullDownRefresh', 'onReachBottom']) : {}),
        },
        lifetimes: {
            created() {
                const { setData } = this;
                this.setData = (data, callback) => {
                    setData.call(this, data, () => {
                        this.state = this.data;
                        callback && callback();
                    });
                };
                context.setScene(options.path);
                lifetimes?.created && lifetimes.created();
            },
            attached() {
                this.subscribe();
                /* const i18nInstance = getI18nInstanceWechatMp();
                if (i18nInstance) {
                    (this as any).setData({
                        [CURRENT_LOCALE_KEY]: i18nInstance.currentLocale,
                        [CURRENT_LOCALE_DATA]: i18nInstance.translations,
                    });
                } */
                lifetimes?.attached && lifetimes.attached();
            },
            ready() {
                lifetimes?.ready && lifetimes.ready();
            },
            detached() {
                features.runningTree.destroyNode(this.data.oakFullpath);
                this.unsubscribe();
                lifetimes?.detached && lifetimes.detached();
            },
            error(err) {
                lifetimes?.error && lifetimes.error(err);
            },
            moved() {
                lifetimes?.moved && lifetimes.moved();
            }
        },
        pageLifetimes: {
            show() {
                context.setScene(options.path);
                this.reRender();
                this.subscribe();
                pageLifetimes?.show && pageLifetimes.show();
            },
            hide() {
                this.unsubscribe();
                pageLifetimes?.hide && pageLifetimes.hide();
            },
            resize(size) {
                pageLifetimes?.resize && pageLifetimes.resize(size);
            }
        },
    });
}
exports.createPage = createPage;
function createComponent(options, features, exceptionRouterDict, context) {
    const { formData, isList, entity } = options;
    const hiddenMethods = makeHiddenComponentMethods(features, formData);
    const commonMethods = makeCommonComponentMethods(features, exceptionRouterDict);
    const listMethods = isList ? makeListComponentMethods(features) : {};
    const { methods, lifetimes, pageLifetimes } = options;
    return Component({
        data: (0, lodash_1.assign)({}, options.data, {
            oakEntity: '',
            oakFullpath: '',
        }),
        properties: (0, lodash_1.assign)({}, options.properties, {
            oakEntity: String,
            oakPath: String,
            oakParent: String,
        }),
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
            ...options.observers,
        },
        methods: {
            setState(data, callback) {
                this.setData(data, () => {
                    this.state = this.data;
                    callback && callback();
                });
            },
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
                        this.setState({
                            oakFullpath: oakFullpath2,
                            oakEntity: entity,
                        });
                        this.reRender();
                    }
                }
            },
            ...hiddenMethods,
            ...commonMethods,
            ...listMethods,
            ...methods,
        },
        lifetimes: {
            async created() {
                const { setData } = this;
                this.setData = (data, callback) => {
                    setData.call(this, data, () => {
                        this.state = this.data;
                        callback && callback();
                    });
                };
                lifetimes?.created && lifetimes.created();
            },
            async ready() {
                this.state = this.data;
                const { oakPath, oakParent } = this.data;
                if (oakParent && oakPath) {
                    const oakFullpath = `${oakParent}.${oakPath}`;
                    this.setState({
                        oakFullpath,
                        oakEntity: entity,
                    });
                    this.reRender();
                }
                lifetimes?.ready && lifetimes.ready();
            },
            async attached() {
                this.subscribe();
                /* const i18nInstance = getI18nInstanceWechatMp();
                if (i18nInstance) {
                    (this as any).setData({
                        [CURRENT_LOCALE_KEY]: i18nInstance.currentLocale,
                        [CURRENT_LOCALE_DATA]: i18nInstance.translations,
                    });
                } */
                lifetimes?.attached && lifetimes.attached();
            },
            async detached() {
                this.unsubscribe();
                lifetimes?.detached && lifetimes.detached();
            },
            error(err) {
                lifetimes?.error && lifetimes.error(err);
            },
            moved() {
                lifetimes?.moved && lifetimes.moved();
            }
        },
        pageLifetimes: {
            show() {
                this.reRender();
                this.subscribe();
                pageLifetimes?.show && pageLifetimes.show();
            },
            hide() {
                this.unsubscribe();
                pageLifetimes?.hide && pageLifetimes.hide();
            },
            resize(size) {
                pageLifetimes?.resize && pageLifetimes.resize(size);
            }
        },
    });
}
exports.createComponent = createComponent;
