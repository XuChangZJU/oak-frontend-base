import { EntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/types/Entity';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { SerializedData } from './FrontendRuntimeContext';
import { BriefEnv } from 'oak-domain/lib/types/Environment';
export declare abstract class BackendRuntimeContext<ED extends EntityDict & BaseEntityDict> extends AsyncContext<ED> {
    private subscriberId?;
    private be?;
    private ns?;
    eventOperationMap: Record<string, string[]>;
    getNavigatorState(): {
        pathname: string;
        oakFrom?: string | undefined;
    } | undefined;
    getSubscriberId(): string | undefined;
    getBriefEnvironment(): BriefEnv | undefined;
    protected getSerializedData(): Promise<SerializedData>;
    initialize(data?: SerializedData, later?: boolean): Promise<void>;
    /**
     * 未来可以支持在event中带id的占位符，到saveOpRecord时再动态注入 by Xc
     * @param operationId
     * @param event
     */
    saveOperationToEvent(operationId: string, event: string): void;
    commit(): Promise<void>;
    rollback(): Promise<void>;
}
