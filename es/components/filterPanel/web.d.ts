import { WebComponentProps } from '../../types/Page';
import { ED } from '../../types/AbstractComponent';
import { ColSpanType, ColumnProps } from '../../types/Filter';
declare type Width = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
declare type ColumnMapType = {
    xxl: ColSpanType;
    xl: ColSpanType;
    lg: ColSpanType;
    md: ColSpanType;
    sm: ColSpanType;
    xs: ColSpanType;
};
export default function Render<ED2 extends ED>(props: WebComponentProps<ED, keyof ED, false, {
    entity: keyof ED;
    columns: Array<ColumnProps<ED2, keyof ED2>>;
    onSearch: () => void;
    column?: ColSpanType | ColumnMapType;
    width: Width;
}, {
    getNamedFilters: () => Record<string, any>[];
}>): import("react/jsx-runtime").JSX.Element | null;
export {};