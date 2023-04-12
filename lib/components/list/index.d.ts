/// <reference types="react" />
import { CardDef, ED, OakAbsAttrDef } from '../../types/AbstractComponent';
import { RowWithActions } from '../../types/Page';
declare const _default: (props: import("../../types/Page").ReactComponentProps<import("oak-domain/lib/types").EntityDict & import("oak-domain/lib/base-app-domain").EntityDict, string | number, false, {
    entity: string | number;
    extraActions: string[];
    onAction: Function;
    disabledOp: boolean;
    attributes: OakAbsAttrDef[];
    attributesMb: CardDef;
    data: RowWithActions<ED, string | number>[];
    loading: boolean;
    tablePagination: false | import("antd").TablePaginationConfig | undefined;
    rowSelection: {
        type: 'checkbox' | 'radio';
        selectedRowKeys?: string[];
        onChange: (selectedRowKeys: string[], row: RowWithActions<ED, keyof ED>[], info?: {
            type: 'single' | 'multiple' | 'none';
        }) => void;
    };
    scroll: ({
        x?: string | number | true | undefined;
        y?: string | number | undefined;
    } & {
        scrollToFirstRowOnChange?: boolean | undefined;
    }) | undefined;
}>) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export default _default;
