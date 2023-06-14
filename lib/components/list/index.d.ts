import { CardDef, ED, OakAbsAttrDef, onActionFnDef, OakExtraActionProps } from '../../types/AbstractComponent';
import { TableProps } from 'antd';
import { RowWithActions, ReactComponentProps } from '../../types/Page';
declare const _default: <ED2 extends ED, T2 extends keyof ED2, T3 extends string | number = string | number>(props: ReactComponentProps<ED2, T2, false, {
    entity: T2;
    extraActions: OakExtraActionProps[];
    onAction: onActionFnDef;
    disabledOp: boolean;
    attributes: OakAbsAttrDef[];
    attributesMb: CardDef;
    data: RowWithActions<ED2, T2>[];
    loading: boolean;
    tablePagination?: false | import("antd").TablePaginationConfig | undefined;
    rowSelection?: {
        type: 'checkbox' | 'radio';
        selectedRowKeys?: string[] | undefined;
        onChange: (selectedRowKeys: string[], row: RowWithActions<ED2, T2>[], info?: {
            type: 'single' | 'multiple' | 'none';
        }) => void;
    } | undefined;
    scroll?: ({
        x?: string | number | true | undefined;
        y?: string | number | undefined;
    } & {
        scrollToFirstRowOnChange?: boolean | undefined;
    }) | undefined;
}>) => React.ReactElement;
export default _default;
