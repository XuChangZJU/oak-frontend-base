/// <reference types="react" />
import { OakAbsAttrDef } from '../../types/AbstractComponent';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict } from 'oak-domain/lib/types/Entity';
export declare type ColSpanType = 1 | 2 | 3 | 4;
declare type ColumnMapType = {
    xxl: ColSpanType;
    xl: ColSpanType;
    lg: ColSpanType;
    md: ColSpanType;
    sm: ColSpanType;
    xs: ColSpanType;
};
declare const _default: (props: import("../..").ReactComponentProps<EntityDict & BaseEntityDict, string | number, false, {
    entity: string | number;
    attributes: OakAbsAttrDef[];
    data: import("oak-domain/lib/types/Entity").GeneralEntityShape;
    column: ColumnMapType;
}>) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export default _default;
