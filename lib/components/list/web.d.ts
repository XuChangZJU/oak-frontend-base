/// <reference types="react" />
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { WebComponentProps } from '../../types/Page';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { ColorDict } from 'oak-domain/lib/types/Style';
import { ColumnDefProps, AttrRender } from '../../types/AbstractComponent';
export default function Render(props: WebComponentProps<EntityDict & BaseEntityDict, keyof EntityDict, false, {
    columns: ColumnDefProps[];
    mobileData: AttrRender[];
    data: any;
    colorDict: ColorDict<EntityDict & BaseEntityDict>;
}, {}>): JSX.Element;
