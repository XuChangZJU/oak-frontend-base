/// <reference types="react" />
import { ActionDef, WebComponentProps } from '../../types/Page';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
declare type ED = EntityDict & BaseEntityDict;
declare type CascadeActionDef = {
    [K in keyof EntityDict[keyof EntityDict]['Schema']]?: ActionDef<EntityDict & BaseEntityDict, keyof EntityDict>[];
};
export default function Render(props: WebComponentProps<ED, keyof EntityDict, false, {
    schema: StorageSchema<ED>;
    entity: string;
    actions: ActionDef<ED, keyof EntityDict>[];
    cascadeActions: CascadeActionDef;
    onClick: (action: string) => void;
}, {}>): JSX.Element;
export {};
