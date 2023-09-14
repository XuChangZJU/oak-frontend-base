import { WebComponentProps } from '../../../types/Page';
import { AuthCascadePath, EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
type ED = EntityDict & BaseEntityDict;
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
}>): import("react/jsx-runtime").JSX.Element;
export {};
