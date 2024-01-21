import { EntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/types/Entity';
import { AsyncContext, AsyncRowStore } from 'oak-domain/lib/store/AsyncRowStore';
import { SerializedData } from './FrontendRuntimeContext';
import { BriefEnv } from 'oak-domain/lib/types/Environment';
import assert from 'assert';

export abstract class BackendRuntimeContext<ED extends EntityDict & BaseEntityDict> extends AsyncContext<ED> {
    private subscriberId?: string;
    private be?: BriefEnv;
    private ns?: {
        pathname: string;
        oakFrom?: string;
    }
    // 本map中记录了要求推送event到客户端的operaion
    eventOperationMap: Record<string, string[]> = {};

    getNavigatorState() {
        return this.ns;
    }

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
            ns: this.ns,
        }
    }

    async initialize(data?: SerializedData) {
        if (data?.sid) {
            this.subscriberId = data.sid;
        }
        if (data?.be) {
            this.be = data.be;
        }
        if (data?.ns) {
            this.ns = data.ns;
        }
    }

    /**
     * 未来可以支持在event中带id的占位符，到saveOpRecord时再动态注入 by Xc
     * @param operationId 
     * @param event 
     */
    saveOperationToEvent(operationId: string, event: string) {
        if (this.eventOperationMap[event]) {
            assert(!this.eventOperationMap[event].includes(operationId));       // 一个operation不可能被save两次
            this.eventOperationMap[event].push(operationId);
        }
        else {
            this.eventOperationMap[event] = [operationId];
        }
    }

    async commit(): Promise<void> {
        this.eventOperationMap = {};
        return super.commit();
    }

    async rollback(): Promise<void> {
        this.eventOperationMap = {};
        return super.rollback();
    }
}