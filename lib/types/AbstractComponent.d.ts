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
    label: string;
    value: string;
    width: 1 | 2 | 3 | 4;
    type?: 'image' | 'file';
};
export declare type OakAbsAttrDef = OakAbsFullAttrDef | OakAbsNativeAttrDef;
import { DataType, DataTypeParams } from 'oak-domain/lib/types/schema/DataTypes';
export declare type AttrRender = {
    label: string;
    value: any;
    type: DataType;
    params?: DataTypeParams;
    width?: 1 | 2 | 3 | 4;
    ref?: string;
    required?: boolean;
    path?: string;
    defaultValue?: any;
};
export declare type DataTransformer = (data: object) => AttrRender[];
export declare type DataConverter = (data: object) => Record<string, any>;
