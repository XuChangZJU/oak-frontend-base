/// <reference types="react" />
import { TableProps } from 'antd';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { WebComponentProps } from '../../types/Page';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { ColorDict } from 'oak-domain/lib/types/Style';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { OakAbsAttrDef, onActionFnDef, OakExtraActionProps } from '../../types/AbstractComponent';
export default function Render(props: WebComponentProps<EntityDict & BaseEntityDict, keyof EntityDict, false, {
    width: 'xl' | 'lg' | 'md' | 'sm' | 'xs';
    loading: boolean;
    extraActions: OakExtraActionProps[];
    entity: string;
    schema: StorageSchema<EntityDict & BaseEntityDict>;
    attributes: OakAbsAttrDef[];
    data: any[];
    disabledOp: boolean;
    colorDict: ColorDict<EntityDict & BaseEntityDict>;
    tablePagination?: TableProps<any[]>['pagination'];
    onAction?: onActionFnDef;
    rowSelection?: TableProps<any[]>['rowSelection'];
    i18n: any;
    hideHeader?: boolean;
}, {}>): JSX.Element;
