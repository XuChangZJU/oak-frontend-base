import { Aspect, Checker, StorageSchema, Connector, CascadeRemoveDefDict } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { AuthCascadePath, EntityDict } from 'oak-domain/lib/types/Entity';
import { ColorDict } from 'oak-domain/lib/types/Style';
import { ActionDictOfEntityDict } from 'oak-domain/lib/types/Action';
import { CommonAspectDict } from 'oak-common-aspect';
import { CacheStore } from './cacheStore/CacheStore';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
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
export declare function initialize<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends Record<string, Aspect<ED, Cxt>>>(storageSchema: StorageSchema<ED>, frontendContextBuilder: () => (store: CacheStore<ED, FrontCxt>) => FrontCxt, connector: Connector<ED, Cxt, FrontCxt>, checkers?: Array<Checker<ED, keyof ED, FrontCxt | Cxt>>, actionDict?: ActionDictOfEntityDict<ED>, actionCascadePathGraph?: AuthCascadePath<ED>[], relationCascadePathGraph?: AuthCascadePath<ED>[], cascadeRemoveDict?: CascadeRemoveDefDict<ED>, colorDict?: ColorDict<ED>): {
    features: import("./features").BasicFeatures<ED, Cxt, FrontCxt, AD & CommonAspectDict<ED, Cxt>>;
};
