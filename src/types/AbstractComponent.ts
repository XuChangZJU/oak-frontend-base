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
    path: string;
    label: string;
    width: 1 | 2 | 3 | 4;
    type?: 'img' | 'file' | 'avatar';
};

export type OakAbsAttrDef = string | OakAbsFullAttrDef;

export type OakAbsAttrDef_Mobile = {
    titlePath: string;
    statePath?: string;
    rowsPath: OakAbsAttrDef[];
}

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
};

export type DataTransformer = (data: object) => AttrRender[];

export type DataConverter = (data: any[]) => Record<string, any>;

