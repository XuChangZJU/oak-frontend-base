/// <reference types="react" />
import { TableProps } from 'antd';
import type { ColumnType } from 'antd/es/table';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { WebComponentProps } from '../../types/Page';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { ColorDict } from 'oak-domain/lib/types/Style';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
declare type SelfColumn = {
    path?: string;
};
declare type Column = SelfColumn & ColumnType<any>;
export default function Render(props: WebComponentProps<EntityDict & BaseEntityDict, keyof EntityDict, false, {
    entity: string;
    data: any[];
    columns: (Column | string)[];
    disableOp?: boolean;
    tableProps?: TableProps<any>;
    handleClick?: (id: string, action: string) => void;
    colorDict: ColorDict<EntityDict & BaseEntityDict>;
    dataSchema: StorageSchema<EntityDict>;
}, {}>): JSX.Element;
export {};
