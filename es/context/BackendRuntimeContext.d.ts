/// <reference types="node" />
import { EntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/types/Entity';
import { AsyncContext, AsyncRowStore } from 'oak-domain/lib/store/AsyncRowStore';
import { SerializedData } from './FrontendRuntimeContext';
import { IncomingHttpHeaders } from 'http';
export declare abstract class BackendRuntimeContext<ED extends EntityDict & BaseEntityDict> extends AsyncContext<ED> {
    private subscriberId?;
    constructor(store: AsyncRowStore<ED, BackendRuntimeContext<ED>>, data?: SerializedData, headers?: IncomingHttpHeaders);
    getSubscriberId(): string | undefined;
    protected getSerializedData(): SerializedData;
    protected initialized(): Promise<void>;
}
