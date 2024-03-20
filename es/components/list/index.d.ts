import { ED, OakAbsAttrDef, onActionFnDef, OakExtraActionProps } from '../../types/AbstractComponent';
import { TableProps } from 'antd';
import { RowWithActions, ReactComponentProps } from '../../types/Page';
declare const _default: <ED2 extends ED, T2 extends keyof ED2>(props: ReactComponentProps<ED2, T2, false, {
    entity: T2;
    extraActions: OakExtraActionProps[] | ((row: RowWithActions<ED2, T2>) => OakExtraActionProps[]);
    onAction: onActionFnDef;
    disabledOp: boolean;
    attributes: OakAbsAttrDef[];
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
    hideHeader: boolean;
    size?: "small" | "large" | "middle" | undefined;
}>) => React.ReactElement;
export default _default;
