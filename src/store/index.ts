import { configureStore } from '@reduxjs/toolkit';
// import { composeWithDevTools } from 'remote-redux-devtools';
import { EntityDef, Selection, SelectionResult } from "oak-domain/lib/types/Entity";
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { Trigger, TriggerEntityShape } from "oak-domain/lib/types/Trigger";
import { TriggerExecutor } from 'oak-trigger-executor';
import thunk from 'redux-thunk';
import Token from '../features/token';
import Sentry from '../features/sentry';
import { createDebugStore, Context as DebugContext } from '../dataStore/debugStore';

const reducer = {
    t: Token.reducer,
    s: Sentry.reducer,
};

export const getToken = (state: RootState) => state.t;
export const getSentry = (state: RootState) => state.s;

export type RootState = ReturnType<(ReturnType<typeof initialize>)['store']['getState']>;

export function initialize<E extends string, ED extends {
    [K in E]: EntityDef<E, ED, K, SH>;
}, SH extends TriggerEntityShape = TriggerEntityShape>(
    initialState: Object,
    storageSchema: StorageSchema,
    triggers: Array<Trigger<E, ED, E, SH>> = [],
    isDebug: boolean = true) {
    const store = configureStore({
        reducer,
        preloadedState: initialState,
    });

    const dataStore = createDebugStore<E, ED, SH>(storageSchema);
    for (const trigger of triggers) {
        dataStore.registerTrigger(trigger);
    }

    return {
        store,
        actions: {
            ...Token.actions,

            operate: <T extends E>(
                entity: T,
                operation: ED[T]['Operation'],
                context: DebugContext<E, ED, SH>,
                params?: Object
            ) => {
                const result = dataStore.operate(entity, operation, context, params);
                Sentry.actions.refreshSentry();
                return result;
            },

            select: <T extends E>(
                entity: T,
                selection: ED[T]['Selection'],
                context: DebugContext<E, ED, SH>,
                params?: Object
            ) => dataStore.select(entity, selection, context, params),

            count: <T extends E>(
                entity: T,
                selection: ED[T]['Selection'],
                context: DebugContext<E, ED, SH>,
                params?: Object
            ) => dataStore.count(entity, selection, context, params)
        },
    };
}

