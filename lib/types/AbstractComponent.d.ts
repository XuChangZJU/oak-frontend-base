export declare type OakActionBtnProps = {
    label: string;
    action: string;
    type?: 'a' | 'button';
    ctxType?: string;
};
export declare type OakAbsNativeAttrDef = {
    path: string;
    width?: 1 | 2 | 3 | 4;
};
export declare type OakAbsFullAttrDef = {
    label: string;
    value: string;
    width: 1 | 2 | 3 | 4;
};
export declare type OakAbsAttrDef = OakAbsFullAttrDef | OakAbsNativeAttrDef;
