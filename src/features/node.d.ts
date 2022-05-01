import { DeduceFilter, DeduceUpdateOperation, EntityDict, OpRecord } from 'oak-domain/lib/types/Entity';
import { Aspect, Context } from 'oak-domain/lib/types';
import { Feature } from '../types/Feature';
import { Cache } from './cache';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { Pagination } from '../types/Pagination';
export declare class Node<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>> {
    protected entity: T;
    protected fullPath: string;
    protected schema: StorageSchema<ED>;
    protected projection?: ED[T]['Selection']['data'];
    protected parent?: Node<ED, keyof ED, Cxt, AD>;
    protected action?: ED[T]['Action'];
    protected dirty: boolean;
    protected updateData?: DeduceUpdateOperation<ED[T]['OpSchema']>['data'];
    protected cache: Cache<ED, Cxt, AD>;
    protected needReGetValue: boolean;
    protected refreshing: boolean;
    private refreshFn?;
    constructor(entity: T, fullPath: string, schema: StorageSchema<ED>, cache: Cache<ED, Cxt, AD>, projection?: ED[T]['Selection']['data'], parent?: Node<ED, keyof ED, Cxt, AD>, action?: ED[T]['Action']);
    getSubEntity(path: string): {
        entity: keyof ED;
        isList: boolean;
    };
    getEntity(): T;
    setUpdateData(attr: string, value: any): void;
    setDirty(): void;
    isDirty(): boolean;
    getParent(): Node<ED, keyof ED, Cxt, AD> | undefined;
    getProjection(): NonNullable<ED[T]["Selection"]["data"]>;
    registerValueSentry(refreshFn: (opRecords: OpRecord<ED>[]) => Promise<void>): void;
    unregisterValueSentry(): void;
}
export declare class RunningNode<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>> extends Feature<ED, Cxt, AD> {
    private cache;
    private schema?;
    private root;
    constructor(cache: Cache<ED, Cxt, AD>);
    createNode<T extends keyof ED>(path: string, parent?: string, entity?: T, isList?: boolean, isPicker?: boolean, projection?: ED[T]['Selection']['data'], id?: string, pagination?: Pagination, filters?: ED[T]['Selection']['filter'][], sorter?: ED[T]['Selection']['sorter']): Promise<keyof ED>;
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
    setFilters<T extends keyof ED>(path: string, filters: DeduceFilter<ED[T]['Schema']>[], refresh?: boolean): Promise<void>;
    execute(path: string, action?: string, isTry?: boolean): Promise<void>;
}
