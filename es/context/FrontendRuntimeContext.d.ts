import { EntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/types/Entity';
import { SyncContext, SyncRowStore } from 'oak-domain/lib/store/SyncRowStore';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { CommonAspectDict } from 'oak-common-aspect';
import { Aspect } from 'oak-domain/lib/types';
import { SubScriber } from '../features/subscriber';
import { BasicFeatures } from '../features';
export type SerializedData = {
    sid?: string;
};
export declare abstract class FrontendRuntimeContext<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>, AD extends CommonAspectDict<ED, Cxt> & Record<string, Aspect<ED, Cxt>>> extends SyncContext<ED> {
    subscriber: SubScriber<ED, Cxt, FrontendRuntimeContext<ED, Cxt, AD>, AD>;
    constructor(store: SyncRowStore<ED, FrontendRuntimeContext<ED, Cxt, AD>>, features: BasicFeatures<ED, Cxt, FrontendRuntimeContext<ED, Cxt, AD>, AD>);
    protected getSerializedData(): SerializedData;
}
