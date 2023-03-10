/// <reference types="react" />
import { PaginationProps } from 'antd';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { WebComponentProps } from '../../types/Page';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { ColorDict } from 'oak-domain/lib/types/Style';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { ColumnDefProps, AttrRender } from '../../types/AbstractComponent';
import { Action, CascadeActionItem } from 'oak-domain/lib/types';
export default function Render(props: WebComponentProps<EntityDict & BaseEntityDict, keyof EntityDict, false, {
    entity: string;
    schema: StorageSchema<EntityDict & BaseEntityDict>;
    columns: ColumnDefProps[];
    mobileData: AttrRender[];
    data: any;
    disabledOp: boolean;
    colorDict: ColorDict<EntityDict & BaseEntityDict>;
    handleClick?: (id: string, action: string) => void;
    tablePagination?: PaginationProps;
    onAction?: (row: any, action: Action, cascadeAction: CascadeActionItem) => void;
}, {}>): JSX.Element;
