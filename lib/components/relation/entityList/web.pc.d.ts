/// <reference types="react" />
import { WebComponentProps } from '../../../types/Page';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
declare type ED = EntityDict & BaseEntityDict;
export default function render(props: WebComponentProps<ED, keyof ED, true, {
    entities: string[];
}, {
    onEntityClick: (entity: string) => void;
}>): JSX.Element;
export {};
