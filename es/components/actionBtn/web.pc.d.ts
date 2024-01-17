import React from 'react';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { ActionDef, WebComponentProps } from '../../types/Page';
import { ED, OakExtraActionProps } from '../../types/AbstractComponent';
import { CascadeActionProps } from '../../types/AbstractComponent';
type CascadeActionDef = {
    [K in keyof EntityDict[keyof EntityDict]['Schema']]?: ActionDef<EntityDict & BaseEntityDict, keyof EntityDict>[];
};
export default function Render(props: WebComponentProps<ED, keyof EntityDict, false, {
    i18n: any;
    items: {
        action: string;
        label: string;
        path: string;
        onClick: () => void;
    }[];
    schema: StorageSchema<ED>;
    entity: string;
    actions: ActionDef<ED, keyof EntityDict>[];
    cascadeActions: CascadeActionDef;
    extraActions: OakExtraActionProps[];
    onAction: (action?: string, cascadeAction?: CascadeActionProps) => void;
}, {
    makeItems: () => void;
}>): React.JSX.Element;
export {};
