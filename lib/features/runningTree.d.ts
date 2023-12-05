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
export declare const MODI_NEXT_PATH_SUFFIX = ":next";
declare abstract class Node<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Feature {
    protected entity: T;
    protected schema: StorageSchema<ED>;
    protected projection?: ED[T]['Selection']['data'] | (() => ED[T]['Selection']['data']);
    protected parent?: SingleNode<ED, keyof ED, Cxt, FrontCxt, AD> | ListNode<ED, keyof ED, Cxt, FrontCxt, AD> | VirtualNode<ED, Cxt, FrontCxt, AD>;
    protected dirty?: boolean;
    protected cache: Cache<ED, Cxt, FrontCxt, AD>;
    protected loading: number;
    protected loadingMore: boolean;
    protected executing: boolean;
    protected modiIds: string[] | undefined;
    private actions?;
    private cascadeActions?;
    private relationAuth;
    constructor(entity: T, schema: StorageSchema<ED>, cache: Cache<ED, Cxt, FrontCxt, AD>, relationAuth: RelationAuth<ED, Cxt, FrontCxt, AD>, projection?: ED[T]['Selection']['data'] | (() => Promise<ED[T]['Selection']['data']>), parent?: SingleNode<ED, keyof ED, Cxt, FrontCxt, AD> | ListNode<ED, keyof ED, Cxt, FrontCxt, AD> | VirtualNode<ED, Cxt, FrontCxt, AD>, path?: string, actions?: ActionDef<ED, T>[] | (() => ActionDef<ED, T>[]), cascadeActions?: () => {
        [K in keyof ED[T]['Schema']]?: ActionDef<ED, keyof ED>[];
    });
    getEntity(): T;
    getSchema(): StorageSchema<ED>;
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
    protected setLoading(loading: number): void;
    isLoadingMore(): boolean;
    isExecuting(): boolean;
    setExecuting(executing: boolean): void;
    getParent(): SingleNode<ED, keyof ED, Cxt, FrontCxt, AD> | ListNode<ED, keyof ED, Cxt, FrontCxt, AD> | VirtualNode<ED, Cxt, FrontCxt, AD> | undefined;
    protected getProjection(): ED[T]['Selection']['data'] | undefined;
    setProjection(projection: ED[T]['Selection']['data']): void;
    protected judgeRelation(attr: string): string | 0 | 1 | string[] | 2;
}
declare class ListNode<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Node<ED, T, Cxt, FrontCxt, AD> {
    private updates;
    private children;
    private filters;
    private sorters;
    private getTotal?;
    private pagination;
    private sr;
    private syncHandler;
    setFiltersAndSortedApplied(): void;
    setLoading(loading: number): void;
    setUnloading(loading: number): void;
    startLoading(): void;
    endLoading(): void;
    checkIfClean(): void;
    onCacheSync(records: OpRecord<ED>[]): void;
    destroy(): void;
    constructor(entity: T, schema: StorageSchema<ED>, cache: Cache<ED, Cxt, FrontCxt, AD>, relationAuth: RelationAuth<ED, Cxt, FrontCxt, AD>, projection?: ED[T]['Selection']['data'] | (() => Promise<ED[T]['Selection']['data']>), parent?: SingleNode<ED, keyof ED, Cxt, FrontCxt, AD> | VirtualNode<ED, Cxt, FrontCxt, AD>, path?: string, filters?: NamedFilterItem<ED, T>[], sorters?: NamedSorterItem<ED, T>[], getTotal?: number, pagination?: Pick<Pagination, 'currentPage' | 'pageSize' | 'randomRange'>, actions?: ActionDef<ED, T>[] | (() => ActionDef<ED, T>[]), cascadeActions?: () => {
        [K in keyof ED[T]['Schema']]?: ActionDef<ED, keyof ED>[];
    });
    getPagination(): Pagination;
    setPagination(pagination: Pagination, dontRefresh?: boolean): void;
    addChild(path: string, node: SingleNode<ED, T, Cxt, FrontCxt, AD>): void;
    removeChild(path: string): void;
    getChild(path: string): SingleNode<ED, T, Cxt, FrontCxt, AD>;
    getNamedFilters(): (NamedFilterItem<ED, T> & {
        applied?: boolean | undefined;
    })[];
    getNamedFilterByName(name: string): (NamedFilterItem<ED, T> & {
        applied?: boolean | undefined;
    }) | undefined;
    setNamedFilters(filters: NamedFilterItem<ED, T>[], refresh?: boolean): void;
    addNamedFilter(filter: NamedFilterItem<ED, T>, refresh?: boolean): void;
    removeNamedFilter(filter: NamedFilterItem<ED, T>, refresh?: boolean): void;
    removeNamedFilterByName(name: string, refresh?: boolean): void;
    getNamedSorters(): (NamedSorterItem<ED, T> & {
        applied?: boolean | undefined;
    })[];
    getNamedSorterByName(name: string): (NamedSorterItem<ED, T> & {
        applied?: boolean | undefined;
    }) | undefined;
    setNamedSorters(sorters: NamedSorterItem<ED, T>[], refresh?: boolean): void;
    addNamedSorter(sorter: NamedSorterItem<ED, T>, refresh?: boolean): void;
    removeNamedSorter(sorter: NamedSorterItem<ED, T>, refresh?: boolean): void;
    removeNamedSorterByName(name: string, refresh: boolean): void;
    getFreshValue(): Array<Partial<ED[T]['Schema']>>;
    addItem(item: Omit<ED[T]['CreateSingle']['data'], 'id'>): string;
    removeItem(id: string): void;
    recoverItem(id: string): void;
    resetItem(id: string): void;
    /**
     * 目前只支持根据itemId进行更新
     * @param data
     * @param id
     * @param beforeExecute
     * @param afterExecute
     */
    updateItem(data: ED[T]['Update']['data'], id: string, action?: ED[T]['Action']): void;
    updateItems(data: Record<string, ED[T]['Update']['data']>, action?: ED[T]['Action']): void;
    composeOperations(): Array<{
        entity: keyof ED;
        operation: ED[keyof ED]['Operation'];
    }> | undefined;
    getProjection(): ED[T]["Selection"]["data"] | undefined;
    private constructFilters;
    constructSelection(withParent?: true, ignoreNewParent?: boolean, ignoreUnapplied?: true): {
        data: ED[T]["Selection"]["data"];
        filter: ED[T]["Selection"]["filter"] | undefined;
        sorter: ED[T]["Selection"]["sorter"];
        total: number | undefined;
        indexFrom: number;
        count: number;
    };
    /**
     * 存留查询结果
     */
    saveRefreshResult(sr: Awaited<ReturnType<AD['select']>>, append?: boolean, currentPage?: number): void;
    refresh(pageNumber?: number, append?: boolean): Promise<void>;
    loadMore(): Promise<void>;
    setCurrentPage(currentPage: number, append?: boolean): void;
    clean(): void;
    getIntrinsticFilters(): ED[T]["Selection"]["filter"] | undefined;
}
declare class SingleNode<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Node<ED, T, Cxt, FrontCxt, AD> {
    private id?;
    private sr;
    private children;
    private filters?;
    private operation?;
    constructor(entity: T, schema: StorageSchema<ED>, cache: Cache<ED, Cxt, FrontCxt, AD>, relationAuth: RelationAuth<ED, Cxt, FrontCxt, AD>, projection?: ED[T]['Selection']['data'] | (() => Promise<ED[T]['Selection']['data']>), parent?: SingleNode<ED, keyof ED, Cxt, FrontCxt, AD> | VirtualNode<ED, Cxt, FrontCxt, AD> | ListNode<ED, T, Cxt, FrontCxt, AD>, path?: string, id?: string, filters?: NamedFilterItem<ED, T>[], actions?: ActionDef<ED, T>[] | (() => ActionDef<ED, T>[]), cascadeActions?: () => {
        [K in keyof ED[T]['Schema']]?: ActionDef<ED, keyof ED>[];
    });
    setFiltersAndSortedApplied(): void;
    setLoading(loading: number): void;
    setUnloading(loading: number): void;
    startLoading(): void;
    endLoading(): void;
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
    getFreshValue(): Partial<ED[T]['Schema']> | undefined;
    create(data: Partial<Omit<ED[T]['CreateSingle']['data'], 'id'>>): void;
    update(data: ED[T]['Update']['data'], action?: ED[T]['Action']): void;
    remove(): void;
    setDirty(): void;
    composeOperations(): Array<{
        entity: keyof ED;
        operation: ED[keyof ED]['Operation'];
    }> | undefined;
    getProjection(withDecendants?: boolean): ED[T]["Selection"]["data"] | undefined;
    private passRsToChild;
    saveRefreshResult(data: Record<string, any>): void;
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
    getParentFilter<T2 extends keyof ED>(childNode: ListNode<ED, keyof ED, Cxt, FrontCxt, AD>, ignoreNewParent?: boolean): ED[T2]['Selection']['filter'] | undefined;
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
    clean(): void;
    checkIfClean(): void;
}
export type CreateNodeOptions<ED extends EntityDict & BaseEntityDict, T extends keyof ED> = {
    path: string;
    entity?: T;
    isList?: boolean;
    getTotal?: number;
    projection?: ED[T]['Selection']['data'] | (() => ED[T]['Selection']['data']);
    pagination?: Pick<Pagination, 'currentPage' | 'pageSize' | 'randomRange'>;
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
    createNode<T extends keyof ED>(options: CreateNodeOptions<ED, T>): ListNode<ED, T, Cxt, FrontCxt, AD> | SingleNode<ED, T, Cxt, FrontCxt, AD> | VirtualNode<ED, Cxt, FrontCxt, AD>;
    private checkSingleNodeIsModiNode;
    checkIsModiNode(path: string): boolean;
    private findNode;
    destroyNode(path: string): void;
    getFreshValue(path: string): Partial<ED[keyof ED]["Schema"]> | Partial<ED[keyof ED]["Schema"]>[] | undefined;
    isDirty(path: string): boolean;
    addItem<T extends keyof ED>(path: string, data: Omit<ED[T]['CreateSingle']['data'], 'id'>): string;
    removeItem(path: string, id: string): void;
    updateItem<T extends keyof ED>(path: string, data: ED[T]['Update']['data'], id: string, action?: ED[T]['Action']): void;
    recoverItem(path: string, id: string): void;
    resetItem(path: string, id: string): void;
    create<T extends keyof ED>(path: string, data: Omit<ED[T]['CreateSingle']['data'], 'id'>): void;
    update<T extends keyof ED>(path: string, data: ED[T]['Update']['data'], action?: ED[T]['Action']): void;
    remove(path: string): void;
    isCreation(path: string): boolean;
    isLoading(path: string): boolean | undefined;
    isLoadingMore(path: string): boolean | undefined;
    isExecuting(path: string): boolean;
    isListDescandent(path: string): boolean;
    refresh(path: string): Promise<void>;
    loadMore(path: string): Promise<void>;
    getPagination(path: string): Pagination;
    setId(path: string, id: string): void;
    unsetId(path: string): void;
    getId(path: string): string | undefined;
    getEntity(path: string): keyof ED;
    setPageSize<T extends keyof ED>(path: string, pageSize: number): void;
    setCurrentPage<T extends keyof ED>(path: string, currentPage: number): void;
    getNamedFilters<T extends keyof ED>(path: string): (NamedFilterItem<ED, keyof ED> & {
        applied?: boolean | undefined;
    })[];
    getNamedFilterByName<T extends keyof ED>(path: string, name: string): (NamedFilterItem<ED, keyof ED> & {
        applied?: boolean | undefined;
    }) | undefined;
    setNamedFilters<T extends keyof ED>(path: string, filters: NamedFilterItem<ED, T>[], refresh?: boolean): void;
    addNamedFilter<T extends keyof ED>(path: string, filter: NamedFilterItem<ED, T>, refresh?: boolean): void;
    removeNamedFilter<T extends keyof ED>(path: string, filter: NamedFilterItem<ED, T>, refresh?: boolean): void;
    removeNamedFilterByName<T extends keyof ED>(path: string, name: string, refresh?: boolean): void;
    getNamedSorters<T extends keyof ED>(path: string): (NamedSorterItem<ED, keyof ED> & {
        applied?: boolean | undefined;
    })[];
    getNamedSorterByName<T extends keyof ED>(path: string, name: string): (NamedSorterItem<ED, keyof ED> & {
        applied?: boolean | undefined;
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
}
export {};
