import { OakException } from "oak-domain/lib/types";

export class OakEnvInitializedFailure extends OakException<any> {
    error: Error;
    constructor(err: Error) {
        super('环境初始化失败，请检查授权情况');        
        this.error = err;
    }
};

export class OakSubscriberConnectError extends OakException<any> {
    constructor(url: string, path?: string) {
        super(`Subscriber无法连接上socket，请联系技术人员。url「${url}」，path「${path}」`);
    }
}