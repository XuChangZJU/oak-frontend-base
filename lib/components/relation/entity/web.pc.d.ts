/// <reference types="react" />
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { WebComponentProps } from '../../../types/Page';
declare type ED = EntityDict & BaseEntityDict;
export default function render(props: WebComponentProps<ED, keyof ED, false, {
    entity: keyof ED;
    actions: string[];
    checkedActions: string[];
    relations: ED['relation']['OpSchema'][];
    relationIds: string[];
    hasDirectActionAuth: boolean;
    hasDirectRelationAuth: boolean;
    deduceRelationAttr?: string;
}, {
    onActionsSelected: (actions: string[]) => void;
    onRelationsSelected: (relationIds: string[]) => void;
}>): JSX.Element;
export {};
