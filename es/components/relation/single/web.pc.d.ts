import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { WebComponentProps } from '../../../types/Page';
declare type ED = EntityDict & BaseEntityDict;
export default function render(props: WebComponentProps<ED, keyof ED, false, {
    entity: keyof ED;
    entityDNode: string[];
    entitySNode: string[];
}, {
    getNodes: (entity: keyof ED) => void;
    checkSelectRelation: () => boolean;
}>): import("react/jsx-runtime").JSX.Element;
export {};