/// <reference types="wechat-miniprogram" />
/// <reference types="wechat-miniprogram" />
import { Aspect, Context, EntityDict, DeduceSorterItem, DeduceOperation, SelectRowShape } from "oak-domain/lib/types";
import { CommonAspectDict } from 'oak-common-aspect';
import { Feature } from './Feature';
import { Pagination } from "./Pagination";
import { BasicFeatures } from "../features";
import { NamedFilterItem, NamedSorterItem } from './NamedCondition';
import { CreateNodeOptions } from '../features/runningTree';
declare type RowSelected<ED extends EntityDict, T extends keyof ED, Proj extends ED[T]['Selection']['data'] = Required<ED[T]['Selection']['data']>> = SelectRowShape<ED[T]['Schema'], Proj> | undefined;
interface ComponentOption<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>, FormedData extends WechatMiniprogram.Component.DataOption, IsList extends boolean> {
    entity: T;
    isList: IsList;
    formData: (options: {
        data: IsList extends true ? RowSelected<ED, T>[] : RowSelected<ED, T>;
        features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD;
        params?: Record<string, any>;
        legalActions?: string[];
    }) => Promise<FormedData>;
    actions?: ED[T]['Action'][];
}
interface PageOption<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>, Proj extends ED[T]['Selection']['data'], FormedData extends WechatMiniprogram.Component.DataOption, IsList extends boolean> {
    entity: T;
    path: string;
    isList: IsList;
    projection?: Proj | ((options: {
        features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD;
        rest: Record<string, any>;
        onLoadOptions: Record<string, string | undefined>;
    }) => Promise<Proj>);
    append?: boolean;
    pagination?: Pagination;
    filters?: Array<{
        filter: ED[T]['Selection']['filter'] | ((options: {
            features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD;
            rest: Record<string, any>;
            onLoadOptions: Record<string, string | undefined>;
        }) => Promise<ED[T]['Selection']['filter']> | undefined);
        '#name'?: string;
    }>;
    sorters?: Array<{
        sorter: DeduceSorterItem<ED[T]['Schema']> | ((options: {
            features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD;
            rest: Record<string, any>;
            onLoadOptions: Record<string, string | undefined>;
        }) => Promise<DeduceSorterItem<ED[T]['Schema']>>);
        '#name'?: string;
    }>;
    actions?: ED[T]['Action'][];
    formData: (options: {
        data: IsList extends true ? RowSelected<ED, T, Proj>[] : RowSelected<ED, T, Proj>;
        features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD;
        params?: Record<string, any>;
        legalActions?: string[];
    }) => Promise<FormedData>;
    ns?: T | T[];
}
/**
 * 这里对微信小程序中一些常用的字段进行了封装，维持住在各个平台下的通用性
 * 更多的字段未来再加入
 */
export declare type OakPageOption<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>, Proj extends ED[T]['Selection']['data'], FormedData extends WechatMiniprogram.Component.DataOption, IsList extends boolean, TData extends WechatMiniprogram.Component.DataOption, TProperty extends WechatMiniprogram.Component.PropertyOption, TMethod extends WechatMiniprogram.Component.MethodOption> = PageOption<ED, T, Cxt, AD, FD, Proj, FormedData, IsList> & Partial<WechatMiniprogram.Component.Data<TData>> & Partial<WechatMiniprogram.Component.Property<TProperty>> & Partial<WechatMiniprogram.Component.Method<TMethod, true>> & Partial<{
    lifetimes: WechatMiniprogram.Component.Lifetimes['lifetimes'];
    pageLifetimes?: Partial<WechatMiniprogram.Component.PageLifetimes> | undefined;
}> & ThisType<{
    features: FD & BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>;
    state: TData & FormedData & OakPageData<ED, T>;
    props: WechatMiniprogram.Component.PropertyOptionToData<OakPageProperties & TProperty>;
    setState: (data: Partial<TData>, callback?: () => void) => Promise<void>;
} & TMethod & WechatMiniprogram.Page.ILifetime & OakCommonComponentMethods<ED, T> & (IsList extends true ? OakListComponentMethods<ED, T> : {}) & OakPageMethods & OakPageInstanceProperties<ED, Cxt, AD, FD>>;
export declare type OakComponentOption<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>, FormedData extends WechatMiniprogram.Component.DataOption, IsList extends boolean, TData extends WechatMiniprogram.Component.DataOption, TProperty extends WechatMiniprogram.Component.PropertyOption, TMethod extends WechatMiniprogram.Component.MethodOption> = ComponentOption<ED, T, Cxt, AD, FD, FormedData, IsList> & Partial<WechatMiniprogram.Component.Data<TData>> & Partial<WechatMiniprogram.Component.Property<TProperty>> & Partial<WechatMiniprogram.Component.Method<TMethod, false>> & Partial<{
    lifetimes: WechatMiniprogram.Component.Lifetimes['lifetimes'];
    observers: Record<string, (...args: any[]) => any>;
    pageLifetimes: Partial<WechatMiniprogram.Component.PageLifetimes> | undefined;
    externalClasses: string[];
}> & ThisType<{
    features: FD & BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>;
    state: TData & FormedData & OakComponentData<ED, T>;
    props: WechatMiniprogram.Component.PropertyOptionToData<OakComponentProperties & TProperty>;
    setState: (data: Partial<TData>, callback?: () => void) => Promise<void>;
    triggerEvent: <DetailType = any>(name: string, detail?: DetailType, options?: WechatMiniprogram.Component.TriggerEventOption) => void;
} & TMethod & OakCommonComponentMethods<ED, T> & (IsList extends true ? OakListComponentMethods<ED, T> : {})>;
export declare type OakComponentProperties = {
    oakEntity: StringConstructor;
    oakPath: StringConstructor;
    oakParent: StringConstructor;
};
export declare type OakPageProperties = OakComponentProperties & {
    oakId: StringConstructor;
    oakProjection: StringConstructor;
    oakFrom: StringConstructor;
    oakParentEntity: StringConstructor;
    oakActions: StringConstructor;
    newOakActions: ArrayConstructor;
};
export declare type OakListPageProperties = {
    oakFilters: StringConstructor;
    oakSorters: StringConstructor;
    oakIsPicker: BooleanConstructor;
};
declare type OakNavigateToParameters<ED extends EntityDict, T extends keyof ED> = {
    oakId?: string;
    oakEntity?: T;
    oakPath?: string;
    oakParent?: string;
    oakProjection?: ED[T]['Selection']['data'];
    oakSorters?: Array<NamedSorterItem<ED, T>>;
    oakFilters?: Array<NamedFilterItem<ED, T>>;
    oakIsPicker?: boolean;
    oakActions?: Array<ED[T]['Action']>;
    [k: string]: any;
};
export declare type OakHiddenComponentMethods = {
    subscribed?: () => void;
    subscribe: () => void;
    unsubscribe: () => void;
};
export declare type OakCommonComponentMethods<ED extends EntityDict, T extends keyof ED> = {
    resolveInput: <K extends string>(input: any, keys?: K[]) => {
        dataset?: Record<string, any>;
        value?: string;
    } & {
        [k in K]?: any;
    };
    reRender: (extra?: Record<string, any>) => Promise<void>;
    navigateTo: <T2 extends keyof ED>(options: Parameters<typeof wx.navigateTo>[0] & OakNavigateToParameters<ED, T2>) => ReturnType<typeof wx.navigateTo>;
    navigateBack: (option?: {
        delta: number;
    }) => void;
    resetUpdateData: () => void;
    setUpdateData: (attr: string, input: any) => void;
    t(key: string, params?: object): string;
    callPicker: (attr: string, params: Record<string, any>) => void;
    setForeignKey: (id: string, goBackDelta?: number) => void;
    addForeignKeys: (ids: string[], goBackDelta?: number) => void;
    setUniqueForeignKeys: (ids: string[], goBackDelta?: number) => void;
    execute: (action: ED[T]['Action'], legalExceptions?: Array<string>) => Promise<DeduceOperation<ED[T]['Schema']> | DeduceOperation<ED[T]['Schema']>[] | undefined>;
};
export declare type OakListComponentMethods<ED extends EntityDict, T extends keyof ED> = {
    pushNode: (path?: string, options?: Pick<CreateNodeOptions<ED, keyof ED>, 'updateData' | 'beforeExecute' | 'afterExecute'>) => void;
    removeNode: (parent: string, path: string) => void;
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
};
declare type ComponentOnPropsChangeOption = {
    path?: string;
    parent?: string;
};
export declare type OakComponentOnlyMethods = {
    onPropsChanged: (options: ComponentOnPropsChangeOption) => Promise<void>;
};
export declare type OakPageMethods = {
    refresh: (extra?: any) => Promise<void>;
    onPullDownRefresh: () => Promise<void>;
    onReachBottom: () => Promise<void>;
    onLoad: (options: Record<string, string | undefined>) => Promise<void>;
};
export declare type OakComponentInstanceProperties<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>> = {
    features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD;
    isReady: boolean;
};
export declare type OakPageInstanceProperties<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>> = OakComponentInstanceProperties<ED, Cxt, AD, FD>;
export declare type OakPageData<ED extends EntityDict, T extends keyof ED> = {
    oakFullpath: string;
    oakExecuting: boolean;
    oakFocused: object;
    oakDirty: boolean;
    oakError: {
        type: 'warning' | 'error' | 'success' | 'primary';
        msg: string;
    };
    oakLegalActions: ED[T]['Action'][];
    oakLoading: boolean;
    oakLoadingMore: boolean;
};
export declare type OakComponentData<ED extends EntityDict, T extends keyof ED> = {} & OakPageData<ED, T>;
export {};
