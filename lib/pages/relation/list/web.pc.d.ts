/// <reference types="react" />
import { RowWithActions, WebComponentProps } from '../../../types/Page';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
declare type ED = EntityDict & BaseEntityDict;
export default function render(props: WebComponentProps<ED, 'relation', true, {
    relations: RowWithActions<ED, 'relation'>[];
    hasRelationEntites: string[];
}, {
    onActionClicked: (id: string, entity: keyof ED) => void;
    onRelationClicked: (id: string, entity: keyof ED) => void;
}>): JSX.Element;
export {};
