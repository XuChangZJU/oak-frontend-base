import { EntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/types/Entity';
import { AsyncContext, AsyncRowStore } from 'oak-domain/lib/store/AsyncRowStore';
import { SerializedData } from './FrontendRuntimeContext';

export abstract class BackendRuntimeContext<ED extends EntityDict & BaseEntityDict> extends AsyncContext<ED> {
    private subscriberId?: string;

    getSubscriberId() {
        return this.subscriberId;
    }

    protected getSerializedData(): SerializedData {
        return {
            sid: this.subscriberId,
        }
    }

    async initialize(data?: SerializedData) {
        if (data?.sid) {
            this.subscriberId = data.sid;
        }
    }
}