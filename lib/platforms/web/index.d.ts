import { Aspect, Context, EntityDict, DeduceSorterItem, DeduceOperation, SelectRowShape } from 'oak-domain/lib/types';
import { CommonAspectDict } from 'oak-common-aspect';
import { Feature } from '../../types/Feature';
import { initialize as init } from '../../initialize.dev';
import { Pagination } from '../../types/Pagination';
import { BasicFeatures } from '../../features';
import { ExceptionHandler } from '../../types/ExceptionRoute';
import { NamedFilterItem, NamedSorterItem } from '../../types/NamedCondition';
import { CreateNodeOptions } from '../../features/runningTree';
import React from 'react';
export declare type RowSelected<ED extends EntityDict, T extends keyof ED, Proj extends ED[T]['Selection']['data'] = Required<ED[T]['Selection']['data']>> = SelectRowShape<ED[T]['Schema'], Proj> | undefined;
export declare type OakComponentOption<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>, FormedData extends React.ComponentState, IsList extends boolean> = {
    entity: T;
    isList: IsList;
    formData: (options: {
        data: IsList extends true ? RowSelected<ED, T>[] : RowSelected<ED, T>;
        features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD;
        params?: Record<string, any>;
        legalActions?: string[];
    }) => Promise<FormedData>;
    render: () => JSX.Element;
};
export interface OakPageOption<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>, Proj extends ED[T]['Selection']['data'], FormedData extends React.ComponentState, IsList extends boolean> {
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
        }) => Promise<ED[T]['Selection']['filter']>);
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
    }) => Promise<FormedData>;
    ns?: T | T[];
    render: () => JSX.Element;
}
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
    newOakActions: string[];
};
export declare type OakComponentProperties = {
    oakEntity: StringConstructor;
    oakPath: StringConstructor;
    oakParent: StringConstructor;
};
export declare type OakPageProps = {
    oakEntity: string;
    oakPath: string;
    oakParent: string;
    oakId: string;
    oakProjection: string;
    oakFilters: string;
    oakSorters: string;
    oakIsPicker: boolean;
    oakFrom: string;
    oakParentEntity: string;
    oakActions: string;
    newOakActions: string[];
};
export declare type OakNavigateToParameters<ED extends EntityDict, T extends keyof ED> = {
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
    navigateTo: <T2 extends keyof ED>(options: OakNavigateToParameters<ED, T2>) => void;
    resetUpdateData: () => void;
    execute: (action: ED[T]['Action'], legalExceptions?: Array<string>) => Promise<DeduceOperation<ED[T]['Schema']> | DeduceOperation<ED[T]['Schema']>[] | undefined>;
};
export declare type ComponentOnPropsChangeOption = {
    path?: string;
    parent?: string;
};
export declare type OakComponentOnlyMethods = {
    onPropsChanged: (options: ComponentOnPropsChangeOption) => Promise<void>;
};
export declare type OakPageMethods<ED extends EntityDict, T extends keyof ED> = OakComponentMethods<ED, T> & {
    refresh: (extra?: any) => Promise<void>;
    onPullDownRefresh: () => Promise<void>;
    onReachBottom: () => Promise<void>;
    onLoad: (options: Record<string, string | undefined>) => Promise<void>;
    setForeignKey: (id: string, goBackDelta?: number) => Promise<void>;
    onForeignKeyPicked: (touch: React.BaseSyntheticEvent) => void;
};
export declare type OakComponentInstanceProperties<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>> = {
    features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD;
    isReady: boolean;
};
export declare type OakPageInstanceProperties<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>> = OakComponentInstanceProperties<ED, Cxt, AD, FD>;
export declare type DataOption = Record<string, any>;
export declare type MethodOption = Record<string, Function>;
export declare type IAnyObject = Record<string, any>;
export interface Method<P extends DataOption, D extends DataOption, M extends MethodOption, TIsPage extends boolean = false> {
    /** 组件的方法，包括事件响应函数和任意的自定义方法，关于事件响应函数的使用 */
    methods: M & Partial<React.ComponentLifecycle<P, D>>;
}
export declare type Instance<TProps extends DataOption, TData extends DataOption, TMethod extends Partial<MethodOption>, TCustomInstanceProperty extends IAnyObject = {}, TIsPage extends boolean = false> = React.Component<TProps, TData> & TMethod & TCustomInstanceProperty & {
    /** 组件数据，**包括内部数据和属性值** */
    data: TData;
};
export declare type OakWebOptions<TProps extends DataOption, TData extends DataOption, TMethod extends MethodOption, InherentMethods extends MethodOption, InherentData extends DataOption, InherentInstanceProperty extends IAnyObject, TCustomInstanceProperty extends IAnyObject = {}, TIsPage extends boolean = false> = Partial<TData> & Partial<Method<TProps, TData, TMethod, TIsPage>> & Partial<React.ComponentLifecycle<TProps, TData>> & ThisType<Instance<TProps, TData & InherentData, TMethod & InherentMethods, TCustomInstanceProperty & InherentInstanceProperty, TIsPage>>;
export declare type MakeOakPage<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>> = <T extends keyof ED, P extends DataOption, //props
D extends DataOption, M extends MethodOption, Proj extends ED[T]['Selection']['data'], IsList extends boolean, IS extends IAnyObject = {}, FormedData extends React.ComponentState = {}>(options: OakPageOption<ED, T, Cxt, AD, FD, Proj, FormedData, IsList> & ThisType<Instance<P & OakPageProps, D & OakPageData, M & OakPageMethods<ED, T>, IS & OakPageInstanceProperties<ED, Cxt, AD, FD>, true>>, componentOptions: OakWebOptions<P, D, M, OakPageMethods<ED, T>, OakPageData & FormedData, OakPageInstanceProperties<ED, Cxt, AD, FD>, IS, true>) => React.ComponentType<any>;
export declare type MakeOakComponent<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>> = <T extends keyof ED, P extends DataOption, D extends DataOption, M extends MethodOption, IsList extends boolean, IS extends IAnyObject = {}, FormedData extends React.ComponentState = {}>(options: OakComponentOption<ED, T, Cxt, AD, FD, FormedData, IsList> & ThisType<Instance<P & OakPageProps, D & OakPageData, M & OakPageMethods<ED, T>, IS & OakPageInstanceProperties<ED, Cxt, AD, FD>, true>>, componentOptions: OakWebOptions<P, D, M, OakPageMethods<ED, T>, OakPageData & FormedData, OakPageInstanceProperties<ED, Cxt, AD, FD>, IS, false>) => React.ComponentType<any>;
export declare type OakComponentData = {} & OakPageData;
export declare function makeComponentMethods<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>, FormedData extends React.ComponentState, IsList extends boolean>(features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD, formData: OakComponentOption<ED, T, Cxt, AD, FD, FormedData, IsList>['formData'], exceptionRouterDict: Record<string, ExceptionHandler>): OakComponentMethods<ED, T> & ThisType<Instance<OakPageProps, OakComponentData & OakPageProps, OakPageMethods<ED, T>, OakComponentInstanceProperties<ED, Cxt, AD, FD>, false>>;
export declare function createPageOptions<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>, Proj extends ED[T]['Selection']['data'], FormedData extends React.ComponentState, IsList extends boolean>(options: OakPageOption<ED, T, Cxt, AD, FD, Proj, FormedData, IsList>, doSubscribe: ReturnType<typeof init>['subscribe'], features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD, exceptionRouterDict: Record<string, ExceptionHandler>): {
    render: () => JSX.Element;
    methods: {
        subscribed?: (() => void) | undefined;
        subscribe: () => void;
        unsubscribe: () => void;
        reRender: (extra?: Record<string, any> | undefined) => Promise<void>;
        pushNode: (path?: string | undefined, options?: Pick<CreateNodeOptions<ED, keyof ED>, "updateData" | "beforeExecute" | "afterExecute"> | undefined) => void;
        removeNode: (parent: string, path: string) => void;
        setUpdateData: (attr: string, input: any) => void;
        callPicker: (attr: string, params: Record<string, any>) => void;
        setFilters: (filters: NamedFilterItem<ED, keyof ED>[]) => void;
        getFilters: () => Promise<ED[keyof ED]["Selection"]["filter"][]>;
        getFilterByName: (name: string) => Promise<ED[keyof ED]["Selection"]["filter"]> | undefined;
        addNamedFilter: (filter: NamedFilterItem<ED, keyof ED>, refresh?: boolean | undefined) => void;
        removeNamedFilter: (filter: NamedFilterItem<ED, keyof ED>, refresh?: boolean | undefined) => void;
        removeNamedFilterByName: (name: string, refresh?: boolean | undefined) => void;
        setNamedSorters: (sorters: NamedSorterItem<ED, keyof ED>[]) => void;
        getSorters: () => Promise<ED[keyof ED]["Selection"]["sorter"]>;
        getSorterByName: (name: string) => Promise<DeduceSorterItem<ED[keyof ED]["Schema"]> | undefined>;
        addNamedSorter: (filter: NamedSorterItem<ED, keyof ED>, refresh?: boolean | undefined) => void;
        removeNamedSorter: (filter: NamedSorterItem<ED, keyof ED>, refresh?: boolean | undefined) => void;
        removeNamedSorterByName: (name: string, refresh?: boolean | undefined) => void;
        navigateTo: <T2 extends keyof ED>(options: OakNavigateToParameters<ED, T2>) => void;
        resetUpdateData: () => void;
        execute: (action: ED[keyof ED]["Action"], legalExceptions?: string[] | undefined) => Promise<DeduceOperation<ED[keyof ED]["Schema"]> | DeduceOperation<ED[keyof ED]["Schema"]>[] | undefined>;
        refresh(): Promise<void>;
        onPullDownRefresh(): Promise<void>;
        onReachBottom(): Promise<void>;
        ready(): Promise<void>;
        attached(): Promise<void>;
        detached(): Promise<void>;
    };
};
export declare function createComponentOptions<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>, IsList extends boolean, FormedData extends React.ComponentState>(options: OakComponentOption<ED, T, Cxt, AD, FD, FormedData, IsList>, features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD, exceptionRouterDict: Record<string, ExceptionHandler>): {
    render: () => JSX.Element;
    methods: {
        subscribed?: (() => void) | undefined;
        subscribe: () => void;
        unsubscribe: () => void;
        reRender: (extra?: Record<string, any> | undefined) => Promise<void>;
        pushNode: (path?: string | undefined, options?: Pick<CreateNodeOptions<ED, keyof ED>, "updateData" | "beforeExecute" | "afterExecute"> | undefined) => void;
        removeNode: (parent: string, path: string) => void;
        setUpdateData: (attr: string, input: any) => void;
        callPicker: (attr: string, params: Record<string, any>) => void;
        setFilters: (filters: NamedFilterItem<ED, keyof ED>[]) => void;
        getFilters: () => Promise<ED[keyof ED]["Selection"]["filter"][]>;
        getFilterByName: (name: string) => Promise<ED[keyof ED]["Selection"]["filter"]> | undefined;
        addNamedFilter: (filter: NamedFilterItem<ED, keyof ED>, refresh?: boolean | undefined) => void;
        removeNamedFilter: (filter: NamedFilterItem<ED, keyof ED>, refresh?: boolean | undefined) => void;
        removeNamedFilterByName: (name: string, refresh?: boolean | undefined) => void;
        setNamedSorters: (sorters: NamedSorterItem<ED, keyof ED>[]) => void;
        getSorters: () => Promise<ED[keyof ED]["Selection"]["sorter"]>;
        getSorterByName: (name: string) => Promise<DeduceSorterItem<ED[keyof ED]["Schema"]> | undefined>;
        addNamedSorter: (filter: NamedSorterItem<ED, keyof ED>, refresh?: boolean | undefined) => void;
        removeNamedSorter: (filter: NamedSorterItem<ED, keyof ED>, refresh?: boolean | undefined) => void;
        removeNamedSorterByName: (name: string, refresh?: boolean | undefined) => void;
        navigateTo: <T2 extends keyof ED>(options: OakNavigateToParameters<ED, T2>) => void;
        resetUpdateData: () => void;
        execute: (action: ED[keyof ED]["Action"], legalExceptions?: string[] | undefined) => Promise<DeduceOperation<ED[keyof ED]["Schema"]> | DeduceOperation<ED[keyof ED]["Schema"]>[] | undefined>;
        ready(): Promise<void>;
        attached(): Promise<void>;
        detached(): Promise<void>;
    };
};
