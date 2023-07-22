import { Aspect, Checker, StorageSchema, Connector } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { CommonAspectDict } from 'oak-common-aspect';
import { CacheStore } from './cacheStore/CacheStore';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import { InitializeOptions } from './types/Initialize';
/**
 * @param storageSchema
 * @param createFeatures
 * @param contextBuilder
 * @param context
 * @param triggers
 * @param checkers
 * @param watchers
 * @param aspectDict
 * @param initialData
 * @param actionDict
 * @returns
 */
export declare function initialize<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends Record<string, Aspect<ED, Cxt>>>(storageSchema: StorageSchema<ED>, frontendContextBuilder: () => (store: CacheStore<ED, FrontCxt>) => FrontCxt, connector: Connector<ED, Cxt, FrontCxt>, checkers: Array<Checker<ED, keyof ED, FrontCxt | Cxt>>, option: InitializeOptions<ED>): {
    features: import("./features").BasicFeatures<ED, Cxt, FrontCxt, CommonAspectDict<ED, Cxt> & AD>;
};
