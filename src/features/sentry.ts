import { createSlice, PayloadAction, Slice, ThunkAction } from '@reduxjs/toolkit';
import { EntityDef, OperationResult, SelectionResult } from 'oak-domain/lib/types/Entity';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { Trigger } from 'oak-domain/lib/types/Trigger';
import { Context, createDebugStore } from '../dataStore/debugStore';

// Define the initial state using that type
const initialState: number = 0;

export function initialize<ED extends {
    [K: string]: EntityDef;
}>(storageSchema: StorageSchema<ED>, triggers?: Array<Trigger<ED, keyof ED>>) {
    const dataStore = createDebugStore<ED>(storageSchema);
    if (triggers) {
        for (const trigger of triggers) {
            dataStore.registerTrigger(trigger);
        }
    }

    const slice = createSlice({
        name: 'sentry',
        // `createSlice` will infer the state type from the `initialState` argument
        initialState,
        reducers: {
            // Use the PayloadAction type to declare the contents of `action.payload`
            refreshSentry: (state) => {
                state = state + 1;
            },
        }
    });
    
    const actions = {
        operate<T extends keyof ED>(
            entity: T,
            operation: ED[T]['Operation'],
            context: Context<ED>,
            params?: Object
        ): ThunkAction<Promise<OperationResult<ED>>, any, any, ReturnType<typeof slice.actions.refreshSentry>> {
            return async (dispatch) => {
                const result = await dataStore.operate(entity, operation, context, params);
                dispatch(slice.actions.refreshSentry());
                return result;
            };
        },
    };

    return {
        slice,
        actions,

        selectData<T extends keyof ED>(
            entity: T,
            selection: ED[T]['Selection'],
            context: Context<ED>,
            params?: Object
        ) {
            return dataStore.select(entity, selection, context, params);
        },
    }
}
