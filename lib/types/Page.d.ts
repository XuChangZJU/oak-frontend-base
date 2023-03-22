/// <reference types="wechat-miniprogram" />
/// <reference types="wechat-miniprogram" />
import { Aspect, EntityDict, CheckerType, AggregationResult } from "oak-domain/lib/types";
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
import React from "react";
export declare type PropertyOption = Record<string, WechatMiniprogram.Component.AllProperty | FunctionConstructor>;
export declare type DataOption = WechatMiniprogram.Component.DataOption;
export declare type MethodOption = WechatMiniprogram.Component.MethodOption;
/**
 * 微信的原声明中少写了FunctionConstructor，只能抄一遍
 */
declare type PropertyType = FunctionConstructor | StringConstructor | NumberConstructor | BooleanConstructor | ArrayConstructor | ObjectConstructor | null;
declare type ValueType<T extends PropertyType> = T extends null ? any : T extends StringConstructor ? string : T extends NumberConstructor ? number : T extends BooleanConstructor ? boolean : T extends ArrayConstructor ? any[] : T extends ObjectConstructor ? AnyObject : T extends FunctionConstructor ? Function : never;
declare type FullProperty<T extends PropertyType> = {
    /** 属性类型 */
    type: T;
    /** 属性初始值 */
    value?: ValueType<T> | undefined;
    /** 属性值被更改时的响应函数 */
    observer?: string | ((newVal: ValueType<T>, oldVal: ValueType<T>, changedPath: Array<string | number>) => void) | undefined;
    /** 属性的类型（可以指定多个） */
    optionalTypes?: ShortProperty[] | undefined;
};
declare type AllFullProperty = FullProperty<StringConstructor> | FullProperty<NumberConstructor> | FullProperty<BooleanConstructor> | FullProperty<ArrayConstructor> | FullProperty<ObjectConstructor> | FullProperty<null>;
declare type ShortProperty = FunctionConstructor | StringConstructor | NumberConstructor | BooleanConstructor | ArrayConstructor | ObjectConstructor | null;
declare type AllProperty = AllFullProperty | ShortProperty;
declare type PropertyToData<T extends AllProperty> = T extends ShortProperty ? ValueType<T> : FullPropertyToData<Exclude<T, ShortProperty>>;
declare type FullPropertyToData<T extends AllFullProperty> = ValueType<T['type']>;
declare type PropertyOptionToData<P extends PropertyOption> = {
    [name in keyof P]?: PropertyToData<P[name]>;
};
export declare type ActionDef<ED extends EntityDict & BaseEntityDict, T extends keyof ED> = {
    action: ED[T]['Action'];
    filter?: ED[T]['Selection']['filter'];
    data?: Partial<ED[T]['CreateSingle']['data']>;
    label?: string;
    color?: string;
    key?: string;
} | ED[T]['Action'];
export declare type RowWithActions<ED extends EntityDict & BaseEntityDict, T extends keyof ED> = Partial<ED[T]['Schema']> & {
    '#oakLegalActions': ActionDef<ED, T>[];
    '#oakLegalCascadeActions': {
        [K in keyof ED[T]['Schema']]?: ActionDef<ED, keyof ED>[];
    };
};
interface ComponentOption<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature>, FormedData extends Record<string, any>, IsList extends boolean, TData extends DataOption, TProperty extends PropertyOption> {
    entity?: T | ((this: ComponentPublicThisType<ED, T, Cxt, FrontCxt, AD, FD, FormedData, IsList, TData, TProperty>) => T);
    path?: string;
    isList: IsList;
    features?: (keyof (FD & BasicFeatures<ED, Cxt, FrontCxt, AD & CommonAspectDict<ED, Cxt>>))[];
    cascadeActions?: (this: ComponentPublicThisType<ED, T, Cxt, FrontCxt, AD, FD, FormedData, IsList, TData, TProperty>) => {
        [K in keyof ED[T]['Schema']]?: ActionDef<ED, keyof ED>[];
    };
    actions?: ActionDef<ED, T>[] | ((this: ComponentPublicThisType<ED, T, Cxt, FrontCxt, AD, FD, FormedData, IsList, TData, TProperty>) => ActionDef<ED, T>[]);
    projection?: ED[T]['Selection']['data'] | ((this: ComponentPublicThisType<ED, T, Cxt, FrontCxt, AD, FD, FormedData, IsList, TData, TProperty>) => ED[T]['Selection']['data'] | undefined);
    append?: boolean;
    pagination?: Pagination;
    filters?: Array<{
        filter: ED[T]['Selection']['filter'] | ((this: ComponentPublicThisType<ED, T, Cxt, FrontCxt, AD, FD, FormedData, IsList, TData, TProperty>) => ED[T]['Selection']['filter'] | undefined);
        '#name'?: string;
    }>;
    sorters?: Array<{
        sorter: NonNullable<ED[T]['Selection']['sorter']>[number] | ((this: ComponentPublicThisType<ED, T, Cxt, FrontCxt, AD, FD, FormedData, IsList, TData, TProperty>) => NonNullable<ED[T]['Selection']['sorter']>[number]);
        '#name'?: string;
    }>;
    formData?: (options: {
        data: IsList extends true ? RowWithActions<ED, T>[] : RowWithActions<ED, T> | undefined;
        features: BasicFeatures<ED, Cxt, FrontCxt, AD & CommonAspectDict<ED, Cxt>> & FD;
        props: Partial<PropertyOptionToData<TProperty>>;
        legalActions: ActionDef<ED, T>[];
    }) => FormedData & ThisType<ComponentPublicThisType<ED, T, Cxt, FrontCxt, AD, FD, FormedData, IsList>>;
    ns?: T | T[];
    data?: ((this: ComponentPublicThisType<ED, T, Cxt, FrontCxt, AD, FD, FormedData, IsList, TData, TProperty>) => TData) | TData;
    properties?: TProperty;
}
export declare type MiniprogramStyleMethods = {
    animate(selector: string, keyFrames: WechatMiniprogram.Component.KeyFrame[], duration: number, callback?: () => void): void;
    clearAnimation(selector: string, options?: WechatMiniprogram.Component.ClearAnimationOptions, callback?: () => void): void;
    triggerEvent: <DetailType = any>(name: string, detail?: DetailType, options?: WechatMiniprogram.Component.TriggerEventOption) => void;
};
export declare type ComponentProps<IsList extends boolean, TProperty extends PropertyOption> = IsList extends true ? PropertyOptionToData<OakListComponentProperties & OakComponentProperties & TProperty> : PropertyOptionToData<OakComponentProperties & TProperty>;
export declare type ReactComponentProps<IsList extends boolean, TProperty extends PropertyOption> = ComponentProps<IsList, TProperty> & {
    className?: string;
    style?: Record<string, any>;
};
export declare type ComponentData<ED extends EntityDict & BaseEntityDict, T extends keyof ED, FormedData extends DataOption, TData extends DataOption> = TData & FormedData & OakComponentData<ED, T>;
export declare type ComponentPublicThisType<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature>, FormedData extends Record<string, any>, IsList extends boolean, TData extends Record<string, any> = {}, TProperty extends PropertyOption = {}, TMethod extends MethodOption = {}, EMethod extends Record<string, Function> = {}> = {
    subscribed: Array<() => void>;
    features: FD & BasicFeatures<ED, Cxt, FrontCxt, AD & CommonAspectDict<ED, Cxt>>;
    state: ComponentData<ED, T, FormedData, TData>;
    props: Readonly<ComponentProps<IsList, TProperty>>;
    setState: (data: Partial<ComponentData<ED, T, FormedData, TData>>, callback?: () => void) => void;
    triggerEvent: <DetailType = any>(name: string, detail?: DetailType, options?: WechatMiniprogram.Component.TriggerEventOption) => void;
} & TMethod & EMethod & OakCommonComponentMethods<ED, T> & OakListComponentMethods<ED, T> & OakSingleComponentMethods<ED, T>;
export declare type ComponentFullThisType<ED extends EntityDict & BaseEntityDict, T extends keyof ED, IsList extends boolean, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>> = {
    subscribed: Array<() => void>;
    features: BasicFeatures<ED, Cxt, FrontCxt, CommonAspectDict<ED, Cxt>>;
    state: OakComponentData<ED, T>;
    props: ComponentProps<true, {}>;
    setState: (data: Partial<OakComponentData<ED, T>>, callback?: () => void) => void;
    triggerEvent: <DetailType = any>(name: string, detail?: DetailType, options?: WechatMiniprogram.Component.TriggerEventOption) => void;
} & OakCommonComponentMethods<ED, T> & OakListComponentMethods<ED, T> & OakSingleComponentMethods<ED, T>;
export declare type OakComponentOption<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature>, FormedData extends Record<string, any>, IsList extends boolean, TData extends Record<string, any>, TProperty extends PropertyOption, TMethod extends Record<string, Function>, EMethod extends Record<string, Function> = {}> = ComponentOption<ED, T, Cxt, FrontCxt, AD, FD, FormedData, IsList, TData, TProperty> & Partial<{
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
    observers: Record<string, (this: ComponentPublicThisType<ED, T, Cxt, FrontCxt, AD, FD, FormedData, IsList, TData, TProperty, TMethod>, ...args: any[]) => any>;
    listeners: Record<string, (this: ComponentPublicThisType<ED, T, Cxt, FrontCxt, AD, FD, FormedData, IsList, TData, TProperty, TMethod>, prev: Record<string, any>, next: Record<string, any>) => void>;
}> & Partial<{
    wechatMp: {
        externalClasses?: string[];
        options?: Partial<WechatMiniprogram.Component.ComponentOptions> | undefined;
    };
}> & ThisType<ComponentPublicThisType<ED, T, Cxt, FrontCxt, AD, FD, FormedData, IsList, TData, TProperty, TMethod, EMethod>>;
export declare type OakComponentProperties = {
    oakPath: StringConstructor;
    oakId: StringConstructor;
    oakProjection: ObjectConstructor;
    oakFrom: StringConstructor;
    oakParentEntity: StringConstructor;
    oakDisablePulldownRefresh: BooleanConstructor;
    oakAutoUnmount: BooleanConstructor;
    oakActions: ArrayConstructor;
    oakCascadeActions: ObjectConstructor;
};
export declare type OakListComponentProperties = {
    oakFilters: ObjectConstructor;
    oakSorters: ObjectConstructor;
    oakIsPicker: BooleanConstructor;
    oakPagination: ObjectConstructor;
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
    setDisablePulldownRefresh: (able: boolean) => void;
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
    navigateBack: (delta?: number) => Promise<void>;
    redirectTo: <T2 extends keyof ED>(options: Parameters<typeof wx.redirectTo>[0] & OakNavigateToParameters<ED, T2>, state?: Record<string, any>, disableNamespace?: boolean) => Promise<void>;
    switchTab: <T2 extends keyof ED>(options: Parameters<typeof wx.switchTab>[0] & OakNavigateToParameters<ED, T2>, state?: Record<string, any>, disableNamespace?: boolean) => Promise<void>;
    clean: (path?: string) => void;
    t(key: string, params?: object): string;
    execute: (action?: ED[T]['Action'], messageProps?: boolean | MessageProps) => Promise<void>;
    checkOperation: (entity: T, action: ED[T]['Action'], data?: ED[T]['Update']['data'], filter?: ED[T]['Update']['filter'], checkerTypes?: CheckerType[]) => boolean;
    tryExecute: (path?: string) => boolean | Error;
    getOperations: (path?: string) => {
        operation: ED[T]['Operation'];
        entity: T;
    }[] | undefined;
    refresh: () => Promise<void>;
    aggregate: (aggregation: ED[T]['Aggregation']) => Promise<AggregationResult<ED[T]['Schema']>>;
};
export declare type OakSingleComponentMethods<ED extends EntityDict & BaseEntityDict, T extends keyof ED> = {
    setId: (id: string) => void;
    unsetId: () => void;
    getId: () => string | undefined;
    create: (data: Omit<ED[T]['CreateSingle']['data'], 'id'>, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>, path?: string) => void;
    update: (data: ED[T]['Update']['data'], action?: ED[T]['Action'], beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>, path?: string) => void;
    remove: (beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>, path?: string) => void;
};
export declare type OakListComponentMethods<ED extends EntityDict & BaseEntityDict, T extends keyof ED> = {
    loadMore: () => Promise<void>;
    setFilters: (filters: NamedFilterItem<ED, T>[], path?: string) => void;
    getFilters: (path?: string) => ED[T]['Selection']['filter'][] | undefined;
    getFilterByName: (name: string, path?: string) => ED[T]['Selection']['filter'] | undefined;
    addNamedFilter: (filter: NamedFilterItem<ED, T>, refresh?: boolean, path?: string) => void;
    removeNamedFilter: (filter: NamedFilterItem<ED, T>, refresh?: boolean, path?: string) => void;
    removeNamedFilterByName: (name: string, refresh?: boolean, path?: string) => void;
    setNamedSorters: (sorters: NamedSorterItem<ED, T>[], path?: string) => void;
    getSorters: (path?: string) => ED[T]['Selection']['sorter'] | undefined;
    getSorterByName: (name: string, path?: string) => NonNullable<ED[T]['Selection']['sorter']>[number] | undefined;
    addNamedSorter: (filter: NamedSorterItem<ED, T>, refresh?: boolean, path?: string) => void;
    removeNamedSorter: (filter: NamedSorterItem<ED, T>, refresh?: boolean, path?: string) => void;
    removeNamedSorterByName: (name: string, refresh?: boolean, path?: string) => void;
    getPagination: (path?: string) => Pagination | undefined;
    setPageSize: (pageSize: number, path?: string) => void;
    setCurrentPage: (current: number, path?: string) => void;
    addItem: (data: Omit<ED[T]['CreateSingle']['data'], 'id'>, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>, path?: string) => void;
    removeItem: (id: string, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>, path?: string) => void;
    updateItem: (data: ED[T]['Update']['data'], id: string, action?: ED[T]['Action'], beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>, path?: string) => void;
    recoverItem: (id: string, path?: string) => void;
    resetItem: (id: string, path?: string) => void;
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
    oakDisablePulldownRefresh: boolean;
};
export declare type OakListComoponetData<ED extends EntityDict & BaseEntityDict, T extends keyof ED> = {
    oakFilters?: NonNullable<ED[T]['Selection']['filter']>[];
    oakSorters?: NonNullable<ED[T]['Selection']['sorter']>[];
    oakPagination?: Pagination;
};
export declare type MakeOakComponent<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature>> = <T extends keyof ED, FormedData extends DataOption, IsList extends boolean, TData extends DataOption, TProperty extends PropertyOption, TMethod extends MethodOption>(options: OakComponentOption<ED, T, Cxt, FrontCxt, AD, FD, FormedData, IsList, TData, TProperty, TMethod>) => (props: ReactComponentProps<IsList, TProperty>) => React.ReactElement;
export declare type WebComponentCommonMethodNames = 'setNotification' | 'setMessage' | 'navigateTo' | 'navigateBack' | 'redirectTo' | 'clean' | 't' | 'execute' | 'refresh' | 'setDisablePulldownRefresh' | 'aggregate' | 'checkOperation';
export declare type WebComponentListMethodNames = 'loadMore' | 'setFilters' | 'addNamedFilter' | 'removeNamedFilter' | 'removeNamedFilterByName' | 'setNamedSorters' | 'addNamedSorter' | 'removeNamedSorter' | 'removeNamedSorterByName' | 'setPageSize' | 'setCurrentPage' | 'addItem' | 'removeItem' | 'updateItem' | 'resetItem' | 'recoverItem';
export declare type WebComponentSingleMethodNames = 'update' | 'remove' | 'create';
export declare type WebComponentProps<ED extends EntityDict & BaseEntityDict, T extends keyof ED, IsList extends boolean, TData extends DataOption = {}, TMethod extends MethodOption = {}> = {
    methods: TMethod & OakCommonComponentMethods<ED, T> & OakListComponentMethods<ED, T> & OakSingleComponentMethods<ED, T>;
    data: TData & OakComponentData<ED, T> & (IsList extends true ? OakListComoponetData<ED, T> : {});
};
export {};
