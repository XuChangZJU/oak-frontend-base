import { EntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/types/Entity';
import { SyncContext, SyncRowStore } from 'oak-domain/lib/store/SyncRowStore';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { CommonAspectDict } from 'oak-common-aspect';
import { Aspect } from 'oak-domain/lib/types';
import { SubScriber } from '../features/subscriber';
import { Environment } from '../features/environment';
import { BriefEnv } from 'oak-domain/lib/types/Environment';
import { BasicFeatures } from '../features';

export type SerializedData = {
    sid?: string;
    be?: BriefEnv;
};

export abstract class FrontendRuntimeContext<
    ED extends EntityDict & BaseEntityDict,
    Cxt extends AsyncContext<ED>,
    AD extends CommonAspectDict<ED, Cxt>  & Record<string, Aspect<ED, Cxt>>
> extends SyncContext<ED> {
    subscriber: SubScriber<ED, Cxt, FrontendRuntimeContext<ED, Cxt, AD>, AD>;
    env: Environment;

    constructor(store: SyncRowStore<ED, FrontendRuntimeContext<ED, Cxt, AD>>, features: BasicFeatures<ED, Cxt, FrontendRuntimeContext<ED, Cxt, AD>, AD>) {
        super(store);
        this.subscriber = features.subscriber;
        this.env = features.environment;
    }

    protected getSerializedData(): SerializedData {
        const sid = this.subscriber.getSubscriberId();
        const be = this.env.getBriefEnv();
        return {
            sid,
            be,            
        };
    }
}