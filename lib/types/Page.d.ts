/// <reference types="wechat-miniprogram" />
/// <reference types="react" />
import { Aspect, Context, EntityDict, DeduceSorterItem, SelectRowShape, CheckerType, OakUserException } from "oak-domain/lib/types";
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { CommonAspectDict } from 'oak-common-aspect';
import { Feature } from './Feature';
import { Pagination } from "./Pagination";
import { BasicFeatures } from "../features";
import { NamedFilterItem, NamedSorterItem } from './NamedCondition';
import { NotificationProps } from './Notification';
import { MessageProps } from './Message';
declare type RowSelected<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Proj extends ED[T]['Selection']['data'] = Required<ED[T]['Selection']['data']>> = SelectRowShape<ED[T]['Schema'], Proj> | undefined;
interface ComponentOption<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature>, Proj extends ED[T]['Selection']['data'], FormedData extends Record<string, any>, IsList extends boolean, TProperty extends WechatMiniprogram.Component.PropertyOption = {}> {
    entity?: T | (() => T);
    path?: string;
    isList: IsList;
    projection?: Proj | ((options: {
        features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD;
        props: Partial<WechatMiniprogram.Component.PropertyOptionToData<TProperty>>;
        state: Record<string, any>;
    }) => Promise<Proj>);
    append?: boolean;
    pagination?: Pagination;
    filters?: Array<{
        filter: ED[T]['Selection']['filter'] | ((options: {
            features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD;
            props: Partial<WechatMiniprogram.Component.PropertyOptionToData<TProperty>>;
            state: Record<string, any>;
        }) => Promise<ED[T]['Selection']['filter']> | undefined);
        '#name'?: string;
    }>;
    sorters?: Array<{
        sorter: DeduceSorterItem<ED[T]['Schema']> | ((options: {
            features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD;
            props: Partial<WechatMiniprogram.Component.PropertyOptionToData<TProperty>>;
            state: Record<string, any>;
        }) => Promise<DeduceSorterItem<ED[T]['Schema']>>);
        '#name'?: string;
    }>;
    formData?: (options: {
        data: IsList extends true ? RowSelected<ED, T, Proj>[] : RowSelected<ED, T, Proj> | undefined;
        features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD;
        props: Partial<WechatMiniprogram.Component.PropertyOptionToData<TProperty>>;
        legalActions: ED[T]['Action'][];
    }) => Promise<FormedData>;
    ns?: T | T[];
}
export declare type MiniprogramStyleMethods = {
    animate(selector: string, keyFrames: WechatMiniprogram.Component.KeyFrame[], duration: number, callback?: () => void): void;
    clearAnimation(selector: string, options?: WechatMiniprogram.Component.ClearAnimationOptions, callback?: () => void): void;
    triggerEvent: <DetailType = any>(name: string, detail?: DetailType, options?: WechatMiniprogram.Component.TriggerEventOption) => void;
};
export declare type ComponentProps<IsList extends boolean, TProperty extends WechatMiniprogram.Component.PropertyOption> = IsList extends true ? WechatMiniprogram.Component.PropertyOptionToData<OakListComponentProperties & OakComponentProperties & TProperty> : WechatMiniprogram.Component.PropertyOptionToData<OakComponentProperties & TProperty>;
export declare type ComponentData<ED extends EntityDict & BaseEntityDict, T extends keyof ED, FormedData extends WechatMiniprogram.Component.DataOption, TData extends WechatMiniprogram.Component.DataOption> = TData & FormedData & OakComponentData<ED, T>;
export declare type ComponentPublicThisType<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature>, FormedData extends Record<string, any>, IsList extends boolean, TData extends Record<string, any> = {}, TProperty extends WechatMiniprogram.Component.PropertyOption = {}, TMethod extends WechatMiniprogram.Component.MethodOption = {}> = {
    features: FD & BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>;
    state: ComponentData<ED, T, FormedData, TData>;
    props: ComponentProps<IsList, TProperty>;
    setState: (data: Partial<ComponentData<ED, T, FormedData, TData>>, callback?: () => void) => void;
    triggerEvent: <DetailType = any>(name: string, detail?: DetailType, options?: WechatMiniprogram.Component.TriggerEventOption) => void;
} & TMethod & OakCommonComponentMethods<ED, T> & (IsList extends true ? OakListComponentMethods<ED, T> : {});
export declare type ComponentFullThisType<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends Context<ED>> = {
    features: BasicFeatures<ED, Cxt, CommonAspectDict<ED, Cxt>>;
    state: OakComponentData<ED, T>;
    props: ComponentProps<true, {}>;
    setState: (data: Partial<OakComponentData<ED, T>>, callback?: () => void) => void;
    triggerEvent: <DetailType = any>(name: string, detail?: DetailType, options?: WechatMiniprogram.Component.TriggerEventOption) => void;
} & OakCommonComponentMethods<ED, T> & OakListComponentMethods<ED, T> & OakHiddenComponentMethods;
export declare type OakComponentOption<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature>, Proj extends ED[T]['Selection']['data'], FormedData extends Record<string, any>, IsList extends boolean, TData extends Record<string, any>, TProperty extends WechatMiniprogram.Component.PropertyOption, TMethod extends Record<string, Function>> = ComponentOption<ED, T, Cxt, AD, FD, Proj, FormedData, IsList, TProperty> & Partial<{
    data?: TData;
    properties: TProperty;
    methods: TMethod;
    lifetimes: {
        created?(): void;
        attached?(): void;
        ready?(): void;
        moved?(): void;
        detached?(): void;
        error?(err: Error): void;
        show?(): void;
        hide?(): void;
    };
    actions?: ED[T]['Action'][];
    observers: Record<string, (...args: any[]) => any>;
}> & Partial<{
    wechatMp: {
        externalClasses?: string[];
        options?: Partial<WechatMiniprogram.Component.ComponentOptions> | undefined;
    };
}> & ThisType<ComponentPublicThisType<ED, T, Cxt, AD, FD, FormedData, IsList, TData, TProperty, TMethod>>;
export declare type OakComponentProperties = {
    oakPath: StringConstructor;
    oakId: StringConstructor;
    oakProjection: ObjectConstructor;
    oakFrom: StringConstructor;
    oakParentEntity: StringConstructor;
    oakDisablePulldownRefresh: BooleanConstructor;
    oakAutoUnmount: BooleanConstructor;
    oakActions: ArrayConstructor;
};
export declare type OakListComponentProperties = {
    oakFilters: ObjectConstructor;
    oakSorters: ObjectConstructor;
    oakIsPicker: BooleanConstructor;
};
export declare type OakNavigateToParameters<ED extends EntityDict & BaseEntityDict, T extends keyof ED> = {
    oakId?: string;
    oakEntity?: T;
    oakPath?: string;
    oakParent?: string;
    oakProjection?: ED[T]['Selection']['data'];
    oakSorters?: Array<NamedSorterItem<ED, T>>;
    oakFilters?: Array<NamedFilterItem<ED, T>>;
    oakIsPicker?: boolean;
    [k: string]: any;
};
export declare type OakHiddenComponentMethods = {
    subscribed?: () => void;
    subscribe: () => void;
    unsubscribe: () => void;
};
export declare type OakCommonComponentMethods<ED extends EntityDict & BaseEntityDict, T extends keyof ED> = {
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
    setMessage: (data: MessageProps) => Promise<void>;
    consumeMessage: () => MessageProps | undefined;
    reRender: (extra?: Record<string, any>) => Promise<void>;
    getFreshValue: (path?: string) => Promise<ED[keyof ED]['Schema'][] | ED[keyof ED]['Schema'] | undefined>;
    navigateTo: <T2 extends keyof ED>(options: {
        url: string;
    } & OakNavigateToParameters<ED, T2>, state?: Record<string, any>, disableNamespace?: boolean) => Promise<void>;
    navigateBack: (option?: {
        delta: number;
    }) => Promise<void>;
    redirectTo: <T2 extends keyof ED>(options: Parameters<typeof wx.redirectTo>[0] & OakNavigateToParameters<ED, T2>, state?: Record<string, any>, disableNamespace?: boolean) => Promise<void>;
    addOperation: (operation: Omit<ED[T]['Operation'], 'id'>, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>, path?: string) => Promise<void>;
    cleanOperation: (path?: string) => void;
    t(key: string, params?: object): string;
    callPicker: (attr: string, params: Record<string, any>) => void;
    execute: (operation?: Omit<ED[T]['Operation'], 'id'>, path?: string) => Promise<ED[T]['Operation'][]>;
    checkOperation: (ntity: T, action: ED[T]['Action'], filter?: ED[T]['Update']['filter'], checkerTypes?: CheckerType[]) => Promise<boolean>;
    tryExecute: (path?: string) => Promise<boolean>;
    getOperations: (path?: string) => Promise<ED[T]['Operation'][] | undefined>;
    refresh: (extra?: any) => Promise<void>;
    setUpdateData: (data: string, attr: any) => Promise<void>;
    setMultiAttrUpdateData: (data: Record<string, any>) => Promise<void>;
    setId: (id: string) => Promise<void>;
    unsetId: () => void;
    getId: () => string | undefined;
};
export declare type OakListComponentMethods<ED extends EntityDict & BaseEntityDict, T extends keyof ED> = {
    loadMore: () => Promise<void>;
    setFilters: (filters: NamedFilterItem<ED, T>[]) => Promise<void>;
    getFilters: () => Promise<ED[T]['Selection']['filter'][] | undefined>;
    getFilterByName: (name: string) => Promise<ED[T]['Selection']['filter']> | undefined;
    addNamedFilter: (filter: NamedFilterItem<ED, T>, refresh?: boolean) => Promise<void>;
    removeNamedFilter: (filter: NamedFilterItem<ED, T>, refresh?: boolean) => Promise<void>;
    removeNamedFilterByName: (name: string, refresh?: boolean) => Promise<void>;
    setNamedSorters: (sorters: NamedSorterItem<ED, T>[]) => Promise<void>;
    getSorters: () => Promise<ED[T]['Selection']['sorter'] | undefined>;
    getSorterByName: (name: string) => Promise<DeduceSorterItem<ED[T]['Schema']> | undefined>;
    addNamedSorter: (filter: NamedSorterItem<ED, T>, refresh?: boolean) => Promise<void>;
    removeNamedSorter: (filter: NamedSorterItem<ED, T>, refresh?: boolean) => Promise<void>;
    removeNamedSorterByName: (name: string, refresh?: boolean) => Promise<void>;
    getPagination: () => Pagination | undefined;
    setPageSize: (pageSize: number) => void;
    setCurrentPage: (current: number) => void;
};
declare type ComponentOnPropsChangeOption = {
    path?: string;
    parent?: string;
};
export declare type OakComponentOnlyMethods = {
    onPropsChanged: (options: ComponentOnPropsChangeOption) => void;
    registerReRender: () => void;
    setOakActions: () => void;
};
export declare type OakComponentData<ED extends EntityDict & BaseEntityDict, T extends keyof ED> = {
    oakExecuting: boolean;
    oakAllowExecuting: boolean | OakUserException;
    oakFocused: {
        attr: string;
        message: string;
    };
    oakDirty: boolean;
    oakLoading: boolean;
    oakLoadingMore: boolean;
    oakPullDownRefreshLoading: boolean;
    oakEntity: T;
    oakIsReady: boolean;
    oakFullpath: string;
    oakLegalActions?: ED[T]['Action'][];
};
export declare type MakeOakComponent<ED extends EntityDict & BaseEntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature>> = <T extends keyof ED, Proj extends ED[T]['Selection']['data'], FormedData extends WechatMiniprogram.Component.DataOption, IsList extends boolean, TData extends WechatMiniprogram.Component.DataOption, TProperty extends WechatMiniprogram.Component.PropertyOption, TMethod extends WechatMiniprogram.Component.MethodOption>(options: OakComponentOption<ED, T, Cxt, AD, FD, Proj, FormedData, IsList, TData, TProperty, TMethod>) => React.ComponentType<any>;
export {};
