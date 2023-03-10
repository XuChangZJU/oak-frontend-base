export type RenderWidth = 1 | 2 | 3 | 4;

export type OakActionBtnProps = {
    label: string;
    action: string;
    type?: 'a' | 'button';
    ctxType?: string;
};

export type OakActionsProps = {
    action: string;
    label?: string;
};

export type OakAbsNativeAttrDef = {
    path: string;
    width?: RenderWidth;
};

export type OakAbsFullAttrDef = {
    path: string;
    label: string;
    value?: string;
    width: RenderWidth;
    type?: 'img' | 'file' | 'avatar';
};

export type OakAbsAttrDef = string | OakAbsFullAttrDef;

export type OakAbsAttrDef_Mobile = {
    titlePath: string;
    statePath?: string;
    rowsPath: OakAbsAttrDef[];
};

import {
    DataType,
    DataTypeParams,
} from 'oak-domain/lib/types/schema/DataTypes';
export type AttrRender = {
    label: string;
    value: any;
    type: DataType & ('img' | 'file' | 'avatar' | 'ref');
    color?: string;
    params?: DataTypeParams;
    width?: RenderWidth;
    ref?: string;
    required?: boolean;
    path?: string;
    defaultValue?: any;
    enumeration?: Array<{ label: string; value: string }>;
    attr: string;
};

export type ColumnDefProps = {
    width: number;
    title: string;
    entity: string; // enum类型还需要再转成中文 需要entity、attr
    attr: string;
    path: string;
    type: DataType & ('img' | 'file' | 'avatar');
    fixed?: 'right' | 'left';
};

export type DataTransformer = (data: object) => AttrRender[];

export type DataConverter = (data: any[]) => Record<string, any>;
