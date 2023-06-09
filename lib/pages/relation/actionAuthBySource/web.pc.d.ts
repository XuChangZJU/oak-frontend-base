/// <reference types="react" />
import { WebComponentProps } from '../../../types/Page';
import { AuthCascadePath, EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
declare type ED = EntityDict & BaseEntityDict;
export default function render(props: WebComponentProps<ED, 'actionAuth', true, {
    entity: string;
    relationName: string;
    cascadeEntityActions: Array<{
        path: AuthCascadePath<ED>;
        actions: string[];
        actionAuth?: ED['actionAuth']['OpSchema'];
    }>;
}, {
    onChange: (actions: string[], path: AuthCascadePath<ED>, actionAuth?: ED['actionAuth']['OpSchema']) => void;
    confirm: () => void;
}>): JSX.Element;
export {};
