import { EntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/types/Entity';
import { AsyncContext, AsyncRowStore } from 'oak-domain/lib/store/AsyncRowStore';
import { SerializedData } from './FrontendRuntimeContext';
import { BriefEnv } from 'oak-domain/lib/types/Environment';

export abstract class BackendRuntimeContext<ED extends EntityDict & BaseEntityDict> extends AsyncContext<ED> {
    private subscriberId?: string;
    private be?: BriefEnv;

    getSubscriberId() {
        return this.subscriberId;
    }

    getBriefEnvironment() {
        return this.be;
    }

    protected getSerializedData(): SerializedData {
        return {
            sid: this.subscriberId,
            be: this.be,
        }
    }

    async initialize(data?: SerializedData) {
        if (data?.sid) {
            this.subscriberId = data.sid;
        }
        if (data?.be) {
            this.be = data.be;
        }
    }
}