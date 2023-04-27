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
    width?: RenderWidth;
    type?: 'img' | 'file' | 'avatar' | 'text';
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
    projection: ED[T]['Selection']['data'];
    title: (row: Partial<ED[T]['Schema']>) => string;
    titleLabel?: string;
    filter?: ED[T]['Selection']['filter'];
    sorter?: ED[T]['Selection']['sorter'];
    getDynamicSelectors?: () => Promise<{
        filter?: ED[T]['Selection']['filter'];
        sorter?: ED[T]['Selection']['sorter'];
        projection?: ED[T]['Selection']['data'];
    }>;
    count?: number;
    label?: string;
    placeholder?: string;
    allowNull?: boolean;
}
export interface OakAbsRefAttrPickerRender<ED extends EntityDict & BaseEntityDict, T extends keyof ED> extends OakAbsRefAttrPickerDef<ED, T> {
    required?: boolean;
}
export interface OakAbsGeoAttrUpsertDef {
    type: 'geo';
    category: 'point';
    attributes?: {
        areaId?: string;
        poiName?: string;
        coordinate?: string;
    };
    allowNull?: boolean;
}
export interface OakAbsNativeAttrUpsertDef<ED extends EntityDict & BaseEntityDict, T extends keyof ED, A extends keyof ED[T]['OpSchema']> {
    attr: A;
    type: Omit<DataType, 'ref' | 'geo'>;
    label?: string;
    placeholder?: string;
    max?: number;
    min?: number;
    maxLength?: number;
    defaultValue?: any;
    required?: boolean;
    allowNull?: boolean;
}
export declare type OakAbsAttrUpsertDef<ED extends EntityDict & BaseEntityDict, T extends keyof ED, T2 extends keyof ED = keyof ED> = OakAbsGeoAttrUpsertDef | OakAbsRefAttrPickerDef<ED, T2> | keyof ED[T]['OpSchema'] | OakAbsNativeAttrUpsertDef<ED, T, keyof ED[T]['OpSchema']>;
import { DataType, DataTypeParams } from 'oak-domain/lib/types/schema/DataTypes';
export declare type AttrRender = {
    label: string;
    value: any;
    type: DataType | ('img' | 'file' | 'avatar' | 'ref');
    color?: string;
    width?: RenderWidth;
    attr: string;
};
export interface OakAbsNativeAttrUpsertRender<ED extends EntityDict & BaseEntityDict, T extends keyof ED, A extends keyof ED[T]['OpSchema']> extends Omit<OakAbsNativeAttrUpsertDef<ED, T, A>, 'type'> {
    value: any;
    type: Omit<DataType, 'ref'> | 'coordinate' | 'poiName';
    enumeration?: Array<{
        label: string;
        value: string;
    }>;
    extra?: any;
    params: DataTypeParams;
}
export declare type AttrUpsertRender<ED extends EntityDict & BaseEntityDict, T extends keyof ED> = OakAbsNativeAttrUpsertRender<ED, T, keyof ED[T]['OpSchema']> | OakAbsRefAttrPickerRender<ED, T>;
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
export declare type DataUpsertTransformer<ED extends EntityDict & BaseEntityDict, T extends keyof ED> = (data: object) => AttrUpsertRender<ED, T>[];
export declare type DataConverter = (data: any[]) => Record<string, any>;
export declare type ED = BaseEntityDict & EntityDict;
export declare type CascadeActionProps = {
    path: string;
    action: string;
};
export declare type onActionFnDef = (row: any, action: string, cascadeAction?: CascadeActionProps) => void;
