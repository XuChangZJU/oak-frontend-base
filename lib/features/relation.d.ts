import { Feature } from '../types/Feature';
import { EntityDict } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { CommonAspectDict } from 'oak-common-aspect';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { Cache } from './cache';
export declare class Relation<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Feature {
    private cache;
    private relationDict;
    constructor(cache: Cache<ED, Cxt, FrontCxt, AD>, relationDict: {
        [K in keyof ED]?: {
            [R in NonNullable<ED[K]['Relation']>]?: ED[K]['Relation'][];
        };
    });
    getChildrenRelations<T extends keyof ED>(entity: T, userId: string, entityId: string): ED[T]["Relation"][] | undefined;
}
