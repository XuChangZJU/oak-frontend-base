/// <reference types="wechat-miniprogram" />
/// <reference types="react" />
import { Aspect, EntityDict, DeduceSorterItem, CheckerType } from "oak-domain/lib/types";
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { CommonAspectDict } from 'oak-common-aspect';
import { Feature } from './Feature';
import { Pagination } from "./Pagination";
import { BasicFeatures } from "../features";
import { NamedFilterItem, NamedSorterItem } from './NamedCondition';
import { NotificationProps } from './Notification';
import { MessageProps } from './Message';
import { AsyncContext } from "oak-domain/lib/store/AsyncRowStore";
import { SyncContext } from "oak-domain/lib/store/SyncRowStore";
interface ComponentOption<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature>, FormedData extends Record<string, any>, IsList extends boolean, TProperty extends WechatMiniprogram.Component.PropertyOption = {}> {
    entity?: T | (() => T);
    path?: string;
    isList: IsList;
    projection?: ED[T]['Selection']['data'] | ((options: {
        features: BasicFeatures<ED, Cxt, FrontCxt, AD & CommonAspectDict<ED, Cxt>> & FD;
        props: Partial<WechatMiniprogram.Component.PropertyOptionToData<TProperty>>;
        state: Record<string, any>;
    }) => ED[T]['Selection']['data']);
    append?: boolean;
    pagination?: Pagination;
    filters?: Array<{
        filter: ED[T]['Selection']['filter'] | ((options: {
            features: BasicFeatures<ED, Cxt, FrontCxt, AD & CommonAspectDict<ED, Cxt>> & FD;
            props: Partial<WechatMiniprogram.Component.PropertyOptionToData<TProperty>>;
            state: Record<string, any>;
        }) => ED[T]['Selection']['filter'] | undefined);
        '#name'?: string;
    }>;
    sorters?: Array<{
        sorter: DeduceSorterItem<ED[T]['Schema']> | ((options: {
            features: BasicFeatures<ED, Cxt, FrontCxt, AD & CommonAspectDict<ED, Cxt>> & FD;
            props: Partial<WechatMiniprogram.Component.PropertyOptionToData<TProperty>>;
            state: Record<string, any>;
        }) => DeduceSorterItem<ED[T]['Schema']>);
        '#name'?: string;
    }>;
    formData?: (options: {
        data: IsList extends true ? Partial<ED[T]['Schema']>[] : Partial<ED[T]['Schema']> | undefined;
        features: BasicFeatures<ED, Cxt, FrontCxt, AD & CommonAspectDict<ED, Cxt>> & FD;
        props: Partial<WechatMiniprogram.Component.PropertyOptionToData<TProperty>>;
        legalActions: ED[T]['Action'][];
    }) => FormedData;
    ns?: T | T[];
}
export declare type MiniprogramStyleMethods = {
    animate(selector: string, keyFrames: WechatMiniprogram.Component.KeyFrame[], duration: number, callback?: () => void): void;
    clearAnimation(selector: string, options?: WechatMiniprogram.Component.ClearAnimationOptions, callback?: () => void): void;
    triggerEvent: <DetailType = any>(name: string, detail?: DetailType, options?: WechatMiniprogram.Component.TriggerEventOption) => void;
};
export declare type ComponentProps<IsList extends boolean, TProperty extends WechatMiniprogram.Component.PropertyOption> = IsList extends true ? WechatMiniprogram.Component.PropertyOptionToData<OakListComponentProperties & OakComponentProperties & TProperty> : WechatMiniprogram.Component.PropertyOptionToData<OakComponentProperties & TProperty>;
export declare type ComponentData<ED extends EntityDict & BaseEntityDict, T extends keyof ED, FormedData extends WechatMiniprogram.Component.DataOption, TData extends WechatMiniprogram.Component.DataOption> = TData & FormedData & OakComponentData<ED, T>;
export declare type ComponentPublicThisType<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature>, FormedData extends Record<string, any>, IsList extends boolean, TData extends Record<string, any> = {}, TProperty extends WechatMiniprogram.Component.PropertyOption = {}, TMethod extends WechatMiniprogram.Component.MethodOption = {}> = {
    subscribed: Array<() => void>;
    features: FD & BasicFeatures<ED, Cxt, FrontCxt, AD & CommonAspectDict<ED, Cxt>>;
    state: ComponentData<ED, T, FormedData, TData>;
    props: ComponentProps<IsList, TProperty>;
    setState: (data: Partial<ComponentData<ED, T, FormedData, TData>>, callback?: () => void) => void;
    triggerEvent: <DetailType = any>(name: string, detail?: DetailType, options?: WechatMiniprogram.Component.TriggerEventOption) => void;
} & TMethod & OakCommonComponentMethods<ED, T> & (IsList extends true ? OakListComponentMethods<ED, T> : OakSingleComponentMethods<ED, T>);
export declare type ComponentFullThisType<ED extends EntityDict & BaseEntityDict, T extends keyof ED, IsList extends boolean, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>> = {
    subscribed: Array<() => void>;
    features: BasicFeatures<ED, Cxt, FrontCxt, CommonAspectDict<ED, Cxt>>;
    state: OakComponentData<ED, T>;
    props: ComponentProps<true, {}>;
    setState: (data: Partial<OakComponentData<ED, T>>, callback?: () => void) => void;
    triggerEvent: <DetailType = any>(name: string, detail?: DetailType, options?: WechatMiniprogram.Component.TriggerEventOption) => void;
} & OakCommonComponentMethods<ED, T> & (IsList extends true ? OakListComponentMethods<ED, T> : OakSingleComponentMethods<ED, T>);
export declare type OakComponentOption<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature>, FormedData extends Record<string, any>, IsList extends boolean, TData extends Record<string, any>, TProperty extends WechatMiniprogram.Component.PropertyOption, TMethod extends Record<string, Function>> = ComponentOption<ED, T, Cxt, FrontCxt, AD, FD, FormedData, IsList, TProperty> & Partial<{
    data?: TData;
    properties: Record<string, FunctionConstructor | WechatMiniprogram.Component.AllProperty>;
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
}> & ThisType<ComponentPublicThisType<ED, T, Cxt, FrontCxt, AD, FD, FormedData, IsList, TData, TProperty, TMethod>>;
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
    setMessage: (data: MessageProps) => void;
    consumeMessage: () => MessageProps | undefined;
    reRender: (extra?: Record<string, any>) => void;
    getFreshValue: (path?: string) => Partial<ED[keyof ED]['Schema']>[] | Partial<ED[keyof ED]['Schema']> | undefined;
    navigateTo: <T2 extends keyof ED>(options: {
        url: string;
    } & OakNavigateToParameters<ED, T2>, state?: Record<string, any>, disableNamespace?: boolean) => Promise<void>;
    navigateBack: (option?: {
        delta: number;
    }) => Promise<void>;
    redirectTo: <T2 extends keyof ED>(options: Parameters<typeof wx.redirectTo>[0] & OakNavigateToParameters<ED, T2>, state?: Record<string, any>, disableNamespace?: boolean) => Promise<void>;
    clean: (path?: string) => void;
    t(key: string, params?: object): string;
    execute: (action?: ED[T]['Action'], path?: string) => Promise<void>;
    checkOperation: (ntity: T, action: ED[T]['Action'], filter?: ED[T]['Update']['filter'], checkerTypes?: CheckerType[]) => boolean;
    tryExecute: (path?: string) => boolean | Error;
    getOperations: (path?: string) => {
        operation: ED[T]['Operation'];
        entity: T;
    }[] | undefined;
    refresh: () => Promise<void>;
};
export declare type OakSingleComponentMethods<ED extends EntityDict & BaseEntityDict, T extends keyof ED> = {
    setId: (id: string) => void;
    unsetId: () => void;
    getId: () => string | undefined;
    update: (data: ED[T]['Update']['data'], action?: ED[T]['Action'], beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>) => void;
    remove: (beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>) => void;
};
export declare type OakListComponentMethods<ED extends EntityDict & BaseEntityDict, T extends keyof ED> = {
    loadMore: () => Promise<void>;
    setFilters: (filters: NamedFilterItem<ED, T>[]) => void;
    getFilters: () => ED[T]['Selection']['filter'][] | undefined;
    getFilterByName: (name: string) => ED[T]['Selection']['filter'] | undefined;
    addNamedFilter: (filter: NamedFilterItem<ED, T>, refresh?: boolean) => void;
    removeNamedFilter: (filter: NamedFilterItem<ED, T>, refresh?: boolean) => void;
    removeNamedFilterByName: (name: string, refresh?: boolean) => void;
    setNamedSorters: (sorters: NamedSorterItem<ED, T>[]) => void;
    getSorters: () => ED[T]['Selection']['sorter'] | undefined;
    getSorterByName: (name: string) => DeduceSorterItem<ED[T]['Schema']> | undefined;
    addNamedSorter: (filter: NamedSorterItem<ED, T>, refresh?: boolean) => void;
    removeNamedSorter: (filter: NamedSorterItem<ED, T>, refresh?: boolean) => void;
    removeNamedSorterByName: (name: string, refresh?: boolean) => void;
    getPagination: () => Pagination | undefined;
    setPageSize: (pageSize: number) => void;
    setCurrentPage: (current: number) => void;
    addItem: (data: Omit<ED[T]['CreateSingle']['data'], 'id'>, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>) => void;
    removeItem: (id: string, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>) => void;
    updateItem: (data: ED[T]['Update']['data'], id: string, action?: ED[T]['Action'], beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>) => void;
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
    oakExecutable: boolean | Error;
    oakExecuting: boolean;
    oakFocused: {
        attr: string;
        message: string;
    };
    oakDirty: boolean;
    oakLoading: boolean;
    oakLoadingMore: boolean;
    oakPullDownRefreshLoading: boolean;
    oakEntity: T;
    oakFullpath: string;
    oakLegalActions?: ED[T]['Action'][];
};
export declare type MakeOakComponent<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature>> = <T extends keyof ED, FormedData extends WechatMiniprogram.Component.DataOption, IsList extends boolean, TData extends WechatMiniprogram.Component.DataOption, TProperty extends WechatMiniprogram.Component.PropertyOption, TMethod extends WechatMiniprogram.Component.MethodOption>(options: OakComponentOption<ED, T, Cxt, FrontCxt, AD, FD, FormedData, IsList, TData, TProperty, TMethod>) => React.ComponentType<any>;
export declare type WebComponentCommonMethodNames = 'setNotification' | 'setMessage' | 'navigateTo' | 'navigateBack' | 'redirectTo' | 'clean' | 't' | 'execute' | 'refresh';
export declare type WebComponentListMethodNames = 'loadMore' | 'setFilters' | 'addNamedFilter' | 'removeNamedFilter' | 'removeNamedFilterByName' | 'setNamedSorters' | 'addNamedSorter' | 'removeNamedSorter' | 'removeNamedSorterByName' | 'setPageSize' | 'setCurrentPage' | 'addItem' | 'removeItem' | 'updateItem';
export declare type WebComponentSingleMethodNames = 'update' | 'remove';
export declare type WebComponentProps<ED extends EntityDict & BaseEntityDict, T extends keyof ED, IsList extends boolean, TData extends WechatMiniprogram.Component.DataOption = {}, TMethod extends WechatMiniprogram.Component.MethodOption = {}> = {
    methods: TMethod & Pick<OakCommonComponentMethods<ED, T>, WebComponentCommonMethodNames> & (IsList extends true ? Pick<OakListComponentMethods<ED, T>, WebComponentListMethodNames> : Pick<OakSingleComponentMethods<ED, T>, WebComponentSingleMethodNames>);
    data: TData & OakComponentData<ED, T> & (IsList extends true ? OakListComponentProperties : {});
};
export {};
