import './polyfill';
import { Aspect, OakInputIllegalException, Checker, Context, DeduceFilter, EntityDict, RowStore, SelectionResult, StorageSchema, Trigger, OakException, ActionDictOfEntityDict, DeduceSorterItem } from "oak-domain/lib/types";
import { Feature } from '../../types/Feature';
import { initialize as init } from '../../initialize';
import { Pagination } from "../../types/Pagination";
import { BasicFeatures } from "../../features";
import assert from "assert";
import { assign, intersection, rest, union } from "lodash";
import { ExceptionHandler, ExceptionRouters } from '../../types/ExceptionRoute';
import { NamedFilterItem, NamedSorterItem } from '../../types/NamedCondition';

type OakComponentOption<
    ED extends EntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD>>,
    Proj extends ED[T]['Selection']['data'],
    FormedData extends WechatMiniprogram.Component.DataOption
    > = {
        entity: T;
        formData: ($rows: SelectionResult<ED[T]['Schema'], Proj>['result'], features: BasicFeatures<ED, Cxt, AD> & FD) => Promise<FormedData>;
    };

interface OakPageOption<
    ED extends EntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD>>,
    Proj extends ED[T]['Selection']['data'],
    FormedData extends WechatMiniprogram.Component.DataOption
    > {
    entity: T;
    path: string;
    isList: boolean;
    projection?: Proj | ((features: BasicFeatures<ED, Cxt, AD> & FD) => Promise<Proj>);
    parent?: string;
    append?: boolean;
    pagination?: Pagination;
    filters?: Array<{
        filter: ED[T]['Selection']['filter'] | ((features: BasicFeatures<ED, Cxt, AD> & FD) => Promise<ED[T]['Selection']['filter']>)
        '#name'?: string;
    }>;
    sorters?: Array<{
        sorter: DeduceSorterItem<ED[T]['Schema']> | ((features: BasicFeatures<ED, Cxt, AD> & FD) => Promise<DeduceSorterItem<ED[T]['Schema']>>)
        '#name'?: string;
    }>;
    actions?: ED[T]['Action'][];
    formData: ($rows: SelectionResult<ED[T]['Schema'], Proj>['result'], features: BasicFeatures<ED, Cxt, AD> & FD) => Promise<FormedData>;
};

type OakComponentProperties = {
    oakEntity: StringConstructor;
    oakPath: StringConstructor;
    oakValue: ObjectConstructor;
    oakParent: StringConstructor;
};

type OakPageProperties = {
    oakEntity: StringConstructor;
    oakPath: StringConstructor;
    oakParent: StringConstructor;
    oakId: StringConstructor;
    oakProjection: ObjectConstructor;
    oakFilters: ArrayConstructor;
    oakSorters: ArrayConstructor;
    oakIsPicker: BooleanConstructor;
    oakFrom: StringConstructor;
    oakParentEntity: StringConstructor;
    oakActions: ArrayConstructor;
}

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
};

type OakComponentMethods<ED extends EntityDict, T extends keyof ED> = {
    setUpdateData: (attr: string, input: any) => void;
    callPicker: (attr: string, params: Record<string, any>) => void;
    setFilters: (filters: NamedFilterItem<ED, T>[]) => void;
    navigateTo: <T2 extends keyof ED>(options: Parameters<typeof wx.navigateTo>[0] & OakNavigateToParameters<ED, T2>) => ReturnType<typeof wx.navigateTo>;
};

type OakPageMethods<ED extends EntityDict, T extends keyof ED> = OakComponentMethods<ED, T> & {
    reRender: (extra?: any) => Promise<void>;
    refresh: (extra?: any) => Promise<void>;
    onPullDownRefresh: () => Promise<void>;
    onLoad: () => Promise<void>;
    subscribed?: () => void;
    subscribe: () => void;
    unsubscribe: () => void;
    setForeignKey: (id: string, goBackDelta?: number) => Promise<void>;
    onForeignKeyPicked: (touch: WechatMiniprogram.Touch) => void;
    execute: (action: ED[T]['Action'], afterExecuted?: () => any) => Promise<void>;
};

type OakComponentInstanceProperties<
    ED extends EntityDict,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD>>> = {
        features: BasicFeatures<ED, Cxt, AD> & FD;
    };

type OakPageInstanceProperties<
    ED extends EntityDict,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD>>
    > = OakComponentInstanceProperties<ED, Cxt, AD, FD>;



function setFilters<ED extends EntityDict, T extends keyof EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD>>>(
    features: BasicFeatures<ED, Cxt, AD> & FD,
    fullpath: string,
    filters: NamedFilterItem<ED, T>[]) {
    features.runningNode.setFilters(fullpath, filters);
}

async function execute<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD>>>(
    features: BasicFeatures<ED, Cxt, AD> & FD,
    fullpath: string,
    action: string) {

    await features.runningNode.execute(fullpath, action);
}

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
    let url = `/pages/pickers/${subEntity}/index?oakIsPicker=true&oakParentEntity=${entity}&oakParent=${parent}&oakPath=${attr}`;
    for (const k in params) {
        url += `&${k}=${JSON.stringify(params[k])}`;
    }
    wx.navigateTo({
        url,
    });
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
    oakLegalActions: string[],
};

type OakComponentData = {
    entity: keyof EntityDict;
} & OakPageData;

function createPageOptions<ED extends EntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD>>,
    Proj extends ED[T]['Selection']['data'],
    FormedData extends WechatMiniprogram.Component.DataOption>(
        options: OakPageOption<ED, T, Cxt, AD, FD, Proj, FormedData>, doSubscribe: ReturnType<typeof init>['subscribe'],
        features: BasicFeatures<ED, Cxt, AD> & FD,
        exceptionRouterDict: Record<string, ExceptionHandler>) {
    const { formData, isList, pagination } = options;
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
                const $rows = await features.runningNode.get(this.data.oakFullpath);
                const data = await formData($rows as any, features);
                for (const k in data) {
                    if (data[k] === undefined) {
                        assign(data, {
                            [k]: null,
                        })
                    }
                }
                const dirty = await features.runningNode.isDirty(this.data.oakFullpath);
                assign(data, { oakDirty: dirty });

                if (this.data.oakActions) {
                    const oakLegalActions = [];
                    for (const action of this.data.oakActions) {
                        try {
                            await features.runningNode.testAction(this.data.oakFullpath, action);
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

                this.setData(data);
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

            setUpdateData(attr, value) {
                if (this.data.oakExecuting) {
                    return;
                }
                features.runningNode.setUpdateData(this.data.oakFullpath, attr, value);
            },

            callPicker(attr: string, params: Record<string, any>) {
                if (this.data.oakExecuting) {
                    return;
                }
                callPicker(features, attr, params, options.entity, this.data.oakFullpath);
            },

            async setForeignKey(id: string, goBackDelta: number = -1) {
                if (this.data.oakExecuting) {
                    return;
                }
                const { oakParentEntity, oakPath, oakIsPicker, oakFullpath } = this.data;
                if (oakIsPicker) {
                    const relation = features.cache.judgeRelation(oakParentEntity as any, oakPath);
                    const parentPath = oakFullpath.slice(0, oakFullpath.lastIndexOf('.'));
                    if (relation === 2) {
                        await features.runningNode.setMultipleData(parentPath, [['entity', oakPath], ['entityId', id]]);
                    }
                    else {
                        assert(typeof relation === 'string');
                        await features.runningNode.setUpdateData(parentPath, `${oakPath}Id`, id);
                    }

                    if (goBackDelta !== 0) {
                        wx.navigateBack({
                            delta: goBackDelta,
                        });
                    }
                }
            },

            onForeignKeyPicked(input) {
                const { id } = input.currentTarget.dataset;
                this.setForeignKey(id);
            },

            setFilters(filters) {
                setFilters(features, this.data.oakFullpath, filters as any);
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
                                            type: level!,
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
                                msg: (err as Error).message,
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
                    const param2 = param as unknown as keyof typeof rest;
                    url2 += `&${param}=${typeof rest[param2] === 'string' ? rest[param2] : JSON.stringify(rest[param2])}`;
                }
                assign(options, {
                    url: url2
                });
                return wx.navigateTo(options);
            },

            async onLoad() {
                const { oakId, oakEntity, oakPath, oakProjection, oakParent,
                    oakSorters, oakFilters, oakIsPicker, oakFrom, oakActions } = this.data;
                assert(!(isList && oakId));
                const filters: NamedFilterItem<ED, T>[] = [];
                if (oakFilters.length > 0) {
                    // 这里在跳页面的时候用this.navigate应该可以限制传过来的filter的格式
                    filters.push(...oakFilters);
                }
                else if (options.filters) {
                    filters.push(...options.filters.map(
                        (ele) => {
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
                            }
                        }
                    ));
                }
                let proj = oakProjection;
                if (!proj && options.projection) {
                    const { projection } = options;
                    proj = typeof projection === 'function' ? () => projection(features) : projection;
                }
                let sorters: NamedSorterItem<ED, T>[] = [];
                if (oakSorters.length > 0) {
                    // 这里在跳页面的时候用this.navigate应该可以限制传过来的sorter的格式
                    sorters.push(...oakSorters);
                }
                else if (options.sorters) {
                    sorters.push(...options.sorters.map(
                        (ele) => {
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
                            }
                        }
                    ));
                }
                await features.runningNode.createNode(
                    oakPath || options.path,
                    oakParent,
                    (oakEntity || options.entity) as T,
                    isList,
                    oakIsPicker,
                    proj,
                    pagination,
                    filters,
                    sorters,
                    undefined,
                    oakId);
                const oakFullpath = oakParent ? `${oakParent}.${oakPath || options.path}` : oakPath || options.path;
                this.data.oakFullpath = oakFullpath;
                this.data.oakFrom = oakFrom;
                this.data.oakActions = oakActions.length > 0 ? oakActions : options.actions || [];
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


function createComponentOptions<ED extends EntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD>>,
    Proj extends ED[T]['Selection']['data'],
    FormedData extends WechatMiniprogram.Component.DataOption>(
        options: OakComponentOption<ED, T, Cxt, AD, FD, Proj, FormedData>,
        features: BasicFeatures<ED, Cxt, AD> & FD,
        exceptionRouterDict: Record<string, ExceptionHandler>) {
    const { formData } = options;

    const componentOptions: WechatMiniprogram.Component.Options<
        OakComponentData,
        OakComponentProperties,
        OakComponentMethods<ED, T>,
        OakComponentInstanceProperties<ED, Cxt, AD, FD>
    > = {
        properties: {
            oakValue: Object,
            oakEntity: String,
            oakPath: String,
            oakParent: String,
        },
        observers: {
            "oakValue": async function (value) {
                const $rows = value instanceof Array ? value : [value];
                const data = await formData($rows, features);
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
                }));
            },
            "oakParent": async function (oakParent) {
                if (oakParent) {
                    const oakFullpath = `${oakParent}.${this.data.oakPath}`;
                    const entity = await features.runningNode.createNode(this.data.oakPath, oakParent);
                    this.setData({
                        oakFullpath,
                        entity,
                    } as any);
                }
            }
        },
        methods: {
            setUpdateData(attr, value) {
                if (this.data.oakExecuting) {
                    return;
                }
                features.runningNode.setUpdateData(this.data.oakFullpath, attr, value);
            },

            callPicker(attr: string, params: Record<string, any>) {
                if (this.data.oakExecuting) {
                    return;
                }
                callPicker(features, attr, params, this.data.entity, this.data.oakFullpath);
            },

            setFilters(filters) {
                if (this.data.oakExecuting) {
                    return;
                }
                setFilters(features, this.data.oakFullpath, filters as any);
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
                assign(options, {
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
                const data = await formData($rows, features);
                for (const k in data) {
                    if (data[k] === undefined) {
                        assign(data, {
                            [k]: null,
                        });
                    }
                }
                if (oakParent) {
                    // 小程序component ready的时候，父组件还未构造完成
                    const oakFullpath = `${oakParent}.${oakPath}`;
                    const entity = await features.runningNode.createNode(oakPath, oakParent) as string;
                    this.setData(assign(data, {
                        oakFullpath,
                        entity,
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
            [name]: async function () {
                for (const m of methods) {
                    if (m[name]) {
                        await m[name].apply(this, arguments);
                    }
                }
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
    aspectDict?: AD,
    initialData?: {
        [T in keyof ED]?: Array<ED[T]['OpSchema']>;
    },
    actionDict?: ActionDictOfEntityDict<ED>
) {
    const { subscribe, features } = init<ED, Cxt, AD, FD>(storageSchema, createFeatures, createContext, triggers, checkers, aspectDict, initialData, actionDict);
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
            Proj extends ED[T]['Selection']['data'],
            IS extends WechatMiniprogram.IAnyObject = {},
            FormedData extends WechatMiniprogram.Component.DataOption = {}>(
                options: OakPageOption<ED, T, Cxt, AD, FD, Proj, FormedData>,
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
            Proj extends ED[T]['Selection']['data'],
            IS extends WechatMiniprogram.IAnyObject = {},
            FormedData extends WechatMiniprogram.Component.DataOption = {}>(
                options: OakComponentOption<ED, T, Cxt, AD, FD, Proj, FormedData>,
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
            const oakOptions = createComponentOptions(options, features, exceptionRouterDict);
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
        IS extends WechatMiniprogram.IAnyObject = {},
        FormedData extends WechatMiniprogram.Component.DataOption = {}
        > (
        options: OakPageOption<ED, T, Cxt, AD, FD, Proj, FormedData>,
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
        Proj extends ED[T]['Selection']['data'],
        IS extends WechatMiniprogram.IAnyObject = {},
        FormedData extends WechatMiniprogram.Component.DataOption = {}
        >(
        options: OakComponentOption<ED, T, Cxt, AD, FD, Proj, FormedData>,
        componentOptions: OakWechatMpOptions<
            D,
            P,
            M,
            OakComponentProperties,
            OakComponentMethods<ED, T>,
            OakComponentData & FormedData,
            OakComponentInstanceProperties<ED, Cxt, AD, FD>,
            IS,
            true
        >
    ) => string;