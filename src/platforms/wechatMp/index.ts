import './polyfill';
import { Aspect, AttrIllegalError, Checker, Context, DeduceFilter, EntityDict, RowStore, SelectionResult, StorageSchema, Trigger } from "oak-domain/lib/types";
import { Feature } from '../../types/Feature';
import { initialize as init } from '../../initialize';
import { Pagination } from "../../types/Pagination";
import { BasicFeatures } from "../../features";
import assert from "assert";
import { assign } from "lodash";

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
        formData: ($rows: SelectionResult<ED[T]['Schema'], Proj>['result'], features: BasicFeatures<ED, Cxt, AD> & FD) => FormedData;
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
    projection: Proj;
    parent?: string;
    append?: boolean;
    pagination?: Pagination;
    filters?: Array<ED[T]['Selection']['filter']>;
    sorter?: ED[T]['Selection']['sorter'];
    // actions?: EntityDict[T]['Action'][];
    formData: ($rows: SelectionResult<ED[T]['Schema'], Proj>['result'], features: BasicFeatures<ED, Cxt, AD> & FD) => FormedData;
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
    oakSorter: ArrayConstructor;
    oakIsPicker?: BooleanConstructor;
    oakFrom?: StringConstructor;
    oakParentEntity?: StringConstructor;
}

type OakComponentMethods<ED extends EntityDict, T extends keyof ED> = {
    setUpdateData: (input: WechatMiniprogram.Input) => void;
    callPicker: (touch: WechatMiniprogram.Touch) => void;
    setFilters: (filters: DeduceFilter<ED[T]['Schema']>[]) => void;
    execute: (touch: WechatMiniprogram.Touch) => void;
    navigateTo: (...options: Parameters<typeof wx.navigateTo>) => ReturnType<typeof wx.navigateTo>;
};

type OakPageMethods<ED extends EntityDict, T extends keyof ED> = OakComponentMethods<ED, T> & {
    // setUpdateData: (detail: WechatMiniprogram.Input) => void;
    reRender: (extra?: any) => Promise<void>;
    refresh: (extra?: any) => Promise<void>;
    onPullDownRefresh: () => Promise<void>;
    subscribed?: () => void;
    subscribe: () => void;
    unsubscribe: () => void;
    setForeignKey: (id: string, goBackDelta?: number) => Promise<void>;
    onForeignKeyPicked: (touch: WechatMiniprogram.Touch) => void;
};

type OakComponentInstanceInnerProperties<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD>>> = {
    features: BasicFeatures<ED, Cxt, AD> & FD;
};

type OakPageInstanceProperties<
    ED extends EntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD>>
    > = OakPageMethods<ED, T> & OakComponentInstanceInnerProperties<ED, Cxt, AD, FD>;


function setUpdateData<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD>>>(
    features: BasicFeatures<ED, Cxt, AD> & FD,
    fullpath: string,
    input: WechatMiniprogram.Input) {
    const { target, detail } = input;
    const { dataset: { path } } = target;
    const { value } = detail;
    features.runningNode.setUpdateData(fullpath, path, value);
}

function setFilters<ED extends EntityDict, T extends keyof EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD>>>(
    features: BasicFeatures<ED, Cxt, AD> & FD,
    fullpath: string,
    filters: DeduceFilter<EntityDict[T]['Schema']>[]) {
    features.runningNode.setFilters(fullpath, filters);
}

async function execute<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD>>>(
    features: BasicFeatures<ED, Cxt, AD> & FD,
    fullpath: string,
    action?: string, isTry?: boolean) {
    try {
        await features.runningNode.execute(fullpath, action, isTry);
    }
    catch (err) {
        const { message } = err as Error;
        wx.showToast({
            title: message,
            icon: 'error'
        });
        throw err;
    }
}

function callPicker<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD>>>(
    features: BasicFeatures<ED, Cxt, AD> & FD,
    touch: WechatMiniprogram.Touch,
    entity: keyof ED,
    parent: string) {
    const { currentTarget: { dataset } } = touch;
    const { path, ...rest } = dataset;

    const relation = features.cache.judgeRelation(entity, path);
    let subEntity: string;
    if (relation === 2) {
        subEntity = path;
    }
    else {
        assert(typeof relation === 'string');
        subEntity = relation;
    }
    let url = `/pages/pickers/${subEntity}/index?oakIsPicker=true&oakParentEntity=${entity}&oakParent=${parent}&oakPath=${path}`;
    for (const k in rest) {
        url += `&${k}=${JSON.stringify(rest[k])}`;
    }
    wx.navigateTo({
        url,
    });
}

function createPageOptions<ED extends EntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD>>,
    Proj extends ED[T]['Selection']['data'],
    FormedData extends WechatMiniprogram.Component.DataOption>(options: OakPageOption<ED, T, Cxt, AD, FD, Proj, FormedData>, doSubscribe: ReturnType<typeof init>['subscribe'], features: BasicFeatures<ED, Cxt, AD> & FD) {
    const { formData, isList, pagination } = options;
    const componentOptions: WechatMiniprogram.Component.Options<
        {
            oakFullpath: string;
            oakExecuting: boolean;
            oakFocused: object;
            oakDirty: boolean;
        },
        OakPageProperties,
        OakPageMethods<ED, T>,
        OakComponentInstanceInnerProperties<ED, Cxt, AD, FD>
    > = {
        properties: {
            oakEntity: String,
            oakId: String,
            oakPath: String,
            oakParent: String,
            oakProjection: Object,
            oakFilters: Array,
            oakSorter: Array,
            oakIsPicker: Boolean,
            oakParentEntity: String,
            oakFrom: String,
        },
        methods: {
            async reRender() {
                const $rows = await features.runningNode.get(this.data.oakFullpath);
                const data = formData($rows as any, features);
                for (const k in data) {
                    if (data[k] === undefined) {
                        assign(data, {
                            [k]: null,
                        })
                    }
                }
                const dirty = await features.runningNode.isDirty(this.data.oakFullpath);
                this.setData(assign({}, data, { oakDirty: dirty }));
            },

            async refresh() {
                await features.runningNode.refresh(this.data.oakFullpath);
            },

            async onPullDownRefresh() {
                console.log('onPullDownRefresh');
                await this.refresh();
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

            setUpdateData(input) {
                if (this.data.oakExecuting) {
                    return;
                }
                setUpdateData(features, this.data.oakFullpath, input);
            },

            callPicker(touch) {
                if (this.data.oakExecuting) {
                    return;
                }
                callPicker(features, touch, options.entity, this.data.oakFullpath);
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
                if (this.data.oakExecuting) {
                    return;
                }
                setFilters(features, this.data.oakFullpath, filters);
            },

            async execute(touch) {
                if (this.data.oakExecuting) {
                    return;
                }
                const { action, then } = touch.currentTarget.dataset;
                this.setData({
                    oakExecuting: true,
                    oakFocused: {},
                });
                try {
                    await execute(features, this.data.oakFullpath, action);
                    this.setData({ oakExecuting: false });
                    if (then) {
                        ((this as any)[then] as any)();
                    }
                }
                catch (err) {
                    if (err instanceof AttrIllegalError) {
                        const attr = err.getAttributes()[0];
                        this.setData({
                            oakFocused: {
                                [attr]: 'focused',
                            },
                            oakExecuting: false,
                        });
                    }
                    else {
                        this.setData({
                            oakExecuting: false,
                        });
                    }
                }
            },

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

            async attached() {
                this.subscribe();
            },

            async ready() {
                const { oakId, oakEntity, oakPath, oakProjection, oakParent,
                    oakSorter, oakFilters, oakIsPicker, oakFrom } = this.data;
                assert(!(isList && oakId));
                let filters: ED[T]['Selection']['filter'][] | undefined;
                if (oakFilters.length > 0) {
                    filters = oakFilters;
                }
                else if (options.filters) {
                    filters = options.filters;
                }
                await features.runningNode.createNode(
                    oakPath || options.path,
                    oakParent,
                    (oakEntity || options.entity) as T,
                    isList,
                    oakIsPicker,
                    (oakProjection || options.projection) as ED[T]['Selection']['data'],
                    oakId,
                    pagination,
                    filters,
                    oakSorter);
                const oakFullpath = oakParent ? `${oakParent}.${oakPath || options.path}` : oakPath || options.path;
                this.data.oakFullpath = oakFullpath;
                this.data.oakFrom = oakFrom;
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
        doSubscribe: ReturnType<typeof init>['subscribe'],
        features: BasicFeatures<ED, Cxt, AD> & FD) {
    const { formData } = options;

    const componentOptions: WechatMiniprogram.Component.Options<
        {
            oakFullpath: string;
            entity: keyof EntityDict;
            oakExecuting: boolean;
            oakFocused: object;
            oakDirty: boolean;
        },
        OakComponentProperties,
        OakComponentMethods<ED, T>,
        OakComponentInstanceInnerProperties<ED, Cxt, AD, FD>
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
                const data = formData($rows, features);
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
            setUpdateData(input) {
                if (this.data.oakExecuting) {
                    return;
                }
                setUpdateData(features, this.data.oakFullpath, input);
            },

            callPicker(touch) {
                if (this.data.oakExecuting) {
                    return;
                }
                callPicker(features, touch, this.data.entity, this.data.oakFullpath);
            },

            setFilters(filters) {
                if (this.data.oakExecuting) {
                    return;
                }
                setFilters(features, this.data.oakFullpath, filters);
            },

            async execute(touch) {
                if (this.data.oakExecuting) {
                    return;
                }
                const { action } = touch.currentTarget.dataset;
                this.setData({
                    oakExecuting: true,
                    oakFocused: {},
                });
                try {
                    await execute(features, this.data.oakFullpath, action);
                    this.setData({ oakExecuting: false });
                }
                catch (err) {
                    if (err instanceof AttrIllegalError) {
                        const attr = err.getAttributes()[0];
                        this.setData({
                            oakFocused: {
                                [attr]: 'focused',
                            },
                            oakExecuting: false,
                        });
                    }
                    else {
                        this.setData({
                            oakExecuting: false,
                        });
                    }
                }
            },

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
                const data = formData($rows, features);
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

let G_OAKPAGE: any;
let G_OAKCOMPONENT: any;

export function initialize<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD>>>(
    storageSchema: StorageSchema<ED>,
    createFeatures: (basicFeatures: BasicFeatures<ED, Cxt, AD>) => FD,
    createContext: (store: RowStore<ED>) => Cxt,
    triggers?: Array<Trigger<ED, keyof ED>>,
    checkers?: Array<Checker<ED, keyof ED>>,
    aspectDict?: AD,
    initialData?: {
        [T in keyof ED]?: Array<ED[T]['OpSchema']>;
    }
) {
    const { subscribe, features } = init<ED, Cxt, AD, FD>(storageSchema, createFeatures, createContext, triggers, checkers, aspectDict, initialData);

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
                componentOptions: WechatMiniprogram.Component.Options<D, P, M, IS & OakPageInstanceProperties<ED, T, Cxt, AD, FD>, true> = {}) => {
            const oakOptions = createPageOptions(options, subscribe, features);
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
            return Component<D, P & OakPageProperties, M & OakComponentMethods<ED, T>, IS & OakComponentInstanceInnerProperties<ED, Cxt, AD, FD>, true>({
                data: assign({}, d2, data),
                properties: assign({}, p2, properties),
                observers: assign({}, o2, observers),
                methods: {
                    onLoad() {
                        console.log('onLoad', this.data.oakId);
                    },
                    ...m2!,
                    ...methods!,
                },
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
            FormedData extends WechatMiniprogram.Component.DataOption = {}>(options: OakComponentOption<ED, T, Cxt, AD, FD, Proj, FormedData>, componentOptions: WechatMiniprogram.Component.Options<D, P, M, IS> = {}) => {
            const oakOptions = createComponentOptions(options, subscribe, features);
            const { properties, pageLifetimes, lifetimes, methods, data, observers } = oakOptions;
            const { properties: p2, pageLifetimes: pl2, lifetimes: l2, methods: m2, data: d2, observers: o2, ...restOptions } = componentOptions;

            const pls = [pageLifetimes, pl2].filter(ele => !!ele) as Array<Partial<WechatMiniprogram.Component.PageLifetimes>>;
            const ls = [lifetimes, l2].filter(ele => !!ele) as Array<Partial<WechatMiniprogram.Component.Lifetimes>>;

            return Component<D, P, M, IS, false>({
                data: assign({}, d2, data),
                properties: assign({}, p2, properties),
                observers: assign({}, o2, observers),
                methods: assign({}, m2, methods),
                pageLifetimes: mergePageLifetimes(pls),
                lifetimes: mergeLifetimes(ls),
                ...restOptions,
            });
        },
    };
}


export type MakeOakPage<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD>>> = <
    T extends keyof ED,
    D extends WechatMiniprogram.Component.DataOption,
    P extends WechatMiniprogram.Component.PropertyOption,
    M extends WechatMiniprogram.Component.MethodOption,
    Proj extends ED[T]['Selection']['data'],
    IS extends WechatMiniprogram.IAnyObject = {},
    FormedData extends WechatMiniprogram.Component.DataOption = {}>(options: OakPageOption<ED, T, Cxt, AD, FD, Proj, FormedData>,
    componentOptions: WechatMiniprogram.Component.Options<D & FormedData, P, M, IS & OakPageInstanceProperties<ED, T, Cxt, AD, FD>, true>) => string;

export type MakeOakComponent<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD>>> = <
    T extends keyof ED,
    D extends WechatMiniprogram.Component.DataOption,
    P extends WechatMiniprogram.Component.PropertyOption,
    M extends WechatMiniprogram.Component.MethodOption,
    Proj extends ED[T]['Selection']['data'],
    IS extends WechatMiniprogram.IAnyObject = {},
    FormedData extends WechatMiniprogram.Component.DataOption = {}>(options: OakComponentOption<ED, T, Cxt, AD, FD, Proj, FormedData>,
    componentOptions: WechatMiniprogram.Component.Options<D & FormedData, P, M, IS>) => string;