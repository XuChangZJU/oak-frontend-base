/// <reference types="wechat-miniprogram" />
import './polyfill';
import { Aspect, Checker, Context, EntityDict, RowStore, StorageSchema, Trigger, ActionDictOfEntityDict, DeduceSorterItem, DeduceOperation, SelectRowShape } from "oak-domain/lib/types";
import { Feature } from '../../types/Feature';
import { Pagination } from "../../types/Pagination";
import { BasicFeatures } from "../../features";
import { ExceptionRouters } from '../../types/ExceptionRoute';
import { NamedFilterItem, NamedSorterItem } from '../../types/NamedCondition';
import { CreateNodeOptions } from '../../features/node';
declare type RowSelected<ED extends EntityDict, T extends keyof ED, Proj extends ED[T]['Selection']['data'] = Required<ED[T]['Selection']['data']>> = SelectRowShape<ED[T]['Schema'], Proj> | undefined;
declare type OakComponentOption<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD>>, FormedData extends WechatMiniprogram.Component.DataOption, IsList extends boolean> = {
    entity: T;
    isList: IsList;
    formData: (options: {
        data: IsList extends true ? RowSelected<ED, T>[] : RowSelected<ED, T>;
        features: BasicFeatures<ED, Cxt, AD> & FD;
        params?: Record<string, any>;
    }) => Promise<FormedData>;
};
interface OakPageOption<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD>>, Proj extends ED[T]['Selection']['data'], FormedData extends WechatMiniprogram.Component.DataOption, IsList extends boolean> {
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
        }) => Promise<ED[T]['Selection']['filter']>);
        '#name'?: string;
    }>;
    sorters?: Array<{
        sorter: DeduceSorterItem<ED[T]['Schema']> | ((options: {
            features: BasicFeatures<ED, Cxt, AD> & FD;
            rest: Record<string, any>;
            onLoadOptions: Record<string, string | undefined>;
        }) => Promise<DeduceSorterItem<ED[T]['Schema']>>);
        '#name'?: string;
    }>;
    actions?: ED[T]['Action'][];
    formData: (options: {
        data: IsList extends true ? RowSelected<ED, T, Proj>[] : RowSelected<ED, T, Proj>;
        features: BasicFeatures<ED, Cxt, AD> & FD;
        params?: Record<string, any>;
    }) => Promise<FormedData>;
}
declare type OakComponentProperties = {
    oakEntity: StringConstructor;
    oakPath: StringConstructor;
    oakParent: StringConstructor;
};
declare type OakPageProperties = {
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
declare type OakComponentMethods<ED extends EntityDict, T extends keyof ED> = {
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
declare type OakPageMethods<ED extends EntityDict, T extends keyof ED> = OakComponentMethods<ED, T> & {
    refresh: (extra?: any) => Promise<void>;
    onPullDownRefresh: () => Promise<void>;
    onLoad: (options: Record<string, string | undefined>) => Promise<void>;
    setForeignKey: (id: string, goBackDelta?: number) => Promise<void>;
    onForeignKeyPicked: (touch: WechatMiniprogram.Touch) => void;
};
declare type OakComponentInstanceProperties<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD>>> = {
    features: BasicFeatures<ED, Cxt, AD> & FD;
    isReady: boolean;
};
declare type OakPageInstanceProperties<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD>>> = OakComponentInstanceProperties<ED, Cxt, AD, FD>;
declare type OakPageData = {
    oakFullpath: string;
    oakExecuting: boolean;
    oakFocused: object;
    oakDirty: boolean;
    oakError: {
        type: 'warning' | 'error' | 'success' | 'primary';
        msg: string;
    };
    oakLegalActions: string[];
};
declare type OakComponentData = {} & OakPageData;
export declare function initialize<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD>>>(storageSchema: StorageSchema<ED>, createFeatures: (basicFeatures: BasicFeatures<ED, Cxt, AD>) => FD, createContext: (store: RowStore<ED, Cxt>, scene: string) => Cxt, exceptionRouters?: ExceptionRouters, triggers?: Array<Trigger<ED, keyof ED, Cxt>>, checkers?: Array<Checker<ED, keyof ED, Cxt>>, aspectDict?: AD, initialData?: {
    [T in keyof ED]?: Array<ED[T]['OpSchema']>;
}, actionDict?: ActionDictOfEntityDict<ED>): {
    OakPage: <T extends keyof ED, D extends WechatMiniprogram.Component.DataOption, P extends WechatMiniprogram.Component.PropertyOption, M extends WechatMiniprogram.Component.MethodOption, IsList extends boolean, Proj extends ED[T]["Selection"]["data"], IS extends WechatMiniprogram.IAnyObject = {}, FormedData extends WechatMiniprogram.Component.DataOption = {}>(options: OakPageOption<ED, T, Cxt, AD, FD, Proj, FormedData, IsList>, componentOptions?: WechatMiniprogram.Component.Options<D, P, M, IS & OakPageInstanceProperties<ED, Cxt, AD, FD>, true>) => string;
    OakComponent: <T_1 extends string | number, D_1 extends WechatMiniprogram.Component.DataOption, P_1 extends WechatMiniprogram.Component.PropertyOption, M_1 extends WechatMiniprogram.Component.MethodOption, IsList_1 extends boolean, IS_1 extends WechatMiniprogram.IAnyObject = {}, FormedData_1 extends WechatMiniprogram.Component.DataOption = {}>(options: OakComponentOption<ED, T_1, Cxt, AD, FD, FormedData_1, IsList_1>, componentOptions?: OakWechatMpOptions<D_1, P_1, M_1, OakPageProperties, OakPageMethods<ED, T_1>, OakPageData, OakPageInstanceProperties<ED, Cxt, AD, FD>, IS_1, true>) => string;
    features: BasicFeatures<ED, Cxt, AD> & FD;
};
/**
 * 根据WechatMiniprogram.Component.Options写的，规定OakPage和OakComponent中第二个参数的定义
 */
declare type OakWechatMpOptions<TData extends WechatMiniprogram.Component.DataOption, TProperty extends WechatMiniprogram.Component.PropertyOption, TMethod extends WechatMiniprogram.Component.MethodOption, InherentProperties extends WechatMiniprogram.Component.PropertyOption, InherentMethods extends WechatMiniprogram.Component.MethodOption, InherentData extends WechatMiniprogram.Component.DataOption, InherentInstanceProperty extends WechatMiniprogram.IAnyObject, TCustomInstanceProperty extends WechatMiniprogram.IAnyObject = {}, TIsPage extends boolean = false> = Partial<TData> & Partial<WechatMiniprogram.Component.Property<TProperty>> & Partial<WechatMiniprogram.Component.Method<TMethod, TIsPage>> & Partial<WechatMiniprogram.Component.OtherOption> & Partial<WechatMiniprogram.Component.Lifetimes> & ThisType<WechatMiniprogram.Component.Instance<TData & InherentData, TProperty & InherentProperties, TMethod & InherentMethods, TCustomInstanceProperty & InherentInstanceProperty, TIsPage>>;
export declare type MakeOakPage<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD>>> = <T extends keyof ED, D extends WechatMiniprogram.Component.DataOption, P extends WechatMiniprogram.Component.PropertyOption, M extends WechatMiniprogram.Component.MethodOption, Proj extends ED[T]['Selection']['data'], IsList extends boolean, IS extends WechatMiniprogram.IAnyObject = {}, FormedData extends WechatMiniprogram.Component.DataOption = {}>(options: OakPageOption<ED, T, Cxt, AD, FD, Proj, FormedData, IsList> & ThisType<WechatMiniprogram.Component.Instance<D & OakPageData, P & OakPageProperties, M & OakPageMethods<ED, T>, IS & OakPageInstanceProperties<ED, Cxt, AD, FD>, true>>, componentOptions: OakWechatMpOptions<D, P, M, OakPageProperties, OakPageMethods<ED, T>, OakPageData & FormedData, OakPageInstanceProperties<ED, Cxt, AD, FD>, IS, true>) => string;
export declare type MakeOakComponent<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD>>> = <T extends keyof ED, D extends WechatMiniprogram.Component.DataOption, P extends WechatMiniprogram.Component.PropertyOption, M extends WechatMiniprogram.Component.MethodOption, IsList extends boolean, IS extends WechatMiniprogram.IAnyObject = {}, FormedData extends WechatMiniprogram.Component.DataOption = {}>(options: OakComponentOption<ED, T, Cxt, AD, FD, FormedData, IsList> & ThisType<WechatMiniprogram.Component.Instance<D & OakPageData, P & OakPageProperties, M & OakPageMethods<ED, T>, IS & OakPageInstanceProperties<ED, Cxt, AD, FD>, true>>, componentOptions: OakWechatMpOptions<D, P, M, OakComponentProperties, OakComponentMethods<ED, T>, OakComponentData & FormedData, OakComponentInstanceProperties<ED, Cxt, AD, FD>, IS, false>) => string;
export {};
