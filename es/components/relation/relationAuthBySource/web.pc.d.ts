/// <reference types="react" />
import { WebComponentProps } from '../../../types/Page';
import { ED } from '../../../types/AbstractComponent';
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
}>): import("react").JSX.Element;
