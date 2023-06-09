/// <reference types="react" />
import { WebComponentProps } from '../../../types/Page';
import { AuthCascadePath, EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
declare type ED = EntityDict & BaseEntityDict;
export default function render(props: WebComponentProps<ED, 'actionAuth', true, {
    cascadeEntityActions: Array<{
        path: AuthCascadePath<ED>;
        relations: ED['relation']['Schema'][];
        actionAuths?: ED['actionAuth']['OpSchema'][];
    }>;
    actions: string[];
}, {
    onChange: (checked: boolean, relationId: string, path: string, actionAuth?: ED['actionAuth']['OpSchema']) => void;
    confirm: () => void;
}>): JSX.Element;
export {};
