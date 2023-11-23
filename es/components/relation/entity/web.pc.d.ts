import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { WebComponentProps } from '../../../types/Page';
type ED = EntityDict & BaseEntityDict;
export default function render(props: WebComponentProps<ED, keyof ED, false, {
    entity: keyof ED;
    actions: string[];
    daas: any[];
    dras: any[];
    checkedActions: string[];
    relations: ED['relation']['OpSchema'][];
    relationIds: string[];
    hasDirectActionAuth: boolean;
    hasDirectRelationAuth: boolean;
    deduceRelationAttr?: string;
}, {
    onActionsSelected: (actions: string[]) => void;
    onRelationsSelected: (relationIds: string[]) => void;
}>): import("react/jsx-runtime").JSX.Element;
export {};
