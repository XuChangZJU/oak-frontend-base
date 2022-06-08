import './polyfill';
import { Aspect, OakInputIllegalException, Checker, Context, DeduceFilter, EntityDict, RowStore, SelectionResult, StorageSchema, Trigger, OakException, ActionDictOfEntityDict, DeduceSorterItem, DeduceUpdateOperation, DeduceOperation, SelectRowShape, Watcher } from "oak-domain/lib/types";
import { Feature } from '../../types/Feature';
import { initialize as init } from '../../initialize';
import { Pagination } from "../../types/Pagination";
import { BasicFeatures } from "../../features";
import assert from "assert";
import { assign, union } from "lodash";
import { ExceptionHandler, ExceptionRouters } from '../../types/ExceptionRoute';
import { NamedFilterItem, NamedSorterItem } from '../../types/NamedCondition';
import { CreateNodeOptions } from '../../features/runningTree';
import { getI18nInstanceWechatMp, CURRENT_LOCALE_KEY, CURRENT_LOCALE_DATA } from './i18n/index';

type RowSelected<
    ED extends EntityDict,
    T extends keyof ED,
    Proj extends ED[T]['Selection']['data'] = Required<ED[T]['Selection']['data']>
    > = SelectRowShape<ED[T]['Schema'], Proj> | undefined;

type OakComponentOption<
    ED extends EntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD>>,
    FormedData extends WechatMiniprogram.Component.DataOption,
    IsList extends boolean
    > = {
        entity: T;
        isList: IsList;
        formData: (options: {
            data: IsList extends true ? RowSelected<ED, T>[] : RowSelected<ED, T>;
            features: BasicFeatures<ED, Cxt, AD> & FD;
            params?: Record<string, any>;
        }) => Promise<FormedData>;
    };

interface OakPageOption<
    ED extends EntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD>>,
    Proj extends ED[T]['Selection']['data'],
    FormedData extends WechatMiniprogram.Component.DataOption,
    IsList extends boolean,
    > {
    entity: T;
    path: string;
    isList: IsList;
    projection?: Proj | ((options: {
        features: BasicFeatures<ED, Cxt, AD> & FD;
        rest: Record<string, any>;
        onLoadOptions: Record<string, string | undefined>;
    }) => Promise<Proj>);
    parent?: string;
    append?: boolean;
    pagination?: Pagination;
    filters?: Array<{
        filter: ED[T]['Selection']['filter'] | ((options: {
            features: BasicFeatures<ED, Cxt, AD> & FD;
            rest: Record<string, any>;
            onLoadOptions: Record<string, string | undefined>;
        }) => Promise<ED[T]['Selection']['filter']>)
        '#name'?: string;
    }>;
    sorters?: Array<{
        sorter: DeduceSorterItem<ED[T]['Schema']> | ((options: {
            features: BasicFeatures<ED, Cxt, AD> & FD;
            rest: Record<string, any>;
            onLoadOptions: Record<string, string | undefined>;
        }) => Promise<DeduceSorterItem<ED[T]['Schema']>>)
        '#name'?: string;
    }>;
    actions?: ED[T]['Action'][];
    formData: (options: {
        data: IsList extends true ? RowSelected<ED, T, Proj>[] : RowSelected<ED, T, Proj>;
        features: BasicFeatures<ED, Cxt, AD> & FD;
        params?: Record<string, any>;
    }) => Promise<FormedData>;
    ns?: T | T[];
};

type OakComponentProperties = {
    oakEntity: StringConstructor;
    oakPath: StringConstructor;
    oakParent: StringConstructor;
};

type OakPageProperties = {
    oakEntity: StringConstructor;
    oakPath: StringConstructor;
    oakParent: StringConstructor;
    oakId: StringConstructor;
    oakProjection: StringConstructor;
    oakFilters: StringConstructor;
    oakSorters: StringConstructor;
    oakIsPicker: BooleanConstructor;
    oakFrom: StringConstructor;
    oakParentEntity: StringConstructor;
    oakActions: StringConstructor;
    newOakActions: ArrayConstructor;
};

type OakNavigateToParameters<ED extends EntityDict, T extends keyof ED> = {
    oakId?: string;
    oakEntity?: T;
    oakPath?: string;
    oakParent?: string;
    oakProjection?: ED[T]['Selection']['data'],
    oakSorters?: Array<NamedSorterItem<ED, T>>,
    oakFilters?: Array<NamedFilterItem<ED, T>>;
    oakIsPicker?: boolean;
    oakActions?: Array<ED[T]['Action']>
    [k: string]: any;
};

type OakComponentMethods<ED extends EntityDict, T extends keyof ED> = {
    subscribed?: () => void;
    subscribe: () => void;
    unsubscribe: () => void;
    reRender: (extra?: Record<string, any>) => Promise<void>;
    pushNode: (path?: string, options?: Pick<CreateNodeOptions<ED, keyof ED>, 'updateData' | 'beforeExecute' | 'afterExecute'>) => void;
    removeNode: (parent: string, path: string) => void;
    setUpdateData: (attr: string, input: any) => void;
    callPicker: (attr: string, params: Record<string, any>) => void;
    setFilters: (filters: NamedFilterItem<ED, T>[]) => void;
    getFilters: () => Promise<ED[T]['Selection']['filter'][]>;
    getFilterByName: (name: string) => Promise<ED[T]['Selection']['filter']> | undefined;
    addNamedFilter: (filter: NamedFilterItem<ED, T>, refresh?: boolean) => void;
    removeNamedFilter: (filter: NamedFilterItem<ED, T>, refresh?: boolean) => void;
    removeNamedFilterByName: (name: string, refresh?: boolean) => void;
    setNamedSorters: (sorters: NamedSorterItem<ED, T>[]) => void;
    getSorters: () => Promise<ED[T]['Selection']['sorter']>;
    getSorterByName: (name: string) => Promise<DeduceSorterItem<ED[T]['Schema']> | undefined>;
    addNamedSorter: (filter: NamedSorterItem<ED, T>, refresh?: boolean) => void;
    removeNamedSorter: (filter: NamedSorterItem<ED, T>, refresh?: boolean) => void;
    removeNamedSorterByName: (name: string, refresh?: boolean) => void;
    navigateTo: <T2 extends keyof ED>(options: Parameters<typeof wx.navigateTo>[0] & OakNavigateToParameters<ED, T2>) => ReturnType<typeof wx.navigateTo>;
    resetUpdateData: () => void;
    execute: (action: ED[T]['Action'], legalExceptions?: Array<string>) => Promise<DeduceOperation<ED[T]['Schema']> | DeduceOperation<ED[T]['Schema']>[] | undefined>;
    t(key: string, params?: object): string;
};

type ComponentOnPropsChangeOption = {
    path?: string;
    parent?: string;
}

type OakComponentOnlyMethods = {
    onPropsChanged: (options: ComponentOnPropsChangeOption) => Promise<void>;
};

type OakPageMethods<ED extends EntityDict, T extends keyof ED> = OakComponentMethods<ED, T> & {
    refresh: (extra?: any) => Promise<void>;
    onPullDownRefresh: () => Promise<void>;
    onReachBottom: () => Promise<void>;
    onLoad: (options: Record<string, string | undefined>) => Promise<void>;
    setForeignKey: (id: string, goBackDelta?: number) => Promise<void>;
    onForeignKeyPicked: (touch: WechatMiniprogram.Touch) => void;
};

type OakComponentInstanceProperties<
    ED extends EntityDict,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD>>> = {
        features: BasicFeatures<ED, Cxt, AD> & FD;
        isReady: boolean;
    };

type OakPageInstanceProperties<
    ED extends EntityDict,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD>>
    > = OakComponentInstanceProperties<ED, Cxt, AD, FD>;

function callPicker<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD>>>(
    features: BasicFeatures<ED, Cxt, AD> & FD,
    attr: string,
    params: Record<string, any>,
    entity: keyof ED,
    parent: string) {

    const relation = features.cache.judgeRelation(entity, attr);
    let subEntity: string;
    if (relation === 2) {
        subEntity = attr;
    }
    else {
        assert(typeof relation === 'string');
        subEntity = relation;
    }
    let url = `/pages/pickers/${subEntity}/index?oakIsPicker=true&oakParentEntity=${entity as string}&oakParent=${parent}&oakPath=${attr}`;
    for (const k in params) {
        url += `&${k}=${JSON.stringify(params[k])}`;
    }
    wx.navigateTo({
        url,
    });
}

function makeComponentMethods<ED extends EntityDict,
    T extends keyof ED, Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD>>,
    FormedData extends WechatMiniprogram.Component.DataOption,
    IsList extends boolean>(
        features: BasicFeatures<ED, Cxt, AD> & FD,
        doSubscribe: ReturnType<typeof init>['subscribe'],
        formData: OakComponentOption<ED, T, Cxt, AD, FD, FormedData, IsList>['formData'],
        exceptionRouterDict: Record<string, ExceptionHandler>
    ): OakComponentMethods<ED, T> & ThisType<
        WechatMiniprogram.Component.Instance<
            OakComponentData,
            OakPageProperties,
            OakPageMethods<ED, T>,
            OakComponentInstanceProperties<ED, Cxt, AD, FD>,
            false
        >
    > {
    return {
        t(key: string, params?: object) {
                const i18nInstance = getI18nInstanceWechatMp();
                if (!i18nInstance) {
                    throw new Error('[i18n] ensure run initI18nWechatMp() in app.js before using I18nWechatMp library')
                }
                return i18nInstance.getString(key, params);
        },
        subscribe() {
            if (!this.subscribed) {
                this.subscribed = doSubscribe(
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
            if (this.data.oakFullpath) {
                const rows = await features.runningTree.getFreshValue(this.data.oakFullpath);
                const data = await formData.call(this, {
                    data: rows as any,
                    features,
                    params: this.data,
                });
                for (const k in data) {
                    if (data[k] === undefined) {
                        assign(data, {
                            [k]: null,
                        })
                    }
                }
                const dirty = features.runningTree.isDirty(this.data.oakFullpath);
                assign(data, { oakDirty: dirty });

                if (this.data.newOakActions) {
                    const oakLegalActions = [];
                    for (const action of this.data.newOakActions) {
                        try {
                            await features.runningTree.testAction(this.data.oakFullpath, action);
                            oakLegalActions.push(action);
                        }
                        catch (e) {
                            if (e instanceof OakInputIllegalException) {
                                oakLegalActions.push(action);
                            }
                        }
                    }
                    assign(data, {
                        oakLegalActions,
                    });
                }

                if (extra) {
                    assign(data, extra);
                }

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
            const sorters = await Promise.all(
                namedSorters.map(
                    ({ sorter }) => {
                        if (typeof sorter === 'function') {
                            return sorter();
                        }
                        return sorter;
                    }
                )
            );
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

        callPicker(attr: string, params: Record<string, any>) {
            if (this.data.oakExecuting) {
                return;
            }
            return callPicker(features, attr, params, this.data.oakEntity, this.data.oakFullpath);
        },

        setFilters(filters) {
            return features.runningTree.setNamedFilters(this.data.oakFullpath, filters);
        },

        navigateTo(options) {            
            const { url, events, fail, complete, success, ...rest } = options;
            let url2 = url.includes('?') ? url.concat(`&oakFrom=${this.data.oakFullpath}`) : url.concat(`?oakFrom=${this.data.oakFullpath}`);

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
    }
}

type OakPageData = {
    oakFullpath: string;
    oakExecuting: boolean;
    oakFocused: object;
    oakDirty: boolean;
    oakError: {
        type: 'warning' | 'error' | 'success' | 'primary';
        msg: string;
    };
    oakLegalActions: string[];
    oakLoading: boolean;
    oakMoreLoading: boolean;
};

type OakComponentData = {
    // entity: keyof EntityDict;
} & OakPageData;

function createPageOptions<ED extends EntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD>>,
    Proj extends ED[T]['Selection']['data'],
    FormedData extends WechatMiniprogram.Component.DataOption,
    IsList extends boolean>(
        options: OakPageOption<ED, T, Cxt, AD, FD, Proj, FormedData, IsList>,
        doSubscribe: ReturnType<typeof init>['subscribe'],
        features: BasicFeatures<ED, Cxt, AD> & FD,
        exceptionRouterDict: Record<string, ExceptionHandler>) {
    const { formData, isList, pagination, append = true } = options;
    const componentOptions: WechatMiniprogram.Component.Options<
        OakPageData,
        OakPageProperties,
        OakPageMethods<ED, T>,
        OakComponentInstanceProperties<ED, Cxt, AD, FD>
    > = {
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
                    catch(err) {
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
                                msg: (err as Error).message,
                            },
                        });
                    }
                }
            },

            async setForeignKey(id: string, goBackDelta: number = -1) {
                if (this.data.oakExecuting) {
                    return;
                }
                const { oakIsPicker, oakParent, oakPath } = this.data;
                assert(oakIsPicker);
                await features.runningTree.setForeignKey(oakParent, oakPath, id);

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

            async onLoad(options2) {
                console.log('oak:onLoad');
                const { oakId, oakEntity, oakPath, oakProjection, oakParent,
                    oakSorters, oakFilters, oakIsPicker, oakFrom, oakActions, ...rest } = this.data;
                assert(!(isList && oakId));
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
                                onLoadOptions: options2,
                            }) : sorter,
                            ['#name']: name,
                        });
                    }
                }
                const path2 = oakParent ? `${oakParent}:${oakPath || options.path}` : oakPath || options.path;
                const node = await features.runningTree.createNode({
                    path: path2,
                    entity: (oakEntity || options.entity) as T,
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
                    newOakActions: oakActions && JSON.parse(oakActions).length > 0 ? JSON.parse(oakActions) : options.actions || [],
                });
                if (this.isReady) {
                    this.refresh();
                }
            },

            ...makeComponentMethods(features, doSubscribe, formData as any, exceptionRouterDict),
        },

        lifetimes: {
            created() {
                this.features = features;
                this.isReady = false;
            },

            attached() {
                this.subscribe();
                const i18nInstance = getI18nInstanceWechatMp();
                if (i18nInstance) {
                    (this as any).setData({
                        [CURRENT_LOCALE_KEY]: i18nInstance.currentLocale,
                        [CURRENT_LOCALE_DATA]: i18nInstance.translations,
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


function createComponentOptions<ED extends EntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD>>,
    IsList extends boolean,
    FormedData extends WechatMiniprogram.Component.DataOption>(
        options: OakComponentOption<ED, T, Cxt, AD, FD, FormedData, IsList>,
        features: BasicFeatures<ED, Cxt, AD> & FD,
        doSubscribe: ReturnType<typeof init>['subscribe'],
        exceptionRouterDict: Record<string, ExceptionHandler>) {
    const { formData } = options;

    const componentOptions: WechatMiniprogram.Component.Options<
        OakComponentData,
        OakComponentProperties,
        OakComponentMethods<ED, T> & OakComponentOnlyMethods,
        OakComponentInstanceProperties<ED, Cxt, AD, FD>
    > = {
        properties: {
            oakEntity: String,
            oakPath: String,
            oakParent: String,
        },
        observers: {
            "oakPath": function (path) {
                return this.onPropsChanged({
                    path,
                })
            },
            "oakParent": function (parent) {
                return this.onPropsChanged({
                    parent,
                })
            }
        },
        methods: {
            async onPropsChanged(options) {
                const path2 = options.hasOwnProperty('path') ? options.path! : this.data.oakPath;
                const parent2 = options.hasOwnProperty('parent') ? options.parent! : this.data.oakParent;
                if (path2 && parent2) {
                    const oakFullpath2 = `${parent2}.${path2}`;
                    if (oakFullpath2 !== this.data.oakFullpath) {
                        this.setData({
                            oakFullpath: oakFullpath2,
                        })
                        this.reRender();
                    }
                }
            },
            ...makeComponentMethods(features, doSubscribe, formData, exceptionRouterDict)
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
                    });
                    this.reRender();
                }
            },

            async attached() {
                this.subscribe();
                const i18nInstance = getI18nInstanceWechatMp();
                if (i18nInstance) {
                    (this as any).setData({
                        [CURRENT_LOCALE_KEY]: i18nInstance.currentLocale,
                        [CURRENT_LOCALE_DATA]: i18nInstance.translations,
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
            }
        },
    };

    return componentOptions;
}

function mergeLifetimes(lifetimes: Array<Partial<WechatMiniprogram.Component.Lifetimes['lifetimes']>>) {
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
        async error(err: Error) {
            for (const ele of lifetimes) {
                if (ele.error) {
                    await ele.error.call(this, err);
                }
            }
        },
    };
}

function mergePageLifetimes(lifetimes: Array<Partial<WechatMiniprogram.Component.PageLifetimes>>) {
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
        async resize(size: WechatMiniprogram.Page.IResizeOption) {
            for (const ele of lifetimes) {
                if (ele.resize) {
                    await ele.resize.call(this, size);
                }
            }
        },
    };
}

function mergeMethods(methods: Array<Record<string, Function>>) {
    const merged: Record<string, Function> = {};
    const names = union(...(methods.map(
        ele => Object.keys(ele)
    )));
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

export function initialize<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD>>>(
    storageSchema: StorageSchema<ED>,
    createFeatures: (basicFeatures: BasicFeatures<ED, Cxt, AD>) => FD,
    createContext: (store: RowStore<ED, Cxt>, scene: string) => Cxt,
    exceptionRouters: ExceptionRouters = [],
    triggers?: Array<Trigger<ED, keyof ED, Cxt>>,
    checkers?: Array<Checker<ED, keyof ED, Cxt>>,
    watchers?: Array<Watcher<ED, keyof ED, Cxt>>,
    aspectDict?: AD,
    initialData?: {
        [T in keyof ED]?: Array<ED[T]['OpSchema']>;
    },
    actionDict?: ActionDictOfEntityDict<ED>
) {
    const { subscribe, features } = init<ED, Cxt, AD, FD>(storageSchema, createFeatures, createContext, triggers, checkers, watchers, aspectDict, initialData, actionDict);
    const exceptionRouterDict: Record<string, ExceptionHandler> = {};
    for (const router of exceptionRouters) {
        assign(exceptionRouterDict, {
            [router[0].name]: router[1],
        });
    }

    return {
        OakPage: <
            T extends keyof ED,
            D extends WechatMiniprogram.Component.DataOption,
            P extends WechatMiniprogram.Component.PropertyOption,
            M extends WechatMiniprogram.Component.MethodOption,
            IsList extends boolean,
            Proj extends ED[T]['Selection']['data'],
            IS extends WechatMiniprogram.IAnyObject = {},
            FormedData extends WechatMiniprogram.Component.DataOption = {}>(
                options: OakPageOption<ED, T, Cxt, AD, FD, Proj, FormedData, IsList>,
                componentOptions: WechatMiniprogram.Component.Options<D, P, M, IS & OakPageInstanceProperties<ED, Cxt, AD, FD>, true> = {}) => {
            const oakOptions = createPageOptions(options, subscribe, features, exceptionRouterDict);
            const { properties, pageLifetimes, lifetimes, methods, data, observers } = oakOptions;
            const { properties: p2, pageLifetimes: pl2, lifetimes: l2, methods: m2, data: d2, observers: o2, ...restOptions } = componentOptions;

            const pls = [pageLifetimes!];
            if (pl2) {
                pls.push(pl2);
            }

            const ls = [lifetimes!];
            if (l2) {
                ls.push(l2);
            }
            return Component<
                D & OakPageData,
                P & OakPageProperties,
                M & OakComponentMethods<ED, T>,
                IS & OakComponentInstanceProperties<ED, Cxt, AD, FD>, true>({
                    data: assign({}, d2, data),
                    properties: assign({}, p2, properties),
                    observers: assign({}, o2, observers),
                    methods: (m2 ? mergeMethods([methods!, m2]) : methods!) as any,
                    pageLifetimes: mergePageLifetimes(pls),
                    lifetimes: mergeLifetimes(ls),
                    ...restOptions,
                });
        },

        OakComponent: <
            T extends keyof EntityDict,
            D extends WechatMiniprogram.Component.DataOption,
            P extends WechatMiniprogram.Component.PropertyOption,
            M extends WechatMiniprogram.Component.MethodOption,
            IsList extends boolean,
            IS extends WechatMiniprogram.IAnyObject = {},
            FormedData extends WechatMiniprogram.Component.DataOption = {}>(
                options: OakComponentOption<ED, T, Cxt, AD, FD, FormedData, IsList>,
                componentOptions: OakWechatMpOptions<
                    D,
                    P,
                    M,
                    OakPageProperties,
                    OakPageMethods<ED, T>,
                    OakPageData,
                    OakPageInstanceProperties<ED, Cxt, AD, FD>,
                    IS,
                    true
                > = {}) => {
            const oakOptions = createComponentOptions(options, features, subscribe, exceptionRouterDict);
            const { properties, pageLifetimes, lifetimes, methods, data, observers } = oakOptions;
            const { properties: p2, pageLifetimes: pl2, lifetimes: l2, methods: m2, data: d2, observers: o2, ...restOptions } = componentOptions;

            const pls = [pageLifetimes, pl2].filter(ele => !!ele) as Array<Partial<WechatMiniprogram.Component.PageLifetimes>>;
            const ls = [lifetimes, l2].filter(ele => !!ele) as Array<Partial<WechatMiniprogram.Component.Lifetimes>>;

            return Component<
                D & OakComponentData,
                P & OakComponentProperties,
                M & OakComponentMethods<ED, T>,
                IS & OakComponentInstanceProperties<ED, Cxt, AD, FD>, false>({
                    data: assign({}, d2, data),
                    properties: assign({}, p2, properties),
                    observers: assign({}, o2, observers),
                    methods: (m2 ? mergeMethods([methods!, m2]) : methods!) as any,
                    pageLifetimes: mergePageLifetimes(pls),
                    lifetimes: mergeLifetimes(ls),
                    ...restOptions,
                });
        },

        features,
    };
}

/**
 * 根据WechatMiniprogram.Component.Options写的，规定OakPage和OakComponent中第二个参数的定义
 */
type OakWechatMpOptions<
    TData extends WechatMiniprogram.Component.DataOption,
    TProperty extends WechatMiniprogram.Component.PropertyOption,
    TMethod extends WechatMiniprogram.Component.MethodOption,
    InherentProperties extends WechatMiniprogram.Component.PropertyOption,
    InherentMethods extends WechatMiniprogram.Component.MethodOption,
    InherentData extends WechatMiniprogram.Component.DataOption,
    InherentInstanceProperty extends WechatMiniprogram.IAnyObject,
    TCustomInstanceProperty extends WechatMiniprogram.IAnyObject = {},
    TIsPage extends boolean = false,
    > = Partial<TData> &
    Partial<WechatMiniprogram.Component.Property<TProperty>> &
    Partial<WechatMiniprogram.Component.Method<TMethod, TIsPage>> &
    Partial<WechatMiniprogram.Component.OtherOption> &
    Partial<WechatMiniprogram.Component.Lifetimes> &
    ThisType<
        WechatMiniprogram.Component.Instance<
            TData & InherentData,
            TProperty & InherentProperties,
            TMethod & InherentMethods,
            TCustomInstanceProperty & InherentInstanceProperty,
            TIsPage
        >
    >

export type MakeOakPage<
    ED extends EntityDict,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD>>
    > = <
        T extends keyof ED,
        D extends WechatMiniprogram.Component.DataOption,
        P extends WechatMiniprogram.Component.PropertyOption,
        M extends WechatMiniprogram.Component.MethodOption,
        Proj extends ED[T]['Selection']['data'],
        IsList extends boolean,
        IS extends WechatMiniprogram.IAnyObject = {},
        FormedData extends WechatMiniprogram.Component.DataOption = {}
        > (
        options: OakPageOption<ED, T, Cxt, AD, FD, Proj, FormedData, IsList> &
            ThisType<
                WechatMiniprogram.Component.Instance<
                    D & OakPageData,
                    P & OakPageProperties,
                    M & OakPageMethods<ED, T>,
                    IS & OakPageInstanceProperties<ED, Cxt, AD, FD>,
                    true
                >
            >,
        componentOptions: OakWechatMpOptions<
            D,
            P,
            M,
            OakPageProperties,
            OakPageMethods<ED, T>,
            OakPageData & FormedData,
            OakPageInstanceProperties<ED, Cxt, AD, FD>,
            IS,
            true
        >
    ) => string;

export type MakeOakComponent<
    ED extends EntityDict,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD>>
    > = <
        T extends keyof ED,
        D extends WechatMiniprogram.Component.DataOption,
        P extends WechatMiniprogram.Component.PropertyOption,
        M extends WechatMiniprogram.Component.MethodOption,
        IsList extends boolean,
        IS extends WechatMiniprogram.IAnyObject = {},
        FormedData extends WechatMiniprogram.Component.DataOption = {}
        >(
        options: OakComponentOption<ED, T, Cxt, AD, FD, FormedData, IsList> &
            ThisType<
                WechatMiniprogram.Component.Instance<
                    D & OakPageData,
                    P & OakPageProperties,
                    M & OakPageMethods<ED, T>,
                    IS & OakPageInstanceProperties<ED, Cxt, AD, FD>,
                    true
                >
            >,
        componentOptions: OakWechatMpOptions<
            D,
            P,
            M,
            OakComponentProperties,
            OakComponentMethods<ED, T>,
            OakComponentData & FormedData,
            OakComponentInstanceProperties<ED, Cxt, AD, FD>,
            IS,
            false
        >
    ) => string;