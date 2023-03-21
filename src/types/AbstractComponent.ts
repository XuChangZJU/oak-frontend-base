import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';

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

export type OakAbsDerivedAttrDef = {
    path: string;
    label: string;
    value?: string;
    width: RenderWidth;
    type?: 'img' | 'file' | 'avatar';
};

export type OakAbsAttrDef = string | OakAbsDerivedAttrDef;

export type CardDef = {
    // string:path ReactNode自主渲染
    title: string | React.ReactNode,
    state?: string | React.ReactNode,
    rows: OakAbsAttrDef[];
}

export interface OakAbsRefAttrPickerDef<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED
> {
    mode: 'select' | 'list' | 'radio';
    attr: string;
    entity: T;
    projection: ED[T]['Selection']['data'] | (() => ED[T]['Selection']['data']);
    title: (row: Partial<ED[T]['Schema']>) => string;
    titleLabel: string;
    filter?: ED[T]['Selection']['filter'] | (() => ED[T]['Selection']['filter']);
    count?: number;
    label?: string;
}

export type OakAbsRefAttrPickerRender<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED
> = {
    type: 'ref';
    attr: string;
    label: string;
    value: string;
    renderValue: any;
    required?: boolean;
    mode: OakAbsRefAttrPickerDef<ED, T>['mode'];
};

export type OakAbsGeoAttrsDef = {
    amapSecurityJsCode: string;
    amapKey: string;
    type: 'getPoint';
    attributes?: {
        areaId?: string;
        poiName?: string;
        coordinate?: string;
    };
};

export type OakAbsAttrUpsertDef<ED extends EntityDict & BaseEntityDict> =
    | OakAbsRefAttrPickerDef<ED, keyof ED>
    | string;

import {
    DataType,
    DataTypeParams,
} from 'oak-domain/lib/types/schema/DataTypes';
import { ActionDef } from './Page';
export type AttrRender = {
    label: string;
    value: any;
    type: DataType | ('img' | 'file' | 'avatar' | 'ref');
    color?: string;
    width?: RenderWidth;
    attr: string;
};

export type OakNativeAttrUpsertRender = {
    label: string;
    value: any;
    type: Omit<DataType, 'ref'>;
    params?: DataTypeParams;
    required?: boolean;
    attr: string;
    defaultValue?: any;
    enumeration?: Array<{ label: string; value: string }>;
};

export type AttrUpsertRender<ED extends EntityDict & BaseEntityDict> =
    | OakNativeAttrUpsertRender
    | OakAbsRefAttrPickerRender<ED, keyof ED>;

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

export type DataUpsertTransformer<ED extends EntityDict & BaseEntityDict> = (
    data: object
) => AttrUpsertRender<ED>[];

export type DataConverter = (data: any[]) => Record<string, any>;

export type ED = BaseEntityDict & EntityDict;

export type CascadeActionProps = {
    path: string,
    action: string,
}
export type onActionFnDef = (row: any, action: string, cascadeAction?: CascadeActionProps) => void
