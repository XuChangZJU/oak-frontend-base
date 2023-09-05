import { OakException } from "oak-domain/lib/types";
export declare class OakEnvInitializedFailure extends OakException<any> {
    error: Error;
    constructor(err: Error);
}
export declare class OakSubscriberConnectError extends OakException<any> {
    constructor(url: string, path?: string);
}
