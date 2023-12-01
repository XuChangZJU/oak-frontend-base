import { EntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/types/Entity';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { SerializedData } from './FrontendRuntimeContext';
import { BriefEnv } from 'oak-domain/lib/types/Environment';
export declare abstract class BackendRuntimeContext<ED extends EntityDict & BaseEntityDict> extends AsyncContext<ED> {
    private subscriberId?;
    private be?;
    private ns?;
    getNavigatorState(): {
        pathname: string;
        oakFrom: string;
    } | undefined;
    getSubscriberId(): string | undefined;
    getBriefEnvironment(): BriefEnv | undefined;
    protected getSerializedData(): SerializedData;
    initialize(data?: SerializedData): Promise<void>;
}
