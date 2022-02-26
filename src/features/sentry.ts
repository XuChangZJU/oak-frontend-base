import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the initial state using that type
const initialState: number = 0;

const dataSlice = createSlice({
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

export default dataSlice;