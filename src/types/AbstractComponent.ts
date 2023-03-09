export type OakActionBtnProps = {
    label: string;
    action: string;
    type?: 'a' | 'button';
    ctxType?: string;
};

export type OakActionsProps = {
    action: string;
    label?: string;
}

export type OakAbsNativeAttrDef = {
    path: string;
    width?: 1 | 2 | 3 | 4;
};

export type OakAbsFullAttrDef = {
    label: string;
    value: string;
    width: 1 | 2 | 3 | 4;
    type?: 'image' | 'file';
};

export type OakAbsAttrDef = OakAbsFullAttrDef | OakAbsNativeAttrDef;

import { DataType, DataTypeParams } from 'oak-domain/lib/types/schema/DataTypes';
export type AttrRender = {    
    label: string;
    value: any;
    type: DataType;
    params?: DataTypeParams;
    width?: 1 | 2 | 3 | 4;
    ref?: string;
    required?: boolean;
    path?: string;
    defaultValue?: any;
    notNull?: boolean;
    enum?: Array<{ label: string, value: string }>;
};

export type DataTransformer = (data: object) => AttrRender[];

export type DataConverter = (data: object) => Record<string, any>;

