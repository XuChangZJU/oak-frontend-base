import { WebComponentProps } from '../../../types/Page';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
type ED = EntityDict & BaseEntityDict;
export default function render(props: WebComponentProps<ED, 'relationAuth', true, {
    entity: string;
    relationName: string;
    cascadeEntityRelations: Array<{
        entity: keyof ED;
        path: string;
        relations: ED['relation']['Schema'][];
        authedRelations: ED['relationAuth']['Schema'][];
    }>;
}, {
    onChange: (relationId: string, checked: boolean, relationAuthId?: string, path?: string) => void;
    confirm: () => void;
}>): import("react/jsx-runtime").JSX.Element;
export {};
