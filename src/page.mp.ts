import assert from "assert";
import { assign, omit } from "lodash";
import { CommonAspectDict } from "oak-common-aspect";
import { Aspect, Context, DeduceSorterItem, EntityDict, OakException, OakInputIllegalException } from "oak-domain/lib/types";
import { BasicFeatures } from "./features";
import { ExceptionHandler } from "./types/ExceptionRoute";
import { Feature, subscribe } from "./types/Feature";
import { NamedFilterItem, NamedSorterItem } from "./types/NamedCondition";
import { OakCommonComponentMethods, OakComponentData, OakComponentOption, OakComponentProperties, OakHiddenComponentMethods, OakListComponentMethods, OakPageMethods, OakPageOption } from "./types/Page";

type ComponentThisType<ED extends EntityDict,
    T extends keyof ED,
    FormedData extends WechatMiniprogram.Component.DataOption,
    IsList extends boolean,
    TData extends WechatMiniprogram.Component.DataOption = {},
    TProperty extends WechatMiniprogram.Component.PropertyOption = {},
    TMethod extends WechatMiniprogram.Component.MethodOption = {}> = ThisType<{
        state: TData & FormedData & OakComponentData<ED, T>;
        props: OakComponentProperties & WechatMiniprogram.Component.PropertyOptionToData<TProperty>;
        setState: (
            data: Partial<TData>,
            callback?: () => void,
        ) => Promise<void>;
        triggerEvent: <DetailType = any>(
            name: string,
            detail?: DetailType,
            options?: WechatMiniprogram.Component.TriggerEventOption
        ) => void
    } &
        TMethod &
        OakCommonComponentMethods<ED, T> &
        OakHiddenComponentMethods &
        (IsList extends true ? OakListComponentMethods<ED, T> : {})
    >;

function makeHiddenComponentMethods<ED extends EntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>,
    FormedData extends WechatMiniprogram.Component.DataOption,
    Proj extends ED[T]['Selection']['data'],
    IsList extends boolean,
    TData extends WechatMiniprogram.Component.DataOption = {},
    TProperty extends WechatMiniprogram.Component.PropertyOption = {},
    TMethod extends WechatMiniprogram.Component.MethodOption = {}>(
        features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD,
        formData: OakPageOption<ED, T, Cxt, AD, FD, Proj, FormedData, IsList, TData, TProperty, TMethod>['formData']
    ): OakHiddenComponentMethods & ComponentThisType<ED, T, FormedData, IsList, TData, TProperty, TMethod> {

    return {
        subscribe() {
            if (!this.subscribed) {
                this.subscribed = subscribe(
                    () => this.reRender()
                );
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
                            if (e instanceof OakInputIllegalException) {
                                oakLegalActions.push(action);
                            }
                        }
                    }
                }

                const data = await formData.call(this, {
                    data: rows as any,
                    features,
                    params: this.state,
                    legalActions: oakLegalActions,
                });
                for (const k in data) {
                    if (data[k] === undefined) {
                        assign(data, {
                            [k]: null,
                        })
                    }
                }
                assign(data, { oakDirty: dirty });

                if (extra) {
                    assign(data, extra);
                }

                assign(data, {
                    oakLegalActions,
                });
                this.setData(data);
            }
        },
    };
}

function makeCommonComponentMethods<ED extends EntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>,
    FormedData extends WechatMiniprogram.Component.DataOption,
    IsList extends boolean,
    TData extends WechatMiniprogram.Component.DataOption = {},
    TProperty extends WechatMiniprogram.Component.PropertyOption = {},
    TMethod extends WechatMiniprogram.Component.MethodOption = {}>(
        features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD,
        exceptionRouterDict: Record<string, ExceptionHandler>,
): OakCommonComponentMethods<ED, T> & ComponentThisType<ED, T, FormedData, IsList, TData, TProperty, TMethod> {
    return {
        t(key: string, params?: object) {
            return 'not implemented';
        },

        callPicker(attr: string, params: Record<string, any>) {
            if (this.state.oakExecuting) {
                return;
            }

            const relation = features.cache.judgeRelation(this.state.oakEntity, attr);
            let subEntity: string;
            if (relation === 2) {
                subEntity = attr;
            }
            else {
                assert(typeof relation === 'string');
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
                const param2 = param as unknown as keyof typeof rest;
                url2 += `&${param}=${typeof rest[param2] === 'string' ? rest[param2] : JSON.stringify(rest[param2])}`;
            }
            assign(options, {
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
                if (err instanceof OakException) {
                    if (err instanceof OakInputIllegalException) {
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
                                        type: level!,
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
                            msg: (err as Error).message,
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

function makeListComponentMethods<ED extends EntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>,
    FormedData extends WechatMiniprogram.Component.DataOption,
    IsList extends boolean,
    TData extends WechatMiniprogram.Component.DataOption = {},
    TProperty extends WechatMiniprogram.Component.PropertyOption = {},
    TMethod extends WechatMiniprogram.Component.MethodOption = {}>(
        features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD
    ): OakListComponentMethods<ED, T> & ComponentThisType<ED, T, FormedData, IsList, TData, TProperty, TMethod> {
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
            const filters = await Promise.all(
                namedFilters.map(
                    ({ filter }) => {
                        if (typeof filter === 'function') {
                            return filter();
                        }
                        return filter;
                    }
                )
            );
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
            const sorters = (await Promise.all(
                namedSorters.map(
                    ({ sorter }) => {
                        if (typeof sorter === 'function') {
                            return sorter();
                        }
                        return sorter;
                    }
                )
            )).filter(ele => !!ele) as DeduceSorterItem<ED[T]['Schema']>[];
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

function makePageMethods<ED extends EntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>,
    FormedData extends WechatMiniprogram.Component.DataOption,
    Proj extends ED[T]['Selection']['data'],
    IsList extends boolean,
    TData extends WechatMiniprogram.Component.DataOption = {},
    TProperty extends WechatMiniprogram.Component.PropertyOption = {},
    TMethod extends WechatMiniprogram.Component.MethodOption = {}>(
        features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD,
        options: OakPageOption<ED, T, Cxt, AD, FD, Proj, FormedData, IsList, TData, TProperty, TMethod>
    ): OakPageMethods & ComponentThisType<ED, T, FormedData, IsList, TData, TProperty, TMethod> {
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
                            msg: (err as Error).message,
                        },
                    });
                };
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
                            msg: (err as Error).message,
                        },
                    });
                }
            }
        },

        setForeignKey(id: string, goBackDelta: number = -1) {
            if (this.state.oakExecuting) {
                return;
            }
            const { oakIsPicker, oakParent, oakPath } = this.state;
            assert(oakIsPicker);
            features.runningTree.setForeignKey(oakParent, oakPath, id);

            if (goBackDelta !== 0) {
                wx.navigateBack({
                    delta: goBackDelta,
                });
            }
        },

        addForeignKeys(ids: string[], goBackDelta: number = -1) {
            if (this.state.oakExecuting) {
                return;
            }
            const { oakIsPicker, oakParent, oakPath } = this.state;
            assert(oakIsPicker);
            features.runningTree.addForeignKeys(oakParent, oakPath, ids);

            if (goBackDelta !== 0) {
                wx.navigateBack({
                    delta: goBackDelta,
                });
            }
        },

        setUniqueForeignKeys(ids: string[], goBackDelta: number = -1) {
            if (this.state.oakExecuting) {
                return;
            }
            const { oakIsPicker, oakParent, oakPath } = this.state;
            assert(oakIsPicker);
            features.runningTree.setUniqueForeignKeys(oakParent, oakPath, ids);

            if (goBackDelta !== 0) {
                wx.navigateBack({
                    delta: goBackDelta,
                });
            }
        },

        async onLoad(pageOption) {
            const { oakId, oakEntity, oakPath, oakProjection, oakParent,
                oakSorters, oakFilters, oakIsPicker, oakFrom, oakActions, ...rest } = this.state;
            assert(!(options.isList && oakId));
            const filters: NamedFilterItem<ED, T>[] = [];
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
            let sorters: NamedSorterItem<ED, T>[] = [];
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
                entity: (oakEntity || options.entity) as T,
                isList: options.isList,
                isPicker: oakIsPicker,
                projection: proj,
                pagination: options.pagination,
                filters,
                sorters,
                id: oakId,
            });
            // const oakFullpath = oakParent ? `${oakParent}.${oakPath || options.path}` : oakPath || options.path;
            this.setData(
                {
                    oakEntity: node.getEntity(),
                    oakFullpath: path2,
                    oakFrom,
                    newOakActions:
                        oakActions && JSON.parse(oakActions).length > 0
                            ? JSON.parse(oakActions)
                            : options.actions || [],
                },
                () => {
                    this.refresh();
                }
            );
        },
    };
}

export function createPage<
    ED extends EntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>,
    Proj extends ED[T]['Selection']['data'],
    FormedData extends WechatMiniprogram.Component.DataOption,
    IsList extends boolean,
    TData extends WechatMiniprogram.Component.DataOption = {},
    TProperty extends WechatMiniprogram.Component.PropertyOption = {},
    TMethod extends WechatMiniprogram.Component.MethodOption = {}
>(
    options: OakPageOption<ED, T, Cxt, AD, FD, Proj, FormedData, IsList, TData, TProperty, TMethod>,
    features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD,
    exceptionRouterDict: Record<string, ExceptionHandler>,
    context: Cxt
) {
    const { formData, isList } = options;
    const hiddenMethods = makeHiddenComponentMethods(features, formData);
    const commonMethods = makeCommonComponentMethods(features, exceptionRouterDict);
    const listMethods = isList ? makeListComponentMethods(features) : {};
    const { onLoad, onPullDownRefresh, onReachBottom, ...restPageMethods } = makePageMethods(features, options);

    const { methods, lifetimes, pageLifetimes } = options;
    return Component({
        data: assign({}, options.data, {
            oakFullpath: '',
        }),
        properties: assign({}, options.properties, {
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
            setState(data: any, callback?: () => void) {
                this.setData(data, () => {
                    (this as any).state = this.data;
                    callback && callback();
                });
            },
            async onLoad(pageOption: Record<string, string | undefined>) {
                (this as any).state = this.data;
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
            ...(methods ? omit(methods, ['onLoad', 'onPullDownRefresh', 'onReachBottom']) : {}),
        },
        lifetimes: {
            created() {
                const { setData } = this;
                this.setData = (data, callback) => {
                    setData.call(this, data, () => {
                        (this as any).state = this.data;
                        callback && callback();
                    });
                }
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

            error(err: Error) {
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

export function createComponent<
    ED extends EntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>,
    FormedData extends WechatMiniprogram.Component.DataOption,
    IsList extends boolean,
    TData extends WechatMiniprogram.Component.DataOption = {},
    TProperty extends WechatMiniprogram.Component.PropertyOption = {},
    TMethod extends WechatMiniprogram.Component.MethodOption = {}
>(
    options: OakComponentOption<ED, T, Cxt, AD, FD, FormedData, IsList, TData, TProperty, TMethod>,
    features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD,
    exceptionRouterDict: Record<string, ExceptionHandler>,
    context: Cxt
) {
    const { formData, isList, entity } = options;
    const hiddenMethods = makeHiddenComponentMethods(features, formData);
    const commonMethods = makeCommonComponentMethods(features, exceptionRouterDict);
    const listMethods = isList ? makeListComponentMethods(features) : {};
    const { methods, lifetimes, pageLifetimes } = options;

    return Component({
        data: assign({}, options.data, {
            oakEntity: '',
            oakFullpath: '',
        }),
        properties: assign({}, options.properties, {
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
            setState(data: any, callback?: () => void) {
                this.setData(data, () => {
                    (this as any).state = this.data;
                    callback && callback();
                });
            },
            async onPropsChanged(options: {
                path?: string;
                parent?: string;
            }) {
                const path2 = options.hasOwnProperty('path')
                    ? options.path!
                    : this.data.oakPath;
                const parent2 = options.hasOwnProperty('parent')
                    ? options.parent!
                    : this.data.oakParent;
                if (path2 && parent2) {
                    const oakFullpath2 = `${parent2}.${path2}`;
                    if (oakFullpath2 !== this.data.oakFullpath) {
                        this.setState({
                            oakFullpath: oakFullpath2,
                            oakEntity: entity as string,
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
                        (this as any).state = this.data;
                        callback && callback();
                    });
                }
                lifetimes?.created && lifetimes.created();
            },

            async ready() {
                (this as any).state = this.data;
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

            error(err: Error) {
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
    })
}


export type MakeOakPage<
    ED extends EntityDict,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>
    > = <
        T extends keyof ED,
        Proj extends ED[T]['Selection']['data'],
        FormedData extends WechatMiniprogram.Component.DataOption,
        IsList extends boolean,
        TData extends WechatMiniprogram.Component.DataOption,
        TProperty extends WechatMiniprogram.Component.PropertyOption,
        TMethod extends WechatMiniprogram.Component.MethodOption
        > (options: OakPageOption<ED, T, Cxt, AD, FD, Proj, FormedData, IsList, TData, TProperty, TMethod>) => string;

export type MakeOakComponent<
    ED extends EntityDict,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>
    > = <
    T extends keyof ED,
    Proj extends ED[T]['Selection']['data'],
    FormedData extends WechatMiniprogram.Component.DataOption,
    IsList extends boolean,
    TData extends WechatMiniprogram.Component.DataOption,
    TProperty extends WechatMiniprogram.Component.PropertyOption,
    TMethod extends WechatMiniprogram.Component.MethodOption
        >(options: OakComponentOption<ED, T, Cxt, AD, FD, FormedData, IsList, TData, TProperty, TMethod>) => string;