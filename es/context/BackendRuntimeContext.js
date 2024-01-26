import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import assert from 'assert';
export class BackendRuntimeContext extends AsyncContext {
    subscriberId;
    be;
    ns;
    // 本map中记录了要求推送event到客户端的operaion
    eventOperationMap = {};
    getNavigatorState() {
        return this.ns;
    }
    getSubscriberId() {
        return this.subscriberId;
    }
    getBriefEnvironment() {
        return this.be;
    }
    async getSerializedData() {
        return {
            sid: this.subscriberId,
            be: this.be,
            ns: this.ns,
        };
    }
    async initialize(data) {
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
    saveOperationToEvent(operationId, event) {
        if (this.eventOperationMap[event]) {
            assert(!this.eventOperationMap[event].includes(operationId)); // 一个operation不可能被save两次
            this.eventOperationMap[event].push(operationId);
        }
        else {
            this.eventOperationMap[event] = [operationId];
        }
    }
    async commit() {
        this.eventOperationMap = {};
        return super.commit();
    }
    async rollback() {
        this.eventOperationMap = {};
        return super.rollback();
    }
}
