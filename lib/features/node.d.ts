import { DeduceUpdateOperation, EntityDict } from 'oak-domain/lib/types/Entity';
import { Aspect } from 'oak-domain/lib/types/Aspect';
import { Cache } from './cache';
export declare class Node<ED extends EntityDict, AD extends Record<string, Aspect<ED>>, T extends keyof ED> {
    protected entity: T;
    protected projection: ED[T]['Selection']['data'];
    protected cache: Cache<ED, AD>;
    private parent?;
    protected updateData?: DeduceUpdateOperation<ED[T]['OpSchema']>;
    constructor(entity: T, projection: ED[T]['Selection']['data'], cache: Cache<ED, AD>, parent?: Node<ED, AD, keyof ED>);
}
