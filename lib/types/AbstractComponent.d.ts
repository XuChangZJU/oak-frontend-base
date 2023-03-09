export declare type OakActionBtnProps = {
    label: string;
    action: string;
    type?: 'a' | 'button';
    ctxType?: string;
};
export declare type OakActionsProps = {
    action: string;
    label?: string;
};
export declare type OakAbsNativeAttrDef = {
    path: string;
    width?: 1 | 2 | 3 | 4;
};
export declare type OakAbsFullAttrDef = {
    path: string;
    label: string;
    width: 1 | 2 | 3 | 4;
    type?: 'image' | 'file' | 'avatar';
};
export declare type OakAbsAttrDef = string | OakAbsFullAttrDef;
export declare type OakAbsAttrDef_Mobile = {
    titlePath: string;
    statePath?: string;
    rowsPath: OakAbsAttrDef[];
};
import { DataType, DataTypeParams } from 'oak-domain/lib/types/schema/DataTypes';
export declare type AttrRender = {
    label: string;
    value: any;
    type: DataType | 'ref' | 'image' | 'file' | 'avatar';
    params?: DataTypeParams;
    width?: 1 | 2 | 3 | 4;
    ref?: string;
    required?: boolean;
    path?: string;
    defaultValue?: any;
    enumeration?: Array<{
        label: string;
        value: string;
    }>;
};
export declare type DataTransformer = (data: object) => AttrRender[];
export declare type DataConverter = (data: any[]) => Record<string, any>;
