type Result = {
    aaa(): void;
}
function ttt(): Result & ThisType<{
    state: number;
}> {
    return {
        aaa() {
            return this.state;
        }
    } as Result & ThisType<{
        state: number;
    }>;
}