import { OakException } from "oak-domain/lib/types";

export class OakEnvInitializedFailure extends OakException<any> {
    error: Error;
    constructor(err: Error) {
        super('环境初始化失败，请检查授权情况');        
        this.error = err;
    }
}