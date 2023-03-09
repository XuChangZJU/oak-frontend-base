/// <reference types="react" />
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { WebComponentProps } from '../../types/Page';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { ColorDict } from 'oak-domain/lib/types/Style';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { OakAbsAttrDef } from '../../types/AbstractComponent';
export default function Render(props: WebComponentProps<EntityDict & BaseEntityDict, keyof EntityDict, false, {
    data: any[];
    columns: OakAbsAttrDef[];
    disableOp?: boolean;
    handleClick?: (id: string, action: string) => void;
    colorDict: ColorDict<EntityDict & BaseEntityDict>;
    dataSchema: StorageSchema<EntityDict>;
}, {}>): JSX.Element;
