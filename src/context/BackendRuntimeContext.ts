import { EntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/types/Entity';
import { AsyncContext, AsyncRowStore } from 'oak-domain/lib/store/AsyncRowStore';
import { SerializedData } from './FrontendRuntimeContext';
import { IncomingHttpHeaders } from 'http';

export abstract class BackendRuntimeContext<ED extends EntityDict & BaseEntityDict> extends AsyncContext<ED> {
    private subscriberId?: string;

    constructor(store: AsyncRowStore<ED, BackendRuntimeContext<ED>>, data?: SerializedData, headers?: IncomingHttpHeaders) {
        super(store, headers);
        if (data) {
            this.subscriberId = data.sid;
        }
    }

    getSubscriberId() {
        return this.subscriberId;
    }

    protected getSerializedData(): SerializedData {
        return {
            sid: this.subscriberId,
        }
    }

    protected async initialized() {
    }
}