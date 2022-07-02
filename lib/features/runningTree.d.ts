import { EntityDict, Context, DeduceUpdateOperation, StorageSchema, OpRecord, SelectRowShape, DeduceOperation, AspectWrapper } from "oak-domain/lib/types";
import { CommonAspectDict } from 'oak-common-aspect';
import { NamedFilterItem, NamedSorterItem } from "../types/NamedCondition";
import { Cache } from './cache';
import { Pagination } from '../types/Pagination';
import { Feature } from '../types/Feature';
declare abstract class Node<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends CommonAspectDict<ED, Cxt>> {
    protected entity: T;
    protected schema: StorageSchema<ED>;
    protected projection: ED[T]['Selection']['data'] | (() => Promise<ED[T]['Selection']['data']>);
    protected parent?: Node<ED, keyof ED, Cxt, AD>;
    protected action?: ED[T]['Action'];
    protected dirty: boolean;
    protected updateData: DeduceUpdateOperation<ED[T]['OpSchema']>['data'];
    protected cache: Cache<ED, Cxt, AD>;
    protected refreshing: boolean;
    private beforeExecute?;
    private afterExecute?;
    abstract onCachSync(opRecords: OpRecord<ED>[]): Promise<void>;
    abstract refreshValue(): void;
    constructor(entity: T, schema: StorageSchema<ED>, cache: Cache<ED, Cxt, AD>, projection: ED[T]['Selection']['data'] | (() => Promise<ED[T]['Selection']['data']>), parent?: Node<ED, keyof ED, Cxt, AD>, action?: ED[T]['Action'], updateData?: DeduceUpdateOperation<ED[T]['OpSchema']>['data']);
    getEntity(): T;
    protected abstract setForeignKey(attr: string, entity: keyof ED, id: string | undefined): void;
    private setLocalUpdateData;
    setUpdateData(attr: string, value: any): void;
    getUpdateData(): import("oak-domain/lib/types").DeduceUpdateOperationData<ED[T]["OpSchema"]>;
    setMultiUpdateData(updateData: DeduceUpdateOperation<ED[T]['OpSchema']>['data']): void;
    setDirty(): void;
    setAction(action: ED[T]['Action']): void;
    isDirty(): boolean;
    getParent(): Node<ED, keyof ED, Cxt, AD> | undefined;
    getProjection(): Promise<ED[T]["Selection"]["data"]>;
    setBeforeExecute(_beforeExecute?: (updateData: DeduceUpdateOperation<ED[T]['OpSchema']>['data'], action: ED[T]['Action']) => Promise<void>): void;
    setAfterExecute(_afterExecute?: (updateData: DeduceUpdateOperation<ED[T]['OpSchema']>['data'], action: ED[T]['Action']) => Promise<void>): void;
    getBeforeExecute(): ((updateData: import("oak-domain/lib/types").DeduceUpdateOperationData<ED[T]["OpSchema"]>, action: ED[T]["Action"]) => Promise<void>) | undefined;
    getAfterExecute(): ((updateData: import("oak-domain/lib/types").DeduceUpdateOperationData<ED[T]["OpSchema"]>, action: ED[T]["Action"]) => Promise<void>) | undefined;
    destroy(): void;
    protected judgeRelation(attr: string): string | 0 | 1 | 2 | string[];
    protected contains(filter: ED[T]['Selection']['filter'], conditionalFilter: ED[T]['Selection']['filter']): boolean;
    protected repel(filter1: ED[T]['Selection']['filter'], filter2: ED[T]['Selection']['filter']): boolean;
}
declare class ListNode<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Node<ED, T, Cxt, AD> {
    private children;
    private newBorn;
    private filters;
    private sorters;
    private pagination;
    private projectionShape;
    onCachSync(records: OpRecord<ED>[]): Promise<void>;
    setForeignKey(attr: string, entity: keyof ED, id: string | undefined): Promise<void>;
    refreshValue(): void;
    constructor(entity: T, schema: StorageSchema<ED>, cache: Cache<ED, Cxt, AD>, projection: ED[T]['Selection']['data'] | (() => Promise<ED[T]['Selection']['data']>), projectionShape: ED[T]['Selection']['data'], parent?: Node<ED, keyof ED, Cxt, AD>, action?: ED[T]['Action'], updateData?: DeduceUpdateOperation<ED[T]['OpSchema']>['data'], filters?: NamedFilterItem<ED, T>[], sorters?: NamedSorterItem<ED, T>[], pagination?: Pagination);
    getChild(path: string): SingleNode<ED, T, Cxt, AD>;
    getChildren(): SingleNode<ED, T, Cxt, AD>[];
    getNewBorn(): SingleNode<ED, T, Cxt, AD>[];
    removeChild(path: string): void;
    setValue(value: SelectRowShape<ED[T]['OpSchema'], ED[T]['Selection']['data']>[] | undefined): void;
    private appendValue;
    getNamedFilters(): NamedFilterItem<ED, T>[];
    getNamedFilterByName(name: string): NamedFilterItem<ED, T> | undefined;
    setNamedFilters(filters: NamedFilterItem<ED, T>[]): void;
    addNamedFilter(filter: NamedFilterItem<ED, T>): void;
    removeNamedFilter(filter: NamedFilterItem<ED, T>): void;
    removeNamedFilterByName(name: string): void;
    getNamedSorters(): NamedSorterItem<ED, T>[];
    getNamedSorterByName(name: string): NamedSorterItem<ED, T> | undefined;
    setNamedSorters(sorters: NamedSorterItem<ED, T>[]): void;
    addNamedSorter(sorter: NamedSorterItem<ED, T>): void;
    removeNamedSorter(sorter: NamedSorterItem<ED, T>): void;
    removeNamedSorterByName(name: string): void;
    getFreshValue(): Array<SelectRowShape<ED[T]['Schema'], ED[T]['Selection']['data']> | undefined>;
    getAction(): "update" | ED[T]["Action"];
    composeOperation(action?: string, execute?: boolean): Promise<DeduceOperation<ED[T]['Schema']> | DeduceOperation<ED[T]['Schema']>[] | undefined>;
    refresh(): Promise<void>;
    loadMore(): Promise<void>;
    resetUpdateData(): void;
    pushNewBorn(options: Pick<CreateNodeOptions<ED, T>, 'updateData' | 'beforeExecute' | 'afterExecute'>): SingleNode<ED, T, Cxt, AD>;
    popNewBorn(path: string): void;
    /**
     * 判断传入的updateData和当前的某项是否相等
     * @param from 当前项
     * @param to 传入项
     * @returns
     */
    private judgeTheSame;
    setUniqueChildren(data: Pick<CreateNodeOptions<ED, T>, 'updateData' | 'beforeExecute' | 'afterExecute'>[]): void;
    toggleChild(data: Pick<CreateNodeOptions<ED, T>, 'updateData' | 'beforeExecute' | 'afterExecute'>, checked: boolean): void;
}
declare class SingleNode<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Node<ED, T, Cxt, AD> {
    private id?;
    private value?;
    private freshValue?;
    private children;
    onCachSync(records: OpRecord<ED>[]): Promise<void>;
    constructor(entity: T, schema: StorageSchema<ED>, cache: Cache<ED, Cxt, AD>, projection: ED[T]['Selection']['data'] | (() => Promise<ED[T]['Selection']['data']>), projectionShape: ED[T]['Selection']['data'], parent?: Node<ED, keyof ED, Cxt, AD>, action?: ED[T]['Action'], updateData?: DeduceUpdateOperation<ED[T]['OpSchema']>['data']);
    getChild(path: string): SingleNode<ED, keyof ED, Cxt, AD> | ListNode<ED, keyof ED, Cxt, AD>;
    getChildren(): {
        [K: string]: SingleNode<ED, keyof ED, Cxt, AD> | ListNode<ED, keyof ED, Cxt, AD>;
    };
    removeChild(path: string): void;
    refreshValue(): void;
    setValue(value: SelectRowShape<ED[T]['OpSchema'], ED[T]['Selection']['data']> | undefined): void;
    getFreshValue(ignoreRemoved?: boolean): (SelectRowShape<ED[T]["OpSchema"], ED[T]["Selection"]["data"]> & Partial<Omit<ED[T]["OpSchema"], import("oak-domain/lib/types").InstinctiveAttributes>> & {
        [k: string]: any;
    }) | SelectRowShape<ED[T]["Schema"], ED[T]["Selection"]["data"]> | undefined;
    getAction(): "create" | "update" | ED[T]["Action"];
    composeOperation(action2?: string, execute?: boolean): Promise<import("oak-domain/lib/types").DeduceCreateMultipleOperation<ED[T]["Schema"]> | DeduceUpdateOperation<ED[T]["Schema"]> | undefined>;
    refresh(scene: string): Promise<void>;
    resetUpdateData(attrs?: string[]): void;
    setForeignKey(attr: string, entity: keyof ED, id: string | undefined): Promise<void>;
}
export declare type CreateNodeOptions<ED extends EntityDict, T extends keyof ED> = {
    path: string;
    parent?: string;
    entity: T;
    isList?: boolean;
    isPicker?: boolean;
    projection: ED[T]['Selection']['data'] | (() => Promise<ED[T]['Selection']['data']>);
    pagination?: Pagination;
    filters?: NamedFilterItem<ED, T>[];
    sorters?: NamedSorterItem<ED, T>[];
    action?: ED[T]['Action'];
    id?: string;
    ids?: string[];
    updateData?: DeduceUpdateOperation<ED[T]['OpSchema']>['data'];
    beforeExecute?: (updateData: DeduceUpdateOperation<ED[T]['OpSchema']>['data'], action: ED[T]['Action']) => Promise<void>;
    afterExecute?: (updateData: DeduceUpdateOperation<ED[T]['OpSchema']>['data'], action: ED[T]['Action']) => Promise<void>;
};
export declare class RunningTree<ED extends EntityDict, Cxt extends Context<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Feature<ED, Cxt, AD> {
    private cache;
    private schema;
    private root;
    constructor(aspectWrapper: AspectWrapper<ED, Cxt, AD>, cache: Cache<ED, Cxt, AD>, schema: StorageSchema<ED>);
    createNode<T extends keyof ED>(options: CreateNodeOptions<ED, T>): Promise<ListNode<ED, T, Cxt, AD> | SingleNode<ED, T, Cxt, AD>>;
    private findNode;
    destroyNode(path: string): void;
    private applyOperation;
    getFreshValue(path: string): (SelectRowShape<ED[keyof ED]["OpSchema"], ED[keyof ED]["Selection"]["data"]> & Partial<Omit<ED[keyof ED]["OpSchema"], import("oak-domain/lib/types").InstinctiveAttributes>> & {
        [k: string]: any;
    }) | SelectRowShape<ED[keyof ED]["Schema"], ED[keyof ED]["Selection"]["data"]> | (SelectRowShape<ED[keyof ED]["Schema"], ED[keyof ED]["Selection"]["data"]> | undefined)[] | undefined;
    isDirty(path: string): boolean;
    private setUpdateDataInner;
    setUpdateData(path: string, attr: string, value: any): Promise<void>;
    setAction<T extends keyof ED>(path: string, action: ED[T]['Action']): Promise<void>;
    setForeignKey(parent: string, attr: string, id: string | undefined): void;
    addForeignKeys(parent: string, attr: string, ids: string[]): void;
    setUniqueForeignKeys(parent: string, attr: string, ids: string[]): void;
    refresh(path: string): Promise<void>;
    loadMore(path: string): Promise<void>;
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
    removeNamedSorterByName<T extends keyof ED>(path: string, name: string, refresh?: boolean): Promise<void>;
    testAction(path: string, action?: string, execute?: boolean): Promise<{
        node: SingleNode<ED, keyof ED, Cxt, AD> | ListNode<ED, keyof ED, Cxt, AD>;
        operation: DeduceOperation<ED[keyof ED]["Schema"]> | DeduceOperation<ED[keyof ED]["Schema"]>[];
    }>;
    private beforeExecute;
    execute(path: string, action?: string): Promise<DeduceOperation<ED[keyof ED]["Schema"]> | DeduceOperation<ED[keyof ED]["Schema"]>[]>;
    pushNode<T extends keyof ED>(path: string, options: Pick<CreateNodeOptions<ED, T>, 'updateData' | 'beforeExecute' | 'afterExecute'>): void;
    removeNode(parent: string, path: string): Promise<void>;
    resetUpdateData(path: string): void;
    toggleNode(path: string, nodeData: Record<string, any>, checked: boolean): void;
}
export {};
