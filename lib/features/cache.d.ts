import { EntityDict, OpRecord } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-domain/EntityDict';
import { Aspect } from 'oak-domain/lib/types/Aspect';
import { Feature } from '../types/Feature';
export declare class Cache<ED extends EntityDict, AD extends Record<string, Aspect<ED>>> extends Feature<ED, AD> {
    get<T extends keyof ED>(entity: T, selection: ED[T]['Selection'], params?: object): Promise<Partial<ED[T]["Schema"] & {
        $expr?: any;
        $expr1?: any;
        $expr2?: any;
        $expr3?: any;
        $expr4?: any;
        $expr5?: any;
        $expr6?: any;
        $expr7?: any;
        $expr8?: any;
        $expr9?: any;
        $expr10?: any;
        $expr11?: any;
        $expr12?: any;
        $expr13?: any;
        $expr14?: any;
        $expr15?: any;
        $expr16?: any;
        $expr17?: any;
        $expr18?: any;
        $expr19?: any;
        $expr20?: any;
    }>[]>;
    refresh<T extends keyof ED>(entity: T, selection: ED[T]['Selection'], params?: object): Promise<import("oak-domain/lib/types/Entity").OperationResult>;
    sync(opRecords: OpRecord<ED>[]): Promise<void>;
}
export declare type Action<ED extends EntityDict & BaseEntityDict, AD extends Record<string, Aspect<ED>>> = {
    refresh: Cache<ED, AD>['refresh'];
    sync: Cache<ED, AD>['sync'];
};
