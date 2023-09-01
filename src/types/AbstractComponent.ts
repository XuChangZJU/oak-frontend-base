import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { ButtonProps } from 'antd';

export type RenderWidth = 1 | 2 | 3 | 4;

export type OakActionBtnProps = {
    label: string;
    action: string;
    type?: 'a' | 'button';
    ctxType?: string;
};

export type OakExtraActionProps = {
    action: string;
    label: string;
    show: boolean;
}

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
    width?: number;
    span?: number;
    type?: 'image' | 'link' | DataType | 'ref';
    linkUrl?: string;
};

export type OakAbsAttrDef = string | OakAbsDerivedAttrDef;

export type OakAbsAttrJudgeDef = {
    path: string;
    entity: keyof ED;
    attr: string;
    attribute: OakAbsAttrDef;
    attrType: DataType | 'ref' | undefined;
}

export type CardDef = {
    // string:path ReactNode自主渲染
    title: string | React.ReactNode;
    state?: string | React.ReactNode;
    rows: OakAbsAttrDef[];
};

export interface OakAbsRefAttrPickerDef<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED
> {
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
    }>; // 这里主要是为了动态构造filter，当需要先选A再将A作为B的filter条件时经常出现
    count?: number;
    label?: string;
    placeholder?: string;
    allowNull?: boolean;
}

export interface OakAbsRefAttrPickerRender<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED
> extends OakAbsRefAttrPickerDef<ED, T> {
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

export interface OakAbsNativeAttrUpsertDef<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    A extends keyof ED[T]['OpSchema']
> {
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

export type OakAbsAttrUpsertDef<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    T2 extends keyof ED = keyof ED
> =
    | OakAbsGeoAttrUpsertDef
    | OakAbsRefAttrPickerDef<ED, T2>
    | keyof ED[T]['OpSchema']
    | OakAbsNativeAttrUpsertDef<ED, T, keyof ED[T]['OpSchema']>;

import {
    DataType,
    DataTypeParams,
} from 'oak-domain/lib/types/schema/DataTypes';
export type AttrRender = {
    label: string;
    value: any;
    type: DataType | ('image' | 'link' | 'ref');
    color?: string;
    span?: RenderWidth;
    attr: string;
};

export interface OakAbsNativeAttrUpsertRender<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    A extends keyof ED[T]['OpSchema']
> extends Omit<OakAbsNativeAttrUpsertDef<ED, T, A>, 'type'> {
    value: any;
    type: Omit<DataType, 'ref'> | 'coordinate' | 'poiName';
    enumeration?: Array<{ label: string; value: string }>;
    extra?: any;
    params: DataTypeParams;
}

export type AttrUpsertRender<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED
> =
    | OakAbsNativeAttrUpsertRender<ED, T, keyof ED[T]['OpSchema']>
    | OakAbsRefAttrPickerRender<ED, T>;

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

export type DataUpsertTransformer<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED
> = (data: object) => AttrUpsertRender<ED, T>[];

export type DataConverter = (data: any[]) => Record<string, any>;

export type ED = BaseEntityDict & EntityDict;

export type CascadeActionProps = {
    path: string;
    action: string;
};
export type onActionFnDef = (
    row: any,
    action: string,
    cascadeAction?: CascadeActionProps
) => void;

export type ListButtonProps = {
    label: string;
    show?: boolean;
    type?: ButtonProps['type'],
    icon?: React.ReactNode,
    onClick: () => void;
}


type ColSpanType = 1 | 2 | 3 | 4;
export type ColumnMapType = {
    xxl: ColSpanType;
    xl: ColSpanType;
    lg: ColSpanType;
    md: ColSpanType;
    sm: ColSpanType;
    xs: ColSpanType;
};
