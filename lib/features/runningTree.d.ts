import { EntityDict, StorageSchema, OpRecord, DeduceSorterItem, AspectWrapper } from "oak-domain/lib/types";
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { CommonAspectDict } from 'oak-common-aspect';
import { NamedFilterItem, NamedSorterItem } from "../types/NamedCondition";
import { Cache } from './cache';
import { Pagination } from '../types/Pagination';
import { Feature } from '../types/Feature';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
declare abstract class Node<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Feature {
    protected entity: T;
    protected schema: StorageSchema<ED>;
    protected projection: ED[T]['Selection']['data'] | (() => ED[T]['Selection']['data']);
    protected parent?: SingleNode<ED, keyof ED, Cxt, FrontCxt, AD> | ListNode<ED, T, Cxt, FrontCxt, AD> | VirtualNode<ED, Cxt, FrontCxt, AD>;
    protected dirty?: boolean;
    protected cache: Cache<ED, Cxt, FrontCxt, AD>;
    protected loading: boolean;
    protected loadingMore: boolean;
    protected executing: boolean;
    protected modiIds: string[] | undefined;
    constructor(entity: T, schema: StorageSchema<ED>, cache: Cache<ED, Cxt, FrontCxt, AD>, projection: ED[T]['Selection']['data'] | (() => Promise<ED[T]['Selection']['data']>), parent?: SingleNode<ED, keyof ED, Cxt, FrontCxt, AD> | ListNode<ED, T, Cxt, FrontCxt, AD> | VirtualNode<ED, Cxt, FrontCxt, AD>, path?: string);
    getEntity(): T;
    getSchema(): StorageSchema<ED>;
    protected abstract getChildPath(child: Node<ED, keyof ED, Cxt, FrontCxt, AD>): string;
    abstract doBeforeTrigger(): Promise<void>;
    abstract doAfterTrigger(): Promise<void>;
    abstract checkIfClean(): void;
    /**
     * 这个函数从某个结点向父亲查询，看所在路径上是否有需要被应用的modi
     */
    getActiveModies(child: Node<ED, keyof ED, Cxt, FrontCxt, AD>): BaseEntityDict['modi']['OpSchema'][] | undefined;
    setDirty(): void;
    isDirty(): boolean;
    isLoading(): boolean;
    protected setLoading(loading: boolean): void;
    isLoadingMore(): boolean;
    isExecuting(): boolean;
    setExecuting(executing: boolean): void;
    getParent(): SingleNode<ED, keyof ED, Cxt, FrontCxt, AD> | ListNode<ED, T, Cxt, FrontCxt, AD> | VirtualNode<ED, Cxt, FrontCxt, AD> | undefined;
    protected getProjection(): ED[T]["Selection"]["data"];
    protected judgeRelation(attr: string): string | 0 | 1 | 2 | string[];
    protected contains(filter: ED[T]['Selection']['filter'], conditionalFilter: ED[T]['Selection']['filter']): boolean;
    protected repel(filter1: ED[T]['Selection']['filter'], filter2: ED[T]['Selection']['filter']): boolean;
}
declare class ListNode<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Node<ED, T, Cxt, FrontCxt, AD> {
    private children;
    private updates;
    private filters;
    private sorters;
    private pagination;
    private ids;
    private syncHandler;
    getChildPath(child: SingleNode<ED, T, Cxt, FrontCxt, AD>): string;
    checkIfClean(): void;
    onCacheSync(records: OpRecord<ED>[]): void;
    destroy(): void;
    constructor(entity: T, schema: StorageSchema<ED>, cache: Cache<ED, Cxt, FrontCxt, AD>, projection: ED[T]['Selection']['data'] | (() => Promise<ED[T]['Selection']['data']>), parent?: SingleNode<ED, keyof ED, Cxt, FrontCxt, AD> | VirtualNode<ED, Cxt, FrontCxt, AD>, path?: string, filters?: NamedFilterItem<ED, T>[], sorters?: NamedSorterItem<ED, T>[], pagination?: Pagination);
    getPagination(): Pagination;
    setPagination(pagination: Pagination): void;
    getChild(path: string): SingleNode<ED, T, Cxt, FrontCxt, AD> | undefined;
    getChildren(): Record<string, SingleNode<ED, T, Cxt, FrontCxt, AD>>;
    addChild(path: string, node: SingleNode<ED, T, Cxt, FrontCxt, AD>): void;
    removeChild(path: string): void;
    getNamedFilters(): NamedFilterItem<ED, T>[];
    getNamedFilterByName(name: string): NamedFilterItem<ED, T> | undefined;
    setNamedFilters(filters: NamedFilterItem<ED, T>[], refresh?: boolean): void;
    addNamedFilter(filter: NamedFilterItem<ED, T>, refresh?: boolean): void;
    removeNamedFilter(filter: NamedFilterItem<ED, T>, refresh?: boolean): void;
    removeNamedFilterByName(name: string, refresh?: boolean): void;
    getNamedSorters(): NamedSorterItem<ED, T>[];
    getNamedSorterByName(name: string): NamedSorterItem<ED, T> | undefined;
    setNamedSorters(sorters: NamedSorterItem<ED, T>[], refresh?: boolean): void;
    addNamedSorter(sorter: NamedSorterItem<ED, T>, refresh?: boolean): void;
    removeNamedSorter(sorter: NamedSorterItem<ED, T>, refresh?: boolean): void;
    removeNamedSorterByName(name: string, refresh: boolean): void;
    getFreshValue(): Array<Partial<ED[T]['Schema']>>;
    addItem(item: Omit<ED[T]['CreateSingle']['data'], 'id'>, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>): void;
    removeItem(id: string, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>): void;
    recoverItem(id: string): void;
    /**
     * 目前只支持根据itemId进行更新
     * @param data
     * @param id
     * @param beforeExecute
     * @param afterExecute
     */
    updateItem(data: ED[T]['Update']['data'], id: string, action?: ED[T]['Action'], beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>): void;
    updateItems(data: Record<string, ED[T]['Update']['data']>, action?: ED[T]['Action']): Promise<void>;
    doBeforeTrigger(): Promise<void>;
    doAfterTrigger(): Promise<void>;
    getParentFilter(childNode: SingleNode<ED, T, Cxt, FrontCxt, AD>): ED[T]['Selection']['filter'] | undefined;
    composeOperations(): Array<{
        entity: T;
        operation: ED[T]['Operation'];
    }> | undefined;
    getProjection(): ED[T]['Selection']['data'];
    constructSelection(withParent?: true, disableOperation?: boolean): {
        data: ED[T]["Selection"]["data"];
        filter: ED[T]["Selection"]["filter"] | undefined;
        sorter: DeduceSorterItem<ED[T]["Schema"]>[];
        validParentFilter: boolean;
    };
    refresh(pageNumber?: number, getCount?: true, append?: boolean): Promise<void>;
    loadMore(): Promise<void>;
    setCurrentPage(currentPage: number, append?: boolean): void;
    clean(): void;
}
declare class SingleNode<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Node<ED, T, Cxt, FrontCxt, AD> {
    private id?;
    private children;
    private operation?;
    constructor(entity: T, schema: StorageSchema<ED>, cache: Cache<ED, Cxt, FrontCxt, AD>, projection: ED[T]['Selection']['data'] | (() => Promise<ED[T]['Selection']['data']>), parent?: SingleNode<ED, keyof ED, Cxt, FrontCxt, AD> | ListNode<ED, T, Cxt, FrontCxt, AD> | VirtualNode<ED, Cxt, FrontCxt, AD>, path?: string, id?: string);
    private tryGetParentFilter;
    protected getChildPath(child: Node<ED, keyof ED, Cxt, FrontCxt, AD>): string;
    checkIfClean(): void;
    destroy(): void;
    getChild(path: string): SingleNode<ED, keyof ED, Cxt, FrontCxt, AD> | ListNode<ED, keyof ED, Cxt, FrontCxt, AD>;
    setId(id: string): void;
    unsetId(): void;
    getId(): string | undefined;
    getChildren(): {
        [K: string]: SingleNode<ED, keyof ED, Cxt, FrontCxt, AD> | ListNode<ED, keyof ED, Cxt, FrontCxt, AD>;
    };
    addChild(path: string, node: SingleNode<ED, keyof ED, Cxt, FrontCxt, AD> | ListNode<ED, keyof ED, Cxt, FrontCxt, AD>): void;
    removeChild(path: string): void;
    getFreshValue(disableOperation?: boolean): Partial<ED[T]['Schema']> | undefined;
    doBeforeTrigger(): Promise<void>;
    doAfterTrigger(): Promise<void>;
    create(data: Partial<Omit<ED[T]['CreateSingle']['data'], 'id'>>, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>): void;
    update(data: ED[T]['Update']['data'], action?: ED[T]['Action'], beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>): void;
    remove(beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>): void;
    composeOperations(): Array<{
        entity: T;
        operation: ED[T]['Operation'];
    }> | undefined;
    getProjection(withDecendants?: boolean): ED[T]["Selection"]["data"];
    refresh(): Promise<void>;
    clean(): void;
    getFilter(disableOperation?: boolean): ED[T]['Selection']['filter'] | undefined;
    /**
     * getParentFilter不能假设一定已经有数据，只能根据当前filter的条件去构造
     * @param childNode
     * @param disableOperation
     * @returns
     */
    getParentFilter<T2 extends keyof ED>(childNode: Node<ED, keyof ED, Cxt, FrontCxt, AD>, disableOperation?: boolean): ED[T2]['Selection']['filter'] | undefined;
}
declare class VirtualNode<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Feature {
    private dirty;
    private children;
    constructor();
    getActiveModies(child: any): undefined;
    setDirty(): void;
    addChild(path: string, child: SingleNode<ED, keyof ED, Cxt, FrontCxt, AD> | ListNode<ED, keyof ED, Cxt, FrontCxt, AD>): void;
    getChild(path: string): SingleNode<ED, keyof ED, Cxt, FrontCxt, AD> | ListNode<ED, keyof ED, Cxt, FrontCxt, AD>;
    getParent(): undefined;
    destroy(): void;
    getFreshValue(): undefined;
    isDirty(): boolean;
    refresh(): Promise<void>;
    composeOperations(): Array<{
        entity: keyof ED;
        operation: ED[keyof ED]['Operation'];
    }> | undefined;
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
    projection?: ED[T]['Selection']['data'] | (() => ED[T]['Selection']['data']);
    pagination?: Pagination;
    filters?: NamedFilterItem<ED, T>[];
    sorters?: NamedSorterItem<ED, T>[];
    beforeExecute?: (operations: ED[T]['Operation'][]) => Promise<void>;
    afterExecute?: (operations: ED[T]['Operation'][]) => Promise<void>;
    id?: string;
};
export declare class RunningTree<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Feature {
    private cache;
    private schema;
    private root;
    private aspectWrapper;
    constructor(aspectWrapper: AspectWrapper<ED, Cxt, AD>, cache: Cache<ED, Cxt, FrontCxt, AD>, schema: StorageSchema<ED>);
    createNode<T extends keyof ED>(options: CreateNodeOptions<ED, T>): SingleNode<ED, keyof ED, Cxt, FrontCxt, AD> | ListNode<ED, keyof ED, Cxt, FrontCxt, AD> | VirtualNode<ED, Cxt, FrontCxt, AD>;
    private findNode;
    destroyNode(path: string): void;
    getFreshValue(path: string): Partial<ED[keyof ED]["Schema"]> | Partial<ED[keyof ED]["Schema"]>[] | undefined;
    isDirty(path: string): boolean;
    addItem<T extends keyof ED>(path: string, data: Omit<ED[T]['CreateSingle']['data'], 'id'>, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>): void;
    removeItem(path: string, id: string, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>): void;
    updateItem<T extends keyof ED>(path: string, data: ED[T]['Update']['data'], id: string, action?: ED[T]['Action'], beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>): void;
    recoverItem(path: string, id: string): void;
    create<T extends keyof ED>(path: string, data: Omit<ED[T]['CreateSingle']['data'], 'id'>, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>): Promise<void>;
    update<T extends keyof ED>(path: string, data: ED[T]['Update']['data'], action?: ED[T]['Action'], beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>): void;
    remove(path: string, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>): void;
    isLoading(path: string): boolean;
    isLoadingMore(path: string): boolean;
    isExecuting(path: string): boolean;
    refresh(path: string): Promise<void>;
    loadMore(path: string): Promise<void>;
    getPagination(path: string): Pagination;
    setId(path: string, id: string): void;
    unsetId(path: string): void;
    getId(path: string): string | undefined;
    setPageSize<T extends keyof ED>(path: string, pageSize: number): void;
    setCurrentPage<T extends keyof ED>(path: string, currentPage: number): void;
    getNamedFilters<T extends keyof ED>(path: string): NamedFilterItem<ED, keyof ED>[];
    getNamedFilterByName<T extends keyof ED>(path: string, name: string): NamedFilterItem<ED, keyof ED> | undefined;
    setNamedFilters<T extends keyof ED>(path: string, filters: NamedFilterItem<ED, T>[], refresh?: boolean): void;
    addNamedFilter<T extends keyof ED>(path: string, filter: NamedFilterItem<ED, T>, refresh?: boolean): void;
    removeNamedFilter<T extends keyof ED>(path: string, filter: NamedFilterItem<ED, T>, refresh?: boolean): void;
    removeNamedFilterByName<T extends keyof ED>(path: string, name: string, refresh?: boolean): void;
    getNamedSorters<T extends keyof ED>(path: string): NamedSorterItem<ED, keyof ED>[];
    getNamedSorterByName<T extends keyof ED>(path: string, name: string): NamedSorterItem<ED, keyof ED> | undefined;
    setNamedSorters<T extends keyof ED>(path: string, sorters: NamedSorterItem<ED, T>[], refresh?: boolean): void;
    addNamedSorter<T extends keyof ED>(path: string, sorter: NamedSorterItem<ED, T>, refresh?: boolean): void;
    removeNamedSorter<T extends keyof ED>(path: string, sorter: NamedSorterItem<ED, T>, refresh?: boolean): void;
    removeNamedSorterByName(path: string, name: string, refresh?: boolean): void;
    tryExecute(path: string): boolean | Error;
    getOperations(path: string): {
        entity: keyof ED;
        operation: ED[keyof ED]["Operation"];
    }[] | undefined;
    execute<T extends keyof ED>(path: string, action?: ED[T]['Action']): Promise<{
        entity: keyof ED;
        operation: ED[keyof ED]["Operation"];
    }[]>;
    clean(path: string): void;
    getRoot(): Record<string, SingleNode<ED, keyof ED, Cxt, FrontCxt, AD> | ListNode<ED, keyof ED, Cxt, FrontCxt, AD> | VirtualNode<ED, Cxt, FrontCxt, AD>>;
    subscribeNode(callback: () => any, path: string): () => void;
}
export {};
