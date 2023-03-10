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
    mode: 'select' | 'list' | 'radio';
    attr: string;
    entity: T;
    projection: ED[T]['Selection']['data'] | (() => ED[T]['Selection']['data']);
    title: (row: ED[T]['Schema']) => string;
    filter?: ED[T]['Selection']['filter'] | (() => ED[T]['Selection']['filter']);
    count?: number;
    label?: string;
    allowNull?: boolean;
}
export declare type OakAbsRefAttrPickerRender<ED extends EntityDict & BaseEntityDict, T extends keyof ED> = {
    type: 'ref';
    attr: string;
    label: string;
    value: any;
    required?: boolean;
    mode: OakAbsRefAttrPickerDef<ED, T>['mode'];
};
export declare type OakAbsGeoAttrsDef = {
    amapSecurityJsCode: string;
    amapKey: string;
    type: 'getPoint';
    attributes?: {
        areaId?: string;
        poiName?: string;
        coordinate?: string;
    };
};
export declare type OakAbsAttrUpsertDef<ED extends EntityDict & BaseEntityDict> = OakAbsRefAttrPickerDef<ED, keyof ED> | string;
import { DataType, DataTypeParams } from 'oak-domain/lib/types/schema/DataTypes';
export declare type AttrRender = {
    label: string;
    value: any;
    type: DataType | ('img' | 'file' | 'avatar' | 'ref');
    color?: string;
    width?: RenderWidth;
};
export declare type OakNativeAttrUpsertRender = {
    label: string;
    value: any;
    type: Omit<DataType, 'ref'>;
    params?: DataTypeParams;
    required?: boolean;
    attr: string;
    defaultValue?: any;
    enumeration?: Array<{
        label: string;
        value: string;
    }>;
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
