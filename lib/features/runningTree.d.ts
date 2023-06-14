import { EntityDict, StorageSchema, OpRecord } from "oak-domain/lib/types";
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { CommonAspectDict } from 'oak-common-aspect';
import { NamedFilterItem, NamedSorterItem } from "../types/NamedCondition";
import { Cache } from './cache';
import { Pagination } from '../types/Pagination';
import { Feature } from '../types/Feature';
import { ActionDef } from '../types/Page';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { RelationAuth } from './relationAuth';
declare abstract class Node<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Feature {
    protected entity: T;
    protected schema: StorageSchema<ED>;
    protected projection?: ED[T]['Selection']['data'] | (() => ED[T]['Selection']['data']);
    protected parent?: SingleNode<ED, keyof ED, Cxt, FrontCxt, AD> | ListNode<ED, T, Cxt, FrontCxt, AD> | VirtualNode<ED, Cxt, FrontCxt, AD>;
    protected dirty?: boolean;
    protected cache: Cache<ED, Cxt, FrontCxt, AD>;
    protected loading: boolean;
    protected loadingMore: boolean;
    protected executing: boolean;
    protected modiIds: string[] | undefined;
    private actions?;
    private cascadeActions?;
    private relationAuth;
    constructor(entity: T, schema: StorageSchema<ED>, cache: Cache<ED, Cxt, FrontCxt, AD>, relationAuth: RelationAuth<ED, Cxt, FrontCxt, AD>, projection?: ED[T]['Selection']['data'] | (() => Promise<ED[T]['Selection']['data']>), parent?: SingleNode<ED, keyof ED, Cxt, FrontCxt, AD> | ListNode<ED, T, Cxt, FrontCxt, AD> | VirtualNode<ED, Cxt, FrontCxt, AD>, path?: string, actions?: ActionDef<ED, T>[] | (() => ActionDef<ED, T>[]), cascadeActions?: () => {
        [K in keyof ED[T]['Schema']]?: ActionDef<ED, keyof ED>[];
    });
    getEntity(): T;
    getSchema(): StorageSchema<ED>;
    protected abstract getChildPath(child: Node<ED, keyof ED, Cxt, FrontCxt, AD>): string;
    abstract doBeforeTrigger(): Promise<void>;
    abstract doAfterTrigger(): Promise<void>;
    abstract checkIfClean(): void;
    /**
     * 这个函数从某个结点向父亲查询，看所在路径上是否有需要被应用的modi
     */
    getActiveModiOperations(): Array<{
        entity: keyof ED;
        operation: ED[keyof ED]['Operation'];
    }> | undefined;
    setDirty(): void;
    isDirty(): boolean;
    isLoading(): boolean;
    protected setLoading(loading: boolean): void;
    isLoadingMore(): boolean;
    isExecuting(): boolean;
    setExecuting(executing: boolean): void;
    getParent(): SingleNode<ED, keyof ED, Cxt, FrontCxt, AD> | ListNode<ED, T, Cxt, FrontCxt, AD> | VirtualNode<ED, Cxt, FrontCxt, AD> | undefined;
    protected getProjection(context?: FrontCxt): ED[T]['Selection']['data'] | undefined;
    setProjection(projection: ED[T]['Selection']['data']): void;
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
    private aggr?;
    private syncHandler;
    getChildPath(child: SingleNode<ED, T, Cxt, FrontCxt, AD>): string;
    setFiltersAndSortedApplied(): void;
    checkIfClean(): void;
    onCacheSync(records: OpRecord<ED>[]): void;
    destroy(): void;
    constructor(entity: T, schema: StorageSchema<ED>, cache: Cache<ED, Cxt, FrontCxt, AD>, relationAuth: RelationAuth<ED, Cxt, FrontCxt, AD>, projection?: ED[T]['Selection']['data'] | (() => Promise<ED[T]['Selection']['data']>), parent?: SingleNode<ED, keyof ED, Cxt, FrontCxt, AD> | VirtualNode<ED, Cxt, FrontCxt, AD>, path?: string, filters?: NamedFilterItem<ED, T>[], sorters?: NamedSorterItem<ED, T>[], pagination?: Pagination, actions?: ActionDef<ED, T>[] | (() => ActionDef<ED, T>[]), cascadeActions?: () => {
        [K in keyof ED[T]['Schema']]?: ActionDef<ED, keyof ED>[];
    });
    getPagination(): Pagination;
    setPagination(pagination: Pagination, dontRefresh?: boolean): void;
    getChild(path: string): SingleNode<ED, T, Cxt, FrontCxt, AD> | undefined;
    getChildren(): Record<string, SingleNode<ED, T, Cxt, FrontCxt, AD>>;
    addChild(path: string, node: SingleNode<ED, T, Cxt, FrontCxt, AD>): void;
    removeChild(path: string): void;
    getNamedFilters(): (NamedFilterItem<ED, T> & {
        applied?: true | undefined;
    })[];
    getNamedFilterByName(name: string): (NamedFilterItem<ED, T> & {
        applied?: true | undefined;
    }) | undefined;
    setNamedFilters(filters: NamedFilterItem<ED, T>[], refresh?: boolean): void;
    addNamedFilter(filter: NamedFilterItem<ED, T>, refresh?: boolean): void;
    removeNamedFilter(filter: NamedFilterItem<ED, T>, refresh?: boolean): void;
    removeNamedFilterByName(name: string, refresh?: boolean): void;
    getNamedSorters(): (NamedSorterItem<ED, T> & {
        applied?: true | undefined;
    })[];
    getNamedSorterByName(name: string): (NamedSorterItem<ED, T> & {
        applied?: true | undefined;
    }) | undefined;
    setNamedSorters(sorters: NamedSorterItem<ED, T>[], refresh?: boolean): void;
    addNamedSorter(sorter: NamedSorterItem<ED, T>, refresh?: boolean): void;
    removeNamedSorter(sorter: NamedSorterItem<ED, T>, refresh?: boolean): void;
    removeNamedSorterByName(name: string, refresh: boolean): void;
    getFreshValue(context: FrontCxt): Array<Partial<ED[T]['Schema']>>;
    addItem(item: Omit<ED[T]['CreateSingle']['data'], 'id'>, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>): void;
    removeItem(id: string, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>): void;
    recoverItem(id: string): void;
    resetItem(id: string): void;
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
        entity: keyof ED;
        operation: ED[keyof ED]['Operation'];
    }> | undefined;
    getProjection(context?: FrontCxt): ED[T]["Selection"]["data"] | undefined;
    private constructFilters;
    constructSelection(withParent?: true, context?: FrontCxt, ignoreUnapplied?: true): {
        data: ED[T]["Selection"]["data"];
        filter: ED[T]["Selection"]["filter"] | undefined;
        sorter: ED[T]["Selection"]["sorter"];
    };
    refresh(pageNumber?: number, getCount?: true, append?: boolean): Promise<void>;
    loadMore(): Promise<void>;
    setCurrentPage(currentPage: number, append?: boolean): void;
    clean(): void;
    getChildOperation(child: SingleNode<ED, T, Cxt, FrontCxt, AD>): ED[T]["CreateSingle"] | ED[T]["Update"] | ED[T]["Remove"] | undefined;
    getIntrinsticFilters(): ED[T]["Selection"]["filter"] | undefined;
}
declare class SingleNode<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Node<ED, T, Cxt, FrontCxt, AD> {
    private id?;
    private aggr?;
    private children;
    private filters?;
    private operation?;
    constructor(entity: T, schema: StorageSchema<ED>, cache: Cache<ED, Cxt, FrontCxt, AD>, relationAuth: RelationAuth<ED, Cxt, FrontCxt, AD>, projection?: ED[T]['Selection']['data'] | (() => Promise<ED[T]['Selection']['data']>), parent?: SingleNode<ED, keyof ED, Cxt, FrontCxt, AD> | ListNode<ED, T, Cxt, FrontCxt, AD> | VirtualNode<ED, Cxt, FrontCxt, AD>, path?: string, id?: string, filters?: NamedFilterItem<ED, T>[], actions?: ActionDef<ED, T>[] | (() => ActionDef<ED, T>[]), cascadeActions?: () => {
        [K in keyof ED[T]['Schema']]?: ActionDef<ED, keyof ED>[];
    });
    protected getChildPath(child: Node<ED, keyof ED, Cxt, FrontCxt, AD>): string;
    setFiltersAndSortedApplied(): void;
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
    getFreshValue(context?: FrontCxt): Partial<ED[T]['Schema']> | undefined;
    doBeforeTrigger(): Promise<void>;
    doAfterTrigger(): Promise<void>;
    create(data: Partial<Omit<ED[T]['CreateSingle']['data'], 'id'>>, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>): void;
    update(data: ED[T]['Update']['data'], action?: ED[T]['Action'], beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>): void;
    remove(beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>): void;
    composeOperations(): Array<{
        entity: keyof ED;
        operation: ED[keyof ED]['Operation'];
    }> | undefined;
    getProjection(context?: FrontCxt, withDecendants?: boolean): ED[T]["Selection"]["data"] | undefined;
    refresh(): Promise<void>;
    clean(): void;
    private getFilter;
    getIntrinsticFilters(): ED[T]["Selection"]["filter"] | undefined;
    /**
     * getParentFilter不能假设一定已经有数据，只能根据当前filter的条件去构造
     * @param childNode
     * @param disableOperation
     * @returns
     */
    getParentFilter<T2 extends keyof ED>(childNode: Node<ED, keyof ED, Cxt, FrontCxt, AD>, context?: FrontCxt): ED[T2]['Selection']['filter'] | undefined;
}
declare class VirtualNode<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Feature {
    private dirty;
    private executing;
    private loading;
    private children;
    constructor(path?: string, parent?: VirtualNode<ED, Cxt, FrontCxt, AD>);
    getActiveModies(child: any): undefined;
    setDirty(): void;
    setFiltersAndSortedApplied(): void;
    addChild(path: string, child: SingleNode<ED, keyof ED, Cxt, FrontCxt, AD> | ListNode<ED, keyof ED, Cxt, FrontCxt, AD> | VirtualNode<ED, Cxt, FrontCxt, AD>): void;
    getChild(path: string): VirtualNode<ED, Cxt, FrontCxt, AD> | SingleNode<ED, keyof ED, Cxt, FrontCxt, AD> | ListNode<ED, keyof ED, Cxt, FrontCxt, AD>;
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
    isExecuting(): boolean;
    isLoading(): boolean;
    doBeforeTrigger(): Promise<void>;
    doAfterTrigger(): Promise<void>;
    clean(): void;
    checkIfClean(): void;
}
export declare type CreateNodeOptions<ED extends EntityDict & BaseEntityDict, T extends keyof ED> = {
    path: string;
    entity?: T;
    isList?: boolean;
    projection?: ED[T]['Selection']['data'] | (() => ED[T]['Selection']['data']);
    pagination?: Pagination;
    filters?: NamedFilterItem<ED, T>[];
    sorters?: NamedSorterItem<ED, T>[];
    beforeExecute?: (operations: ED[T]['Operation'][]) => Promise<void>;
    afterExecute?: (operations: ED[T]['Operation'][]) => Promise<void>;
    id?: string;
    actions?: ActionDef<ED, T>[] | (() => ActionDef<ED, T>[]);
    cascadeActions?: () => {
        [K in keyof ED[T]['Schema']]?: ActionDef<ED, keyof ED>[];
    };
};
export declare class RunningTree<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Feature {
    private cache;
    private schema;
    private root;
    private relationAuth;
    constructor(cache: Cache<ED, Cxt, FrontCxt, AD>, schema: StorageSchema<ED>, relationAuth: RelationAuth<ED, Cxt, FrontCxt, AD>);
    createNode<T extends keyof ED>(options: CreateNodeOptions<ED, T>): SingleNode<ED, keyof ED, Cxt, FrontCxt, AD> | ListNode<ED, keyof ED, Cxt, FrontCxt, AD> | VirtualNode<ED, Cxt, FrontCxt, AD>;
    private findNode;
    destroyNode(path: string): void;
    getFreshValue(path: string): Partial<ED[keyof ED]["Schema"]> | Partial<ED[keyof ED]["Schema"]>[] | undefined;
    isDirty(path: string): boolean;
    addItem<T extends keyof ED>(path: string, data: Omit<ED[T]['CreateSingle']['data'], 'id'>, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>): void;
    removeItem(path: string, id: string, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>): void;
    updateItem<T extends keyof ED>(path: string, data: ED[T]['Update']['data'], id: string, action?: ED[T]['Action'], beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>): void;
    recoverItem(path: string, id: string): void;
    resetItem(path: string, id: string): void;
    create<T extends keyof ED>(path: string, data: Omit<ED[T]['CreateSingle']['data'], 'id'>, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>): void;
    update<T extends keyof ED>(path: string, data: ED[T]['Update']['data'], action?: ED[T]['Action'], beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>): void;
    remove(path: string, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>): void;
    isLoading(path: string): boolean | undefined;
    isLoadingMore(path: string): boolean | undefined;
    isExecuting(path: string): boolean;
    refresh(path: string): Promise<void>;
    loadMore(path: string): Promise<void>;
    getPagination(path: string): Pagination;
    setId(path: string, id: string): void;
    unsetId(path: string): void;
    getId(path: string): string | undefined;
    setPageSize<T extends keyof ED>(path: string, pageSize: number): void;
    setCurrentPage<T extends keyof ED>(path: string, currentPage: number): void;
    getNamedFilters<T extends keyof ED>(path: string): (NamedFilterItem<ED, keyof ED> & {
        applied?: true | undefined;
    })[];
    getNamedFilterByName<T extends keyof ED>(path: string, name: string): (NamedFilterItem<ED, keyof ED> & {
        applied?: true | undefined;
    }) | undefined;
    setNamedFilters<T extends keyof ED>(path: string, filters: NamedFilterItem<ED, T>[], refresh?: boolean): void;
    addNamedFilter<T extends keyof ED>(path: string, filter: NamedFilterItem<ED, T>, refresh?: boolean): void;
    removeNamedFilter<T extends keyof ED>(path: string, filter: NamedFilterItem<ED, T>, refresh?: boolean): void;
    removeNamedFilterByName<T extends keyof ED>(path: string, name: string, refresh?: boolean): void;
    getNamedSorters<T extends keyof ED>(path: string): (NamedSorterItem<ED, keyof ED> & {
        applied?: true | undefined;
    })[];
    getNamedSorterByName<T extends keyof ED>(path: string, name: string): (NamedSorterItem<ED, keyof ED> & {
        applied?: true | undefined;
    }) | undefined;
    setNamedSorters<T extends keyof ED>(path: string, sorters: NamedSorterItem<ED, T>[], refresh?: boolean): void;
    addNamedSorter<T extends keyof ED>(path: string, sorter: NamedSorterItem<ED, T>, refresh?: boolean): void;
    removeNamedSorter<T extends keyof ED>(path: string, sorter: NamedSorterItem<ED, T>, refresh?: boolean): void;
    removeNamedSorterByName(path: string, name: string, refresh?: boolean): void;
    getIntrinsticFilters(path: string): ED[keyof ED]["Selection"]["filter"] | undefined;
    tryExecute(path: string): boolean | Error;
    getOperations(path: string): {
        entity: keyof ED;
        operation: ED[keyof ED]["Operation"];
    }[] | undefined;
    execute<T extends keyof ED>(path: string, action?: ED[T]['Action']): Promise<{
        result: Awaited<ReturnType<AD["operate"]>>;
        message: string | null | undefined;
    } | {
        message: string;
    }>;
    clean(path: string): void;
    getRoot(): Record<string, SingleNode<ED, keyof ED, Cxt, FrontCxt, AD> | ListNode<ED, keyof ED, Cxt, FrontCxt, AD> | VirtualNode<ED, Cxt, FrontCxt, AD>>;
    subscribeNode(callback: (path: string) => any, path: string): () => void;
}
export {};
