/// <reference types="react" />
import { PaginationProps } from 'antd';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { WebComponentProps } from '../../types/Page';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { ColorDict } from 'oak-domain/lib/types/Style';
import { ColumnDefProps, AttrRender } from '../../types/AbstractComponent';
export default function Render(props: WebComponentProps<EntityDict & BaseEntityDict, keyof EntityDict, false, {
    columns: ColumnDefProps[];
    mobileData: AttrRender[];
    data: any;
    disabledOp: boolean;
    colorDict: ColorDict<EntityDict & BaseEntityDict>;
    handleClick?: (id: string, action: string) => void;
    tablePagination?: PaginationProps;
}, {}>): JSX.Element;
