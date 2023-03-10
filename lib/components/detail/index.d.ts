/// <reference types="react" />
export declare type ColSpanType = 1 | 2 | 3 | 4;
declare type ColumnMapType = {
    xxl: ColSpanType;
    xl: ColSpanType;
    lg: ColSpanType;
    md: ColSpanType;
    sm: ColSpanType;
    xs: ColSpanType;
};
declare const _default: (props: import("../..").ReactComponentProps<false, {
    entity: StringConstructor;
    attributes: ArrayConstructor;
    data: ObjectConstructor;
    column: {
        type: ObjectConstructor;
        value: ColumnMapType;
    };
}>) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export default _default;
