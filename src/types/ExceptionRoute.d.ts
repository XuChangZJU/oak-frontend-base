import { OakException } from "oak-domain/lib/types";
export interface ExceptionHandler {
    hidden?: true;
    level?: 'warning' | 'error';
    handler?: (error: OakException) => void;
    router?: string;
}
export declare type ExceptionRouters = Array<[new (...args: any) => OakException, ExceptionHandler]>;
