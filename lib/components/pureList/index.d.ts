/// <reference types="react" />
import { TableProps } from 'antd';
import type { ColumnType } from 'antd/es/table';
declare type SelfColumn = {
    path?: string;
};
declare type Column = SelfColumn & ColumnType<any>;
declare type Props = {
    entity: string;
    data: any[];
    columns: (Column | string)[];
    disableOp?: boolean;
    tableProps?: TableProps<any>;
    handleClick?: (id: string, action: string) => void;
};
declare function List(props: Props): JSX.Element;
export default List;
