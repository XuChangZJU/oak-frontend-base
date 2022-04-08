import { EntityDict, OperateParams, OpRecord } from 'oak-domain/lib/types/Entity';
import { Aspect } from 'oak-general-business/lib/types/Aspect';
import { Feature } from '../types/Feature';
export declare class Cache<ED extends EntityDict, AD extends Record<string, Aspect<ED>>> extends Feature<ED, AD> {
    refresh<T extends keyof ED>(entity: T, selection: ED[T]['Selection'], params?: object): ReturnType<(AD & {
        loginByPassword: typeof import("oak-general-business/src/aspects/token").loginByPassword;
        loginMp: typeof import("oak-general-business/src/aspects/token").loginMp;
        operate: typeof import("oak-general-business/src/aspects/crud").operate;
        select: typeof import("oak-general-business/src/aspects/crud").select;
    })["operate"]>;
    sync(records: OpRecord<ED>[]): Promise<void>;
    operate<T extends keyof ED>(entity: T, operation: ED[T]['Operation'], params?: OperateParams): Promise<import("oak-domain/lib/types/Entity").OperationResult>;
    get<T extends keyof ED>(options: {
        entity: T;
        selection: ED[T]['Selection'];
        params?: object;
    }): Promise<Partial<ED[T]["Schema"] & {
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
}
