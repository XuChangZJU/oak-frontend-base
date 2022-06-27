/// <reference types="wechat-miniprogram" />
/// <reference types="wechat-miniprogram" />
/// <reference types="wechat-miniprogram" />
/// <reference types="wechat-miniprogram" />
/// <reference types="wechat-miniprogram" />
/// <reference types="wechat-miniprogram" />
/// <reference types="wechat-miniprogram" />
import { Aspect, Context, EntityDict, DeduceSorterItem, DeduceOperation, SelectRowShape } from "oak-domain/lib/types";
import { Feature } from '../../types/Feature';
import { Pagination } from "../../types/Pagination";
import { BasicFeatures } from "../../features";
import { ExceptionHandler } from '../../types/ExceptionRoute';
import { NamedFilterItem, NamedSorterItem } from '../../types/NamedCondition';
import { CreateNodeOptions } from '../../features/runningTree';
import { CommonAspectDict } from 'oak-common-aspect';
declare type RowSelected<ED extends EntityDict, T extends keyof ED, Proj extends ED[T]['Selection']['data'] = Required<ED[T]['Selection']['data']>> = SelectRowShape<ED[T]['Schema'], Proj> | undefined;
export declare type OakComponentOption<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>, FormedData extends WechatMiniprogram.Component.DataOption, IsList extends boolean> = {
    entity: T;
    isList: IsList;
    formData: (options: {
        data: IsList extends true ? RowSelected<ED, T>[] : RowSelected<ED, T>;
        features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD;
        params?: Record<string, any>;
        legalActions?: string[];
    }) => Promise<FormedData>;
};
export interface OakPageOption<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>, Proj extends ED[T]['Selection']['data'], FormedData extends WechatMiniprogram.Component.DataOption, IsList extends boolean> {
    entity: T;
    path: string;
    isList: IsList;
    projection?: Proj | ((options: {
        features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD;
        rest: Record<string, any>;
        onLoadOptions: Record<string, string | undefined>;
    }) => Promise<Proj>);
    parent?: string;
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
export declare type OakComponentProperties = {
    oakEntity: StringConstructor;
    oakPath: StringConstructor;
    oakParent: StringConstructor;
};
export declare type OakPageProperties = {
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
export declare type OakComponentMethods<ED extends EntityDict, T extends keyof ED> = {
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
declare type ComponentOnPropsChangeOption = {
    path?: string;
    parent?: string;
};
declare type OakComponentOnlyMethods = {
    onPropsChanged: (options: ComponentOnPropsChangeOption) => Promise<void>;
};
export declare type OakPageMethods<ED extends EntityDict, T extends keyof ED> = OakComponentMethods<ED, T> & {
    refresh: (extra?: any) => Promise<void>;
    onPullDownRefresh: () => Promise<void>;
    onReachBottom: () => Promise<void>;
    onLoad: (options: Record<string, string | undefined>) => Promise<void>;
    setForeignKey: (id: string, goBackDelta?: number) => void;
    addForeignKeys: (ids: string[], goBackDelta?: number) => void;
    setUniqueForeignKeys: (ids: string[], goBackDelta?: number) => void;
};
export declare type OakComponentInstanceProperties<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>> = {
    features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD;
    isReady: boolean;
};
export declare type OakPageInstanceProperties<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>> = OakComponentInstanceProperties<ED, Cxt, AD, FD>;
export declare type OakPageData = {
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
export declare type OakComponentData = {} & OakPageData;
export declare function createPageOptions<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>, Proj extends ED[T]['Selection']['data'], FormedData extends WechatMiniprogram.Component.DataOption, IsList extends boolean>(options: OakPageOption<ED, T, Cxt, AD, FD, Proj, FormedData, IsList>, features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD, exceptionRouterDict: Record<string, ExceptionHandler>, context: Cxt): WechatMiniprogram.Component.Options<OakPageData, OakPageProperties, OakPageMethods<ED, T>, OakComponentInstanceProperties<ED, Cxt, AD, FD>, false>;
export declare function createComponentOptions<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>, IsList extends boolean, FormedData extends WechatMiniprogram.Component.DataOption>(options: OakComponentOption<ED, T, Cxt, AD, FD, FormedData, IsList>, features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD, exceptionRouterDict: Record<string, ExceptionHandler>): WechatMiniprogram.Component.Options<OakPageData, OakComponentProperties, OakComponentMethods<ED, T> & OakComponentOnlyMethods, OakComponentInstanceProperties<ED, Cxt, AD, FD>, false>;
export declare function mergeLifetimes(lifetimes: Array<Partial<WechatMiniprogram.Component.Lifetimes['lifetimes']>>): {
    created(): Promise<void>;
    attached(): Promise<void>;
    detached(): Promise<void>;
    ready(): Promise<void>;
    moved(): Promise<void>;
    error(err: Error): Promise<void>;
};
export declare function mergePageLifetimes(lifetimes: Array<Partial<WechatMiniprogram.Component.PageLifetimes>>): {
    show(): Promise<void>;
    hide(): Promise<void>;
    resize(size: WechatMiniprogram.Page.IResizeOption): Promise<void>;
};
export declare function mergeMethods(methods: Array<Record<string, Function>>): Record<string, Function>;
/**
 * 根据WechatMiniprogram.Component.Options写的，规定OakPage和OakComponent中第二个参数的定义
 */
export declare type OakWechatMpOptions<TData extends WechatMiniprogram.Component.DataOption, TProperty extends WechatMiniprogram.Component.PropertyOption, TMethod extends WechatMiniprogram.Component.MethodOption, InherentProperties extends WechatMiniprogram.Component.PropertyOption, InherentMethods extends WechatMiniprogram.Component.MethodOption, InherentData extends WechatMiniprogram.Component.DataOption, InherentInstanceProperty extends WechatMiniprogram.IAnyObject, TCustomInstanceProperty extends WechatMiniprogram.IAnyObject = {}, TIsPage extends boolean = false> = Partial<TData> & Partial<WechatMiniprogram.Component.Property<TProperty>> & Partial<WechatMiniprogram.Component.Method<TMethod, TIsPage>> & Partial<WechatMiniprogram.Component.OtherOption> & Partial<WechatMiniprogram.Component.Lifetimes> & ThisType<WechatMiniprogram.Component.Instance<TData & InherentData, TProperty & InherentProperties, TMethod & InherentMethods, TCustomInstanceProperty & InherentInstanceProperty, TIsPage>>;
export declare type MakeOakPage<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>> = <T extends keyof ED, D extends WechatMiniprogram.Component.DataOption, P extends WechatMiniprogram.Component.PropertyOption, M extends WechatMiniprogram.Component.MethodOption, Proj extends ED[T]['Selection']['data'], IsList extends boolean, IS extends WechatMiniprogram.IAnyObject = {}, FormedData extends WechatMiniprogram.Component.DataOption = {}>(options: OakPageOption<ED, T, Cxt, AD, FD, Proj, FormedData, IsList> & ThisType<WechatMiniprogram.Component.Instance<D & OakPageData, P & OakPageProperties, M & OakPageMethods<ED, T>, IS & OakPageInstanceProperties<ED, Cxt, AD, FD>, true>>, componentOptions: OakWechatMpOptions<D, P, M, OakPageProperties, OakPageMethods<ED, T>, OakPageData & FormedData, OakPageInstanceProperties<ED, Cxt, AD, FD>, IS, true>) => string;
export declare type MakeOakComponent<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>> = <T extends keyof ED, D extends WechatMiniprogram.Component.DataOption, P extends WechatMiniprogram.Component.PropertyOption, M extends WechatMiniprogram.Component.MethodOption, IsList extends boolean, IS extends WechatMiniprogram.IAnyObject = {}, FormedData extends WechatMiniprogram.Component.DataOption = {}>(options: OakComponentOption<ED, T, Cxt, AD, FD, FormedData, IsList> & ThisType<WechatMiniprogram.Component.Instance<D & OakPageData, P & OakPageProperties, M & OakPageMethods<ED, T>, IS & OakPageInstanceProperties<ED, Cxt, AD, FD>, true>>, componentOptions: OakWechatMpOptions<D, P, M, OakComponentProperties, OakComponentMethods<ED, T>, OakComponentData & FormedData, OakComponentInstanceProperties<ED, Cxt, AD, FD>, IS, false>) => string;
export {};
