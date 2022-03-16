"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const toolkit_1 = require("@reduxjs/toolkit");
// Define the initial state using that type
const initialState = 0;
const dataSlice = (0, toolkit_1.createSlice)({
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
exports.default = dataSlice;
