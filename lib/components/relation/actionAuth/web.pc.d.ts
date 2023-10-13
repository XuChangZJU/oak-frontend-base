import { WebComponentProps } from '../../../types/Page';
import { AuthCascadePath, EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
type ED = EntityDict & BaseEntityDict;
export default function render(props: WebComponentProps<ED, 'actionAuth', true, {
    cascadeEntityActions: Array<{
        path: AuthCascadePath<ED>;
        relations: ED['relation']['Schema'][];
        actionAuths?: ED['actionAuth']['Schema'][];
    }>;
    actionAuthList: Array<{
        paths: string[];
        sourceEntity: string;
        relations: ED['actionAuth']['Schema'][];
        relationSelections: Array<{
            id: string;
            name: string;
        }>;
    }>;
    actions: string[];
    entity: keyof EntityDict;
}, {
    onChange: (checked: boolean, relationId: string, path: string, actionAuth?: ED['actionAuth']['Schema'][]) => void;
    onChange2: (checked: boolean, relationId: string, paths: string[], actionAuths: ED['actionAuth']['Schema'][], actionAuth?: ED['actionAuth']['Schema']) => void;
    confirm: () => void;
}>): import("react/jsx-runtime").JSX.Element;
export {};