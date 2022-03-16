"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenSlice = void 0;
const toolkit_1 = require("@reduxjs/toolkit");
// Define the initial state using that type
const initialState = '';
exports.tokenSlice = (0, toolkit_1.createSlice)({
    name: 'token',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
        // Use the PayloadAction type to declare the contents of `action.payload`
        setToken: (state, action) => {
            state = action.payload;
        },
        unsetToken: (state) => {
            state = '';
        }
    }
});
exports.default = exports.tokenSlice;
