/// <reference types="wechat-miniprogram" />
/// <reference types="wechat-miniprogram" />
import { Aspect, Context, EntityDict, DeduceSorterItem, DeduceOperation, SelectRowShape } from "oak-domain/lib/types";
import { CommonAspectDict } from 'oak-common-aspect';
import { Feature } from './Feature';
import { Pagination } from "./Pagination";
import { BasicFeatures } from "../features";
import { NamedFilterItem, NamedSorterItem } from './NamedCondition';
import { CreateNodeOptions } from '../features/runningTree';
import { NotificationProps } from './Notification';
import { MessageProps } from './Message';
declare type RowSelected<ED extends EntityDict, T extends keyof ED, Proj extends ED[T]['Selection']['data'] = Required<ED[T]['Selection']['data']>> = SelectRowShape<ED[T]['Schema'], Proj> | undefined;
interface ComponentOption<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>, FormedData extends WechatMiniprogram.Component.DataOption, IsList extends boolean, TProperty extends WechatMiniprogram.Component.PropertyOption> {
    entity?: T;
    isList?: IsList;
    formData?: (options: {
        data: IsList extends true ? RowSelected<ED, T>[] : RowSelected<ED, T>;
        features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD;
        props: Partial<WechatMiniprogram.Component.PropertyOptionToData<TProperty>>;
        legalActions?: string[];
    }) => Promise<FormedData>;
    actions?: ED[T]['Action'][];
}
interface PageOption<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>, Proj extends ED[T]['Selection']['data'], FormedData extends WechatMiniprogram.Component.DataOption, IsList extends boolean, TProperty extends WechatMiniprogram.Component.PropertyOption> {
    entity?: T;
    path?: string;
    isList?: IsList;
    projection?: Proj | ((options: {
        features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD;
        props: Partial<WechatMiniprogram.Component.PropertyOptionToData<TProperty>>;
        onLoadOptions: Record<string, string | undefined>;
    }) => Promise<Proj>);
    append?: boolean;
    pagination?: Pagination;
    filters?: Array<{
        filter: ED[T]['Selection']['filter'] | ((options: {
            features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD;
            props: Partial<WechatMiniprogram.Component.PropertyOptionToData<TProperty>>;
            onLoadOptions: Record<string, string | undefined>;
        }) => Promise<ED[T]['Selection']['filter']> | undefined);
        '#name'?: string;
    }>;
    sorters?: Array<{
        sorter: DeduceSorterItem<ED[T]['Schema']> | ((options: {
            features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD;
            props: Partial<WechatMiniprogram.Component.PropertyOptionToData<TProperty>>;
            onLoadOptions: Record<string, string | undefined>;
        }) => Promise<DeduceSorterItem<ED[T]['Schema']>>);
        '#name'?: string;
    }>;
    actions?: ED[T]['Action'][];
    formData?: (options: {
        data: IsList extends true ? RowSelected<ED, T, Proj>[] : RowSelected<ED, T, Proj>;
        features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD;
        props: Partial<WechatMiniprogram.Component.PropertyOptionToData<TProperty>>;
        legalActions?: string[];
    }) => Promise<FormedData>;
    ns?: T | T[];
}
export declare type MiniprogramStyleMethods = {
    animate(selector: string, keyFrames: WechatMiniprogram.Component.KeyFrame[], duration: number, callback?: () => void): void;
    clearAnimation(selector: string, options?: WechatMiniprogram.Component.ClearAnimationOptions, callback?: () => void): void;
    triggerEvent: <DetailType = any>(name: string, detail?: DetailType, options?: WechatMiniprogram.Component.TriggerEventOption) => void;
};
/**
 * 这里对微信小程序中一些常用的字段进行了封装，维持住在各个平台下的通用性
 * 更多的字段未来再加入
 */
export declare type OakPageOption<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>, Proj extends ED[T]['Selection']['data'], FormedData extends WechatMiniprogram.Component.DataOption, IsList extends boolean, TData extends WechatMiniprogram.Component.DataOption, TProperty extends WechatMiniprogram.Component.PropertyOption, TMethod extends WechatMiniprogram.Component.MethodOption> = PageOption<ED, T, Cxt, AD, FD, Proj, FormedData, IsList, TProperty> & Partial<WechatMiniprogram.Component.Data<TData>> & Partial<WechatMiniprogram.Component.Property<TProperty>> & Partial<WechatMiniprogram.Component.Method<TMethod, true>> & Partial<{
    lifetimes: WechatMiniprogram.Component.Lifetimes['lifetimes'];
    observers: Record<string, (...args: any[]) => any>;
    pageLifetimes?: Partial<WechatMiniprogram.Component.PageLifetimes> | undefined;
}> & ThisType<{
    features: FD & BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>;
    state: TData & FormedData & OakPageData<ED, T>;
    props: WechatMiniprogram.Component.PropertyOptionToData<OakPageProperties & TProperty>;
    setState: (data: Partial<TData & OakPageData<ED, T>>, callback?: () => void) => Promise<void>;
} & Omit<MiniprogramStyleMethods, 'triggerEvent'> & TMethod & WechatMiniprogram.Page.ILifetime & OakCommonComponentMethods<ED, T> & OakListComponentMethods<ED, T> & OakPageMethods & OakPageInstanceProperties<ED, Cxt, AD, FD>>;
export declare type OakComponentOption<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>, FormedData extends WechatMiniprogram.Component.DataOption, IsList extends boolean, TData extends WechatMiniprogram.Component.DataOption, TProperty extends WechatMiniprogram.Component.PropertyOption, TMethod extends WechatMiniprogram.Component.MethodOption> = ComponentOption<ED, T, Cxt, AD, FD, FormedData, IsList, TProperty> & Partial<WechatMiniprogram.Component.Data<TData>> & Partial<WechatMiniprogram.Component.Property<TProperty>> & Partial<WechatMiniprogram.Component.Method<TMethod, false>> & Partial<{
    lifetimes: WechatMiniprogram.Component.Lifetimes['lifetimes'];
    observers: Record<string, (...args: any[]) => any>;
    pageLifetimes: Partial<WechatMiniprogram.Component.PageLifetimes> | undefined;
    externalClasses: string[];
    options: Partial<WechatMiniprogram.Component.ComponentOptions> | undefined;
}> & ThisType<{
    features: FD & BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>;
    state: TData & FormedData & OakComponentData<ED, T>;
    props: WechatMiniprogram.Component.PropertyOptionToData<OakComponentProperties & TProperty>;
    setState: (data: Partial<TData>, callback?: () => void) => Promise<void>;
} & MiniprogramStyleMethods & TMethod & OakCommonComponentMethods<ED, T> & OakListComponentMethods<ED, T>>;
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
    sub: (type: string, callback: Function) => void;
    unsub: (type: string, callback: Function) => void;
    pub: (type: string, options?: any) => void;
    unsubAll: (type: string) => void;
    save: (key: string, item: any) => void;
    load: (key: string) => any;
    clear: () => void;
    resolveInput: <K extends string>(input: any, keys?: K[]) => {
        dataset?: Record<string, any>;
        value?: string;
    } & {
        [k in K]?: any;
    };
    setNotification: (data: NotificationProps) => void;
    consumeNotification: () => NotificationProps | undefined;
    setMessage: (data: MessageProps) => void;
    consumeMessage: () => MessageProps | undefined;
    reRender: (extra?: Record<string, any>) => Promise<void>;
    redirectTo: <T2 extends keyof ED>(options: Parameters<typeof wx.redirectTo>[0] & OakNavigateToParameters<ED, T2>, state?: Record<string, any>) => Promise<void>;
    navigateTo: <T2 extends keyof ED>(options: Parameters<typeof wx.navigateTo>[0] & OakNavigateToParameters<ED, T2>, state?: Record<string, any>) => Promise<void>;
    navigateBack: (option?: {
        delta: number;
    }) => Promise<void>;
    resetUpdateData: () => void;
    setUpdateData: (attr: string, input: any) => void;
    t(key: string, params?: object): string;
    callPicker: (attr: string, params: Record<string, any>) => void;
    setForeignKey: (id: string, goBackDelta?: number) => void;
    addForeignKeys: (ids: string[], goBackDelta?: number) => void;
    setUniqueForeignKeys: (ids: string[], goBackDelta?: number) => void;
    setAction: (action: ED[T]['Action'], path?: string) => void;
    toggleNode: (nodeData: Record<string, any>, checked: boolean, path?: string) => void;
    execute: (action?: ED[T]['Action'], legalExceptions?: Array<string>, path?: string) => Promise<DeduceOperation<ED[T]['Schema']> | DeduceOperation<ED[T]['Schema']>[] | undefined>;
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
    oakLegalActions: ED[T]['Action'][];
    oakLoading: boolean;
    oakLoadingMore: boolean;
    oakEntity: string;
};
export declare type OakComponentData<ED extends EntityDict, T extends keyof ED> = {} & OakPageData<ED, T>;
export {};
