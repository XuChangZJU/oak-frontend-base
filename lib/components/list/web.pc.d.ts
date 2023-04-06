/// <reference types="react" />
import { TableProps, PaginationProps } from 'antd';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { WebComponentProps } from '../../types/Page';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { ColorDict } from 'oak-domain/lib/types/Style';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { OakAbsAttrDef, ColumnDefProps, AttrRender, onActionFnDef } from '../../types/AbstractComponent';
export default function Render(props: WebComponentProps<EntityDict & BaseEntityDict, keyof EntityDict, false, {
    width: 'xl' | 'lg' | 'md' | 'sm' | 'xs';
    loading: boolean;
    extraActions: string[];
    entity: string;
    schema: StorageSchema<EntityDict & BaseEntityDict>;
    attributes: OakAbsAttrDef[];
    columns: ColumnDefProps[];
    mobileData: AttrRender[];
    data: any[];
    disabledOp: boolean;
    colorDict: ColorDict<EntityDict & BaseEntityDict>;
    handleClick?: (id: string, action: string) => void;
    tablePagination?: PaginationProps;
    onAction?: onActionFnDef;
    rowSelection?: TableProps<any[]>['rowSelection'];
    scroll?: TableProps<any[]>['scroll'];
    i18n: any;
}, {}>): JSX.Element;
