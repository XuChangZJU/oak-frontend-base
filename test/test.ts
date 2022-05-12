
type OakPageData = {
    oakFullpath: string;
    oakExecuting: boolean;
    oakFocused: object;
    oakDirty: boolean;
    oakError: {
        type: 'warning' | 'error' | 'success' | 'primary';
        msg: string;
    };
    oakLegalActions: string[],
};

type A = {
    name: string;
    method: Function,
} & ThisType<{
    data: OakPageData
}>;

const a: A = {
    name: 'xc',
    method() {
    }
};

function tt<FormedData extends Record<string, any>>(p: Partial<OakPageData & FormedData>) {
    console.log(p);
}

tt({
    oakExecuting: false,
})