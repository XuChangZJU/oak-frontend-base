import { RowWithActions, WebComponentProps } from '../../../types/Page';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
type ED = EntityDict & BaseEntityDict;
export default function render(props: WebComponentProps<ED, 'relation', true, {
    relations: RowWithActions<ED, 'relation'>[];
    entity: string;
    entities: (keyof ED)[];
    onClicked: (relationId: string) => any;
}, {
    setEntityFilter: (filter: string) => void;
}>): import("react/jsx-runtime").JSX.Element | null;
export {};
