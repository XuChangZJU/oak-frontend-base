import { Slice, ThunkAction } from '@reduxjs/toolkit';
import { EntityDef, OperationResult, SelectionResult } from 'oak-domain/lib/types/Entity';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { Trigger } from 'oak-domain/lib/types/Trigger';
import { Context } from '../dataStore/debugStore';
export declare function initialize<ED extends {
    [K: string]: EntityDef;
}>(storageSchema: StorageSchema<ED>, triggers?: Array<Trigger<ED, keyof ED>>): {
    slice: Slice<number, {
        refreshSentry: (state: number) => void;
    }, "sentry">;
    actions: {
        operate<T extends keyof ED>(entity: T, operation: ED[T]["Operation"], context: Context<ED>, params?: Object | undefined): ThunkAction<Promise<any>, any, any, {
            payload: undefined;
            type: string;
        }>;
    };
    selectData<T_1 extends keyof ED>(entity: T_1, selection: ED[T_1]["Selection"], context: Context<ED>, params?: Object | undefined): Promise<SelectionResult<ED, T_1>>;
};
