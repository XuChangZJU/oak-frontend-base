import { Dayjs } from 'dayjs';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { OakAbsRefAttrPickerDef } from './AbstractComponent';
export type ViewType = 'Input' | 'Select' | 'DatePicker' | 'DatePicker.RangePicker' | 'RefAttr'

export type Ops =
    | '$gt'
    | '$lt'
    | '$gte'
    | '$lte'
    | '$eq'
    | '$ne'
    | '$startsWith'
    | '$endsWith'
    | '$includes'
    | '$in'
    | '$nin'
    | '$between'
    | '$text'
    | '$search';

export type ColSpanType = 1 | 2 | 3 | 4;

export type ValueType = string | boolean | number | Array<Dayjs> | Dayjs | null | React.Key[];

export type ColumnProps<ED extends BaseEntityDict & EntityDict, T extends keyof ED> = {
    attr: string;
    label?: string;
    value?: any;
    placeholder?: string;
    op?: Ops;
    onChange?: (value: any) => void;
    autoAddFilters?: boolean;
    selectProps?: {
        options?: Array<{
            label: string;
            value: string;
        }>;
        transformInOption?: (
            option: string | number | Record<string, any>
        ) => void;
        transformOutOption?: (
            option: string | number | Record<string, any>
        ) => void;
        exclude?: string | string[]; //排除某些值，比如状态，某些页面只显示特有的值
    };
    dateProps?: {
        range?: boolean;
        showTime?: boolean;
    };
    refProps?: OakAbsRefAttrPickerDef<ED, keyof ED>;
    transformFilter?: (
        column: ColumnProps<ED, T>,
        value: ValueType
    ) => ED[T]['Selection']['filter'];
    transformValue?: (
        column: ColumnProps<ED, T>,
        filter: ED[T]['Selection']['filter']
    ) => any;
    filterName?: string;
    colSpan?: ColSpanType;
    render?: React.ReactNode;
};
