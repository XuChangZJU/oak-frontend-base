"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
const toolkit_1 = require("@reduxjs/toolkit");
const debugStore_1 = require("../dataStore/debugStore");
// Define the initial state using that type
const initialState = 0;
function initialize(storageSchema, triggers) {
    const dataStore = (0, debugStore_1.createDebugStore)(storageSchema);
    if (triggers) {
        for (const trigger of triggers) {
            dataStore.registerTrigger(trigger);
        }
    }
    const slice = (0, toolkit_1.createSlice)({
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
        operate(entity, operation, context, params) {
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
        selectData(entity, selection, context, params) {
            return dataStore.select(entity, selection, context, params);
        },
    };
}
exports.initialize = initialize;
