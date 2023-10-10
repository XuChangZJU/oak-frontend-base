import { EntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/types/Entity';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { SerializedData } from './FrontendRuntimeContext';
export declare abstract class BackendRuntimeContext<ED extends EntityDict & BaseEntityDict> extends AsyncContext<ED> {
    private subscriberId?;
    getSubscriberId(): string | undefined;
    protected getSerializedData(): SerializedData;
    initialize(data?: SerializedData): Promise<void>;
}
