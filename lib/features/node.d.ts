import { DeduceFilter, DeduceOperation, DeduceUpdateOperation, EntityDict, OpRecord } from 'oak-domain/lib/types/Entity';
import { Aspect, Context } from 'oak-domain/lib/types';
import { Feature } from '../types/Feature';
import { Cache } from './cache';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { Pagination } from '../types/Pagination';
import { NamedFilterItem, NamedSorterItem } from '../types/NamedCondition';
export declare class Node<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>> {
    protected entity: T;
    protected fullPath: string;
    protected schema: StorageSchema<ED>;
    private projection?;
    protected parent?: Node<ED, keyof ED, Cxt, AD>;
    protected action?: ED[T]['Action'];
    protected dirty: boolean;
    protected updateData?: DeduceUpdateOperation<ED[T]['OpSchema']>['data'];
    protected cache: Cache<ED, Cxt, AD>;
    protected needReGetValue: boolean;
    protected refreshing: boolean;
    private refreshFn?;
    constructor(entity: T, fullPath: string, schema: StorageSchema<ED>, cache: Cache<ED, Cxt, AD>, projection?: ED[T]['Selection']['data'] | (() => Promise<ED[T]['Selection']['data']>), parent?: Node<ED, keyof ED, Cxt, AD>, action?: ED[T]['Action']);
    getSubEntity(path: string): {
        entity: keyof ED;
        isList: boolean;
    };
    getEntity(): T;
    setUpdateData(attr: string, value: any): void;
    setDirty(): void;
    isDirty(): boolean;
    getParent(): Node<ED, keyof ED, Cxt, AD> | undefined;
    getProjection(): Promise<ED[T]["Selection"]["data"] | undefined>;
    registerValueSentry(refreshFn: (opRecords: OpRecord<ED>[]) => Promise<void>): void;
    unregisterValueSentry(): void;
}
declare class ListNode<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>> extends Node<ED, T, Cxt, AD> {
    private ids;
    protected children: SingleNode<ED, T, Cxt, AD>[];
    protected value: Array<Partial<ED[T]['Schema']>>;
    private filters;
    private sorters;
    private pagination;
    constructor(entity: T, fullPath: string, schema: StorageSchema<ED>, cache: Cache<ED, Cxt, AD>, projection?: ED[T]['Selection']['data'] | (() => Promise<ED[T]['Selection']['data']>), parent?: Node<ED, keyof ED, Cxt, AD>, pagination?: Pagination, filters?: NamedFilterItem<ED, T>[], sorters?: NamedSorterItem<ED, T>[], action?: ED[T]['Action']);
    composeOperation(action?: string): Promise<DeduceOperation<ED[T]['Schema']> | DeduceOperation<ED[T]['Schema']>[] | undefined>;
    addChild(path: string, node: SingleNode<ED, T, Cxt, AD>): void;
    removeChild(path: string): void;
    getChild(path: string, create?: boolean): Promise<SingleNode<ED, T, Cxt, AD>>;
    getFilters(): NamedFilterItem<ED, T>[];
    setFilters(filters: NamedFilterItem<ED, T>[]): void;
    refresh(): Promise<void>;
    updateChildrenValue(): void;
    reGetValue(): Promise<void>;
    onRecordSynchoronized(records: OpRecord<ED>[]): Promise<void>;
    getValue(): Promise<Partial<ED[T]["Schema"]>[]>;
    setValue(value: Array<Partial<ED[T]['Schema']>>): void;
    resetUpdateData(): void;
    nextPage(): Promise<void>;
    prevPage(): Promise<void>;
}
declare class SingleNode<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>> extends Node<ED, T, Cxt, AD> {
    private id?;
    private value?;
    private children;
    constructor(entity: T, fullPath: string, schema: StorageSchema<ED>, cache: Cache<ED, Cxt, AD>, projection?: ED[T]['Selection']['data'], parent?: Node<ED, keyof ED, Cxt, AD>, id?: string, action?: ED[T]['Action']);
    refresh(): Promise<void>;
    composeOperation(action2?: string): Promise<DeduceOperation<ED[T]['Schema']> | undefined>;
    addChild(path: string, node: Node<ED, keyof ED, Cxt, AD>): void;
    removeChild(path: string): void;
    getChild<Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>>(path: keyof ED[T]['Schema'], create?: boolean, cache?: Cache<ED, Cxt, AD>): Promise<{ [K in keyof ED[T]["Schema"]]?: SingleNode<ED, keyof ED, Cxt, AD> | ListNode<ED, keyof ED, Cxt, AD> | undefined; }[keyof ED[T]["Schema"]]>;
    getFilter(): DeduceFilter<ED[T]["Schema"]>;
    updateChildrenValues(): void;
    reGetValue(): Promise<void>;
    getValue(): Promise<Partial<ED[T]["Schema"]> | undefined>;
    setValue(value: Partial<ED[T]['Schema']>): void;
    resetUpdateData(): void;
    onRecordSynchoronized(records: OpRecord<ED>[]): Promise<void>;
}
export declare class RunningNode<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>> extends Feature<ED, Cxt, AD> {
    private cache;
    private schema?;
    private root;
    constructor(cache: Cache<ED, Cxt, AD>);
    createNode<T extends keyof ED>(path: string, parent?: string, entity?: T, isList?: boolean, isPicker?: boolean, projection?: ED[T]['Selection']['data'] | (() => Promise<ED[T]['Selection']['data']>), id?: string, pagination?: Pagination, filters?: NamedFilterItem<ED, T>[], sorters?: NamedSorterItem<ED, T>[]): Promise<keyof ED>;
    destroyNode(path: string): Promise<void>;
    setStorageSchema(schema: StorageSchema<ED>): void;
    private applyOperation;
    get(path: string): Promise<(Partial<ED[keyof ED]["Schema"]> | undefined)[]>;
    isDirty(path: string): Promise<boolean>;
    private findNode;
    protected setUpdateDataInner(path: string, attr: string, value: any): Promise<void>;
    setUpdateData(path: string, attr: string, value: any): Promise<void>;
    setMultipleData(path: string, data: [string, any][]): Promise<void>;
    refresh(path: string): Promise<void>;
    setFilters<T extends keyof ED>(path: string, filters: NamedFilterItem<ED, T>[], refresh?: boolean): Promise<void>;
    testAction(path: string, action: string): Promise<{
        node: SingleNode<ED, keyof ED, Cxt, AD> | ListNode<ED, keyof ED, Cxt, AD>;
        operation: DeduceOperation<ED[keyof ED]["Schema"]> | DeduceOperation<ED[keyof ED]["Schema"]>[];
    }>;
    execute(path: string, action: string): Promise<void>;
}
export {};
