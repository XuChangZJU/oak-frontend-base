/// <reference types="react" />
import { WebComponentProps } from '../../../types/Page';
import { AuthCascadePath, EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
declare type ED = EntityDict & BaseEntityDict;
export default function render(props: WebComponentProps<ED, 'actionAuth', true, {
    entity: string;
    actions: string[];
    action: string;
    cascadeEntityActions: Array<{
        path: AuthCascadePath<ED>;
        relations: ED['relation']['Schema'][];
        actionAuths?: ED['actionAuth']['OpSchema'][];
    }>;
}, {
    onChange: (actions: string[], path: AuthCascadePath<ED>, actionAuth?: ED['actionAuth']['OpSchema']) => void;
    confirm: () => void;
    onActionSelected: (action: string) => void;
}>): JSX.Element;
export {};
