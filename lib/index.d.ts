import { EntityDef } from "oak-domain/lib/types/Entity";
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { Trigger, TriggerEntityShape } from "oak-domain/lib/types/Trigger";
import { Context as DebugContext } from './dataStore/debugStore';
declare type RootState = ReturnType<(ReturnType<typeof initialize>)['store']['getState']>;
export declare const getToken: (state: RootState) => string;
export declare const getSentry: (state: RootState) => number;
export declare function initialize<E extends string, ED extends {
    [K in E]: EntityDef<E, ED, K, SH>;
}, SH extends TriggerEntityShape = TriggerEntityShape>(storageSchema: StorageSchema, triggers?: Array<Trigger<E, ED, E, SH>>, initialState?: Object, isDebug?: boolean): {
    store: import("@reduxjs/toolkit").EnhancedStore<{
        t: string;
        s: number;
    }, import("redux").AnyAction, [import("redux-thunk").ThunkMiddleware<{
        t: string;
        s: number;
    }, import("redux").AnyAction, null> | import("redux-thunk").ThunkMiddleware<{
        t: string;
        s: number;
    }, import("redux").AnyAction, undefined>]>;
    actions: {
        operate: <T extends E>(entity: T, operation: ED[T]["Operation"], context: DebugContext<E, ED, SH>, params?: Object | undefined) => Promise<void>;
        select: <T_1 extends E>(entity: T_1, selection: ED[T_1]["Selection"], context: DebugContext<E, ED, SH>, params?: Object | undefined) => Promise<SelectionResult<E_1, ED_1, T_2, SH_1>>;
        count: <T_3 extends E>(entity: T_3, selection: ED[T_3]["Selection"], context: DebugContext<E, ED, SH>, params?: Object | undefined) => any;
        setToken: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, string>;
        unsetToken: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<string>;
    };
};
export {};
