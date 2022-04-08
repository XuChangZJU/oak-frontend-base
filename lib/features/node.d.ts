import { DeduceFilter, DeduceUpdateOperation, EntityDict } from 'oak-domain/lib/types/Entity';
import { Aspect } from 'oak-general-business/lib/types/Aspect';
import { Feature } from '../types/Feature';
import { Cache } from './cache';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { Pagination } from '../types/Pagination';
export declare class Node<ED extends EntityDict, AD extends Record<string, Aspect<ED>>, T extends keyof ED> {
    protected entity: T;
    protected fullPath: string;
    protected schema: StorageSchema<ED>;
    protected projection?: ED[T]['Selection']['data'];
    protected parent?: Node<ED, AD, keyof ED>;
    protected action?: ED[T]['Action'];
    protected dirty?: boolean;
    protected updateData?: DeduceUpdateOperation<ED[T]['OpSchema']>['data'];
    constructor(entity: T, fullPath: string, schema: StorageSchema<ED>, projection?: ED[T]['Selection']['data'], parent?: Node<ED, AD, keyof ED>, action?: ED[T]['Action']);
    getSubEntity(path: string): {
        entity: keyof ED;
        isList: boolean;
    };
    getEntity(): T;
    setUpdateData(attr: string, value: any): void;
    setDirty(): void;
    isDirty(): boolean | undefined;
    getParent(): Node<ED, AD, keyof ED> | undefined;
}
export declare class RunningNode<ED extends EntityDict, AD extends Record<string, Aspect<ED>>> extends Feature<ED, AD> {
    private cache;
    private schema?;
    private root;
    constructor(cache: Cache<ED, AD>);
    createNode<T extends keyof ED>(path: string, parent?: string, entity?: T, isList?: boolean, isPicker?: boolean, projection?: ED[T]['Selection']['data'], id?: string, pagination?: Pagination, filters?: DeduceFilter<ED[T]['Schema']>[], sorter?: ED[T]['Selection']['sorter']): Promise<keyof ED>;
    destroyNode(path: string): Promise<void>;
    refresh(path: string): Promise<void>;
    private applyAction;
    get(path: string): Promise<Partial<ED[keyof ED]["Schema"]>[]>;
    private findNode;
    setUpdateData(path: string, attr: string, value: any): Promise<void>;
    setStorageSchema(schema: StorageSchema<ED>): void;
}
