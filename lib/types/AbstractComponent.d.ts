/// <reference types="react" />
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
export declare type RenderWidth = 1 | 2 | 3 | 4;
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
    width?: RenderWidth;
};
export declare type OakAbsDerivedAttrDef = {
    path: string;
    label: string;
    value?: string;
    width: RenderWidth;
    type?: 'img' | 'file' | 'avatar';
};
export declare type OakAbsAttrDef = string | OakAbsDerivedAttrDef;
export declare type CardDef = {
    title: string | React.ReactNode;
    state?: string | React.ReactNode;
    rows: OakAbsAttrDef[];
};
export interface OakAbsRefAttrPickerDef<ED extends EntityDict & BaseEntityDict, T extends keyof ED> {
    type: 'ref';
    mode: 'select' | 'list' | 'radio';
    attr: string;
    entity: T;
    projection: ED[T]['Selection']['data'] | (() => ED[T]['Selection']['data']);
    title: (row: Partial<ED[T]['Schema']>) => string;
    titleLabel: string;
    filter?: ED[T]['Selection']['filter'] | (() => ED[T]['Selection']['filter']);
    sorter?: ED[T]['Selection']['sorter'] | (() => ED[T]['Selection']['sorter']);
    count?: number;
    label?: string;
}
export interface OakAbsRefAttrPickerRender<ED extends EntityDict & BaseEntityDict, T extends keyof ED> extends OakAbsRefAttrPickerDef<ED, T> {
    label: string;
    required?: boolean;
    value: string;
}
export interface OakAbsGeoAttrDef {
    type: 'geo';
    category: 'point';
    attributes?: {
        areaId?: string;
        poiName?: string;
        coordinate?: string;
    };
}
export declare type OakAbsAttrUpsertDef<ED extends EntityDict & BaseEntityDict> = OakAbsGeoAttrDef | OakAbsRefAttrPickerDef<ED, keyof ED> | string;
import { DataType, DataTypeParams } from 'oak-domain/lib/types/schema/DataTypes';
export declare type AttrRender = {
    label: string;
    value: any;
    type: DataType | ('img' | 'file' | 'avatar' | 'ref');
    color?: string;
    width?: RenderWidth;
    attr: string;
};
export declare type OakNativeAttrUpsertRender = {
    label: string;
    value: any;
    type: Omit<DataType, 'ref'> | 'coordinate' | 'poiName';
    params?: DataTypeParams;
    required?: boolean;
    attr: string;
    defaultValue?: any;
    enumeration?: Array<{
        label: string;
        value: string;
    }>;
    extra?: any;
};
export declare type AttrUpsertRender<ED extends EntityDict & BaseEntityDict> = OakNativeAttrUpsertRender | OakAbsRefAttrPickerRender<ED, keyof ED>;
export declare type ColumnDefProps = {
    width: number;
    title: string;
    entity: string;
    attr: string;
    path: string;
    type: DataType & ('img' | 'file' | 'avatar');
    fixed?: 'right' | 'left';
};
export declare type DataTransformer = (data: object) => AttrRender[];
export declare type DataUpsertTransformer<ED extends EntityDict & BaseEntityDict> = (data: object) => AttrUpsertRender<ED>[];
export declare type DataConverter = (data: any[]) => Record<string, any>;
export declare type ED = BaseEntityDict & EntityDict;
export declare type CascadeActionProps = {
    path: string;
    action: string;
};
export declare type onActionFnDef = (row: any, action: string, cascadeAction?: CascadeActionProps) => void;
