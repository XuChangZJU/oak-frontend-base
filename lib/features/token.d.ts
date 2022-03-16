import { PayloadAction } from '@reduxjs/toolkit';
export declare const tokenSlice: import("@reduxjs/toolkit").Slice<string, {
    setToken: (state: string, action: PayloadAction<string>) => void;
    unsetToken: (state: string) => void;
}, "token">;
export default tokenSlice;
