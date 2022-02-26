import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store/index';

// Define a type for the slice state
type TokenState = string;

// Define the initial state using that type
const initialState: TokenState = '';

export const tokenSlice = createSlice({
    name: 'token',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
        // Use the PayloadAction type to declare the contents of `action.payload`
        setToken: (state, action: PayloadAction<string>) => {
            state = action.payload;
        },
        unsetToken: (state) => {
            state = '';
        }
    }
});

export default tokenSlice;