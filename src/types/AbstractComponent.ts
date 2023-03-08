export type OakActionBtnProps = {
    label: string;
    action: string;
    type?: 'a' | 'button';
    ctxType?: string;
};

export type OakAbsNativeAttrDef = {
    path: string;
    width?: 1 | 2 | 3 | 4;
};

export type OakAbsFullAttrDef = {
    label: string;
    value: string;
    width: 1 | 2 | 3 | 4;
};

export type OakAbsAttrDef = OakAbsFullAttrDef | OakAbsNativeAttrDef;

