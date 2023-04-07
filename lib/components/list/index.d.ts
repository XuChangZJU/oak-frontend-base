/// <reference types="react" />
import { CardDef, OakAbsAttrDef } from '../../types/AbstractComponent';
import { Pagination } from '../../types/Pagination';
declare const _default: (props: import("../..").ReactComponentProps<import("oak-domain/lib/types").EntityDict & import("oak-domain/lib/base-app-domain").EntityDict, string | number, false, {
    entity: string | number;
    extraActions: string[];
    onAction: Function;
    disabledOp: boolean;
    attributes: OakAbsAttrDef[];
    attributesMb: CardDef;
    data: import("oak-domain/lib/types").GeneralEntityShape[];
    loading: boolean;
    tablePagination: Pagination;
    rowSelection: import("antd/es/table/interface").TableRowSelection<any[]> | undefined;
    scroll: ({
        x?: string | number | true | undefined;
        y?: string | number | undefined;
    } & {
        scrollToFirstRowOnChange?: boolean | undefined;
    }) | undefined;
}>) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export default _default;
