import { OakException } from "oak-domain/lib/types";
export declare class OakEnvInitializedFailure extends OakException<any> {
    error: Error;
    constructor(err: Error);
}
