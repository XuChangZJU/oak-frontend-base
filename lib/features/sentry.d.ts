declare const dataSlice: import("@reduxjs/toolkit").Slice<number, {
    refreshSentry: (state: number) => void;
}, "sentry">;
export default dataSlice;
