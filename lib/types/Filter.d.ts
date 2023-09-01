/// <reference types="react" />
import { Dayjs } from 'dayjs';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { OakAbsRefAttrPickerDef } from './AbstractComponent';
export declare type ViewType = 'Input' | 'Select' | 'DatePicker' | 'DatePicker.RangePicker' | 'RefAttr';
export declare type Ops = '$gt' | '$lt' | '$gte' | '$lte' | '$eq' | '$ne' | '$startsWith' | '$endsWith' | '$includes' | '$in' | '$nin' | '$between' | '$text' | '$search';
export declare type ColSpanType = 1 | 2 | 3 | 4;
export declare type ValueType = string | boolean | number | Array<Dayjs> | Dayjs | null | React.Key[];
export declare type ColumnProps<ED extends BaseEntityDict & EntityDict, T extends keyof ED> = {
    attr: string;
    label?: string;
    placeholder?: string;
    op?: Ops;
    onChange?: (value: any) => void;
    autoAddFilters?: boolean;
    selectProps?: {
        options?: Array<{
            label: string;
            value: string;
        }>;
        transformInOption?: (option: string | number | Record<string, any>) => void;
        transformOutOption?: (option: string | number | Record<string, any>) => void;
        exclude?: string | string[];
    };
    dateProps?: {
        range?: boolean;
        showTime?: boolean;
    };
    refProps?: OakAbsRefAttrPickerDef<ED, keyof ED>;
    transformFilter?: (column: ColumnProps<ED, T>, value: ValueType) => ED[T]['Selection']['filter'];
    transformValue?: (column: ColumnProps<ED, T>, filter: ED[T]['Selection']['filter']) => any;
    filterName?: string;
    colSpan?: ColSpanType;
    render?: React.ReactNode;
};
