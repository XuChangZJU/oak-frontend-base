import { Feature } from "../types/Feature";
import { EntityDict, Aspect, AspectWrapper } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { CommonAspectDict } from 'oak-common-aspect';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
export declare class Port<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>, AD extends CommonAspectDict<ED, Cxt> & Record<string, Aspect<ED, Cxt>>> extends Feature {
    private aspectWrapper;
    constructor(aspectWrapper: AspectWrapper<ED, Cxt, AD>);
    importEntity<T extends keyof ED>(entity: T, id: string, file: File, option: Object): Promise<{
        result: Awaited<ReturnType<AD["importEntity"]>>;
        opRecords: import("oak-domain/lib/types").OpRecord<ED>[];
    }>;
    exportEntity<T extends keyof ED>(entity: T, id: string, filter?: ED[T]['Selection']['filter']): Promise<{
        result: Awaited<ReturnType<AD["exportEntity"]>>;
        opRecords: import("oak-domain/lib/types").OpRecord<ED>[];
    }>;
    getImportationTemplate<T extends keyof ED>(id: string): Promise<{
        result: Awaited<ReturnType<AD["getImportationTemplate"]>>;
        opRecords: import("oak-domain/lib/types").OpRecord<ED>[];
    }>;
}
