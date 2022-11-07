import { EntityDict, Context, StorageSchema, OpRecord, SelectRowShape, DeduceSorterItem, AspectWrapper } from "oak-domain/lib/types";
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { CommonAspectDict } from 'oak-common-aspect';
import { NamedFilterItem, NamedSorterItem } from "../types/NamedCondition";
import { Cache } from './cache';
import { Pagination } from '../types/Pagination';
import { Feature } from '../types/Feature';
declare abstract class Node<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends CommonAspectDict<ED, Cxt>> {
    protected entity: T;
    protected schema: StorageSchema<ED>;
    protected projection: ED[T]['Selection']['data'] | (() => Promise<ED[T]['Selection']['data']>);
    protected parent?: SingleNode<ED, keyof ED, Cxt, AD> | ListNode<ED, T, Cxt, AD> | VirtualNode;
    protected dirty?: boolean;
    protected cache: Cache<ED, Cxt, AD>;
    protected loading: boolean;
    protected loadingMore: boolean;
    protected executing: boolean;
    protected modiIds: string[] | undefined;
    constructor(entity: T, schema: StorageSchema<ED>, cache: Cache<ED, Cxt, AD>, projection: ED[T]['Selection']['data'] | (() => Promise<ED[T]['Selection']['data']>), parent?: SingleNode<ED, keyof ED, Cxt, AD> | ListNode<ED, T, Cxt, AD> | VirtualNode);
    getEntity(): T;
    getSchema(): StorageSchema<ED>;
    protected abstract getChildPath(child: Node<ED, keyof ED, Cxt, AD>): string;
    abstract doBeforeTrigger(): Promise<void>;
    abstract doAfterTrigger(): Promise<void>;
    abstract checkIfClean(): void;
    /**
     * 这个函数从某个结点向父亲查询，看所在路径上是否有需要被应用的modi
     */
    getActiveModies(child: Node<ED, keyof ED, Cxt, AD>): Promise<BaseEntityDict['modi']['OpSchema'][] | undefined>;
    setDirty(): void;
    isDirty(): boolean;
    isLoading(): boolean;
    protected setLoading(loading: boolean): void;
    isLoadingMore(): boolean;
    isExecuting(): boolean;
    setExecuting(executing: boolean): void;
    getParent(): SingleNode<ED, keyof ED, Cxt, AD> | ListNode<ED, T, Cxt, AD> | VirtualNode | undefined;
    protected getProjection(): Promise<ED[T]["Selection"]["data"]>;
    protected judgeRelation(attr: string): string | 0 | 1 | 2 | string[];
    protected contains(filter: ED[T]['Selection']['filter'], conditionalFilter: ED[T]['Selection']['filter']): boolean;
    protected repel(filter1: ED[T]['Selection']['filter'], filter2: ED[T]['Selection']['filter']): boolean;
}
declare class ListNode<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Node<ED, T, Cxt, AD> {
    private children;
    private updates;
    private filters;
    private sorters;
    private pagination;
    private ids;
    private syncHandler;
    getChildPath(child: SingleNode<ED, T, Cxt, AD>): string;
    setLoading(loading: boolean): void;
    checkIfClean(): void;
    onCacheSync(records: OpRecord<ED>[]): Promise<void>;
    destroy(): void;
    constructor(entity: T, schema: StorageSchema<ED>, cache: Cache<ED, Cxt, AD>, projection: ED[T]['Selection']['data'] | (() => Promise<ED[T]['Selection']['data']>), parent?: SingleNode<ED, keyof ED, Cxt, AD> | VirtualNode, filters?: NamedFilterItem<ED, T>[], sorters?: NamedSorterItem<ED, T>[], pagination?: Pagination);
    getPagination(): Pagination;
    setPagination(pagination: Pagination): Promise<void>;
    getChild(path: string): SingleNode<ED, T, Cxt, AD> | undefined;
    getChildren(): Record<string, SingleNode<ED, T, Cxt, AD>>;
    addChild(path: string, node: SingleNode<ED, T, Cxt, AD>): void;
    removeChild(path: string): void;
    getNamedFilters(): NamedFilterItem<ED, T>[];
    getNamedFilterByName(name: string): NamedFilterItem<ED, T> | undefined;
    setNamedFilters(filters: NamedFilterItem<ED, T>[], refresh?: boolean): Promise<void>;
    addNamedFilter(filter: NamedFilterItem<ED, T>, refresh?: boolean): Promise<void>;
    removeNamedFilter(filter: NamedFilterItem<ED, T>, refresh?: boolean): Promise<void>;
    removeNamedFilterByName(name: string, refresh?: boolean): Promise<void>;
    getNamedSorters(): NamedSorterItem<ED, T>[];
    getNamedSorterByName(name: string): NamedSorterItem<ED, T> | undefined;
    setNamedSorters(sorters: NamedSorterItem<ED, T>[], refresh?: boolean): Promise<void>;
    addNamedSorter(sorter: NamedSorterItem<ED, T>, refresh?: boolean): Promise<void>;
    removeNamedSorter(sorter: NamedSorterItem<ED, T>, refresh?: boolean): Promise<void>;
    removeNamedSorterByName(name: string, refresh: boolean): Promise<void>;
    getFreshValue(): Promise<Array<SelectRowShape<ED[T]['Schema'], ED[T]['Selection']['data']>>>;
    addItem(item: Omit<ED[T]['CreateSingle']['data'], 'id'>, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>): Promise<void>;
    removeItem(id: string, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>): Promise<void>;
    recoverItem(id: string): Promise<void>;
    /**
     * 目前只支持根据itemId进行更新
     * @param data
     * @param id
     * @param beforeExecute
     * @param afterExecute
     */
    updateItem(data: ED[T]['Update']['data'], id: string, action?: ED[T]['Action'], beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>): Promise<void>;
    updateItems(data: Record<string, ED[T]['Update']['data']>, action?: ED[T]['Action']): Promise<void>;
    doBeforeTrigger(): Promise<void>;
    doAfterTrigger(): Promise<void>;
    getParentFilter(childNode: SingleNode<ED, T, Cxt, AD>): Promise<ED[T]['Selection']['filter'] | undefined>;
    composeOperations(): Promise<any[] | undefined>;
    getProjection(): Promise<ED[T]['Selection']['data']>;
    constructSelection(withParent?: true, disableOperation?: boolean): Promise<{
        data: ED[T]["Selection"]["data"];
        filter: ED[T]["Selection"]["filter"] | undefined;
        sorter: DeduceSorterItem<ED[T]["Schema"]>[];
        validParentFilter: boolean;
    }>;
    refresh(pageNumber?: number, getCount?: true, append?: boolean): Promise<void>;
    loadMore(): Promise<void>;
    setCurrentPage<T extends keyof ED>(currentPage: number, append?: boolean): Promise<void>;
    clean(): void;
}
declare class SingleNode<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Node<ED, T, Cxt, AD> {
    private id?;
    private children;
    private operation?;
    constructor(entity: T, schema: StorageSchema<ED>, cache: Cache<ED, Cxt, AD>, projection: ED[T]['Selection']['data'] | (() => Promise<ED[T]['Selection']['data']>), parent?: SingleNode<ED, keyof ED, Cxt, AD> | ListNode<ED, T, Cxt, AD> | VirtualNode, id?: string);
    private tryGetParentFilter;
    protected getChildPath(child: Node<ED, keyof ED, Cxt, AD>): string;
    setLoading(loading: boolean): void;
    checkIfClean(): void;
    destroy(): void;
    getChild(path: string): SingleNode<ED, keyof ED, Cxt, AD> | ListNode<ED, keyof ED, Cxt, AD>;
    setId(id: string): Promise<void>;
    unsetId(): void;
    getId(): string | undefined;
    getChildren(): {
        [K: string]: SingleNode<ED, keyof ED, Cxt, AD> | ListNode<ED, keyof ED, Cxt, AD>;
    };
    addChild(path: string, node: SingleNode<ED, keyof ED, Cxt, AD> | ListNode<ED, keyof ED, Cxt, AD>): void;
    removeChild(path: string): void;
    getFreshValue(disableOperation?: boolean): Promise<SelectRowShape<ED[T]['Schema'], ED[T]['Selection']['data']> | undefined>;
    doBeforeTrigger(): Promise<void>;
    doAfterTrigger(): Promise<void>;
    create(data: Partial<Omit<ED[T]['CreateSingle']['data'], 'id'>>, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>): Promise<void>;
    update(data: ED[T]['Update']['data'], action?: ED[T]['Action'], beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>): Promise<void>;
    remove(beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>): Promise<void>;
    composeOperations(): Promise<Array<{
        entity: T;
        operation: ED[T]['Update'];
    }> | undefined>;
    getProjection(withDecendants?: boolean): Promise<ED[T]["Selection"]["data"]>;
    refresh(): Promise<void>;
    clean(): void;
    getParentFilter<T2 extends keyof ED>(childNode: Node<ED, keyof ED, Cxt, AD>, disableOperation?: boolean): Promise<ED[T2]['Selection']['filter'] | undefined>;
}
declare class VirtualNode {
    private dirty;
    private children;
    constructor();
    getActiveModies(child: any): Promise<undefined>;
    setDirty(): void;
    addChild(path: string, child: SingleNode<any, any, any, any> | ListNode<any, any, any, any>): void;
    getChild(path: string): SingleNode<any, any, any, any> | ListNode<any, any, any, any> | undefined;
    getParent(): undefined;
    destroy(): void;
    getFreshValue(): Promise<undefined>;
    isDirty(): boolean;
    refresh(): Promise<void[]>;
    composeOperations(): Promise<any[]>;
    setExecuting(executing: boolean): void;
    doBeforeTrigger(): Promise<void>;
    doAfterTrigger(): Promise<void>;
    clean(): void;
    checkIfClean(): void;
}
export declare type CreateNodeOptions<ED extends EntityDict & BaseEntityDict, T extends keyof ED> = {
    path: string;
    entity?: T;
    isList?: boolean;
    isPicker?: boolean;
    projection?: ED[T]['Selection']['data'] | (() => Promise<ED[T]['Selection']['data']>);
    pagination?: Pagination;
    filters?: NamedFilterItem<ED, T>[];
    sorters?: NamedSorterItem<ED, T>[];
    beforeExecute?: (operations: ED[T]['Operation'][]) => Promise<void>;
    afterExecute?: (operations: ED[T]['Operation'][]) => Promise<void>;
    id?: string;
};
export declare class RunningTree<ED extends EntityDict & BaseEntityDict, Cxt extends Context<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Feature {
    private cache;
    private schema;
    private root;
    private aspectWrapper;
    constructor(aspectWrapper: AspectWrapper<ED, Cxt, AD>, cache: Cache<ED, Cxt, AD>, schema: StorageSchema<ED>);
    createNode<T extends keyof ED>(options: CreateNodeOptions<ED, T>): Promise<VirtualNode | ListNode<ED, T, Cxt, AD> | SingleNode<ED, T, Cxt, AD> | undefined>;
    private findNode;
    destroyNode(path: string): void;
    getFreshValue(path: string): Promise<SelectRowShape<ED[keyof ED]["Schema"], ED[keyof ED]["Selection"]["data"]> | undefined> | Promise<SelectRowShape<ED[keyof ED]["Schema"], ED[keyof ED]["Selection"]["data"]>[]> | undefined;
    isDirty(path: string): boolean;
    addItem<T extends keyof ED>(path: string, data: Omit<ED[T]['CreateSingle']['data'], 'id'>, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>): Promise<void>;
    removeItem(path: string, id: string, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>): Promise<void>;
    updateItem<T extends keyof ED>(path: string, data: ED[T]['Update']['data'], id: string, action?: ED[T]['Action'], beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>): Promise<void>;
    recoverItem(path: string, id: string): Promise<void>;
    create<T extends keyof ED>(path: string, data: Omit<ED[T]['CreateSingle']['data'], 'id'>, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>): Promise<void>;
    update<T extends keyof ED>(path: string, data: ED[T]['Update']['data'], action?: ED[T]['Action'], beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>): Promise<void>;
    remove(path: string, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>): Promise<void>;
    isLoading(path: string): boolean;
    isLoadingMore(path: string): boolean;
    isExecuting(path: string): boolean;
    refresh(path: string): Promise<void>;
    loadMore(path: string): Promise<void>;
    getPagination(path: string): Pagination;
    setId(path: string, id: string): Promise<void>;
    unsetId(path: string): Promise<void>;
    getId(path: string): string | undefined;
    setPageSize<T extends keyof ED>(path: string, pageSize: number): Promise<void>;
    setCurrentPage<T extends keyof ED>(path: string, currentPage: number): Promise<void>;
    getNamedFilters<T extends keyof ED>(path: string): NamedFilterItem<ED, keyof ED>[];
    getNamedFilterByName<T extends keyof ED>(path: string, name: string): NamedFilterItem<ED, keyof ED> | undefined;
    setNamedFilters<T extends keyof ED>(path: string, filters: NamedFilterItem<ED, T>[], refresh?: boolean): Promise<void>;
    addNamedFilter<T extends keyof ED>(path: string, filter: NamedFilterItem<ED, T>, refresh?: boolean): Promise<void>;
    removeNamedFilter<T extends keyof ED>(path: string, filter: NamedFilterItem<ED, T>, refresh?: boolean): Promise<void>;
    removeNamedFilterByName<T extends keyof ED>(path: string, name: string, refresh?: boolean): Promise<void>;
    getNamedSorters<T extends keyof ED>(path: string): NamedSorterItem<ED, keyof ED>[];
    getNamedSorterByName<T extends keyof ED>(path: string, name: string): NamedSorterItem<ED, keyof ED> | undefined;
    setNamedSorters<T extends keyof ED>(path: string, sorters: NamedSorterItem<ED, T>[], refresh?: boolean): Promise<void>;
    addNamedSorter<T extends keyof ED>(path: string, sorter: NamedSorterItem<ED, T>, refresh?: boolean): Promise<void>;
    removeNamedSorter<T extends keyof ED>(path: string, sorter: NamedSorterItem<ED, T>, refresh?: boolean): Promise<void>;
    removeNamedSorterByName(path: string, name: string, refresh?: boolean): Promise<void>;
    tryExecute(path: string): Promise<boolean>;
    getOperations(path: string): Promise<any[] | undefined>;
    execute<T extends keyof ED>(path: string, data?: ED[T]['Update']['data'] | Record<string, ED[T]['Update']['data']>, action?: ED[T]['Action']): Promise<any[]>;
    clean(path: string): Promise<void>;
    getRoot(): Record<string, VirtualNode | SingleNode<ED, keyof ED, Cxt, AD> | ListNode<ED, keyof ED, Cxt, AD>>;
}
export {};
