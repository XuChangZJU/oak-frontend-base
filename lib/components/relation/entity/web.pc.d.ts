/// <reference types="react" />
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { WebComponentProps } from '../../../types/Page';
declare type ED = EntityDict & BaseEntityDict;
export default function render(props: WebComponentProps<ED, keyof ED, false, {
    entity: keyof ED;
    actions: string[];
    action: string;
    relations: ED['relation']['OpSchema'][];
    relationId: string;
    hasDirectActionAuth: boolean;
    hasDirectRelationAuth: boolean;
    deducedRelationAttr?: string;
}, {
    onActionSelected: (action: string) => void;
    onRelationSelected: (relationId: string) => void;
}>): JSX.Element;
export {};
