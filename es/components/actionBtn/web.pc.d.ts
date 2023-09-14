import { ActionDef, WebComponentProps } from '../../types/Page';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { ED } from '../../types/AbstractComponent';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
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
    onAction: (action?: string, cascadeAction?: CascadeActionProps) => void;
}, {
    makeItems: () => void;
}>): import("react/jsx-runtime").JSX.Element;
export {};
