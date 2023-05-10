/// <reference types="react" />
import { WebComponentProps } from '../../../types/Page';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
declare type ED = EntityDict & BaseEntityDict;
export default function render(props: WebComponentProps<ED, 'freeActionAuth', true, {
    entity: keyof ED;
    actions: string[];
    freeActionAuths?: ED['freeActionAuth']['OpSchema'][];
}, {
    onChange: (checked: boolean, action: string, freeActionAuth?: ED['freeActionAuth']['OpSchema']) => void;
    confirm: () => void;
}>): JSX.Element;
export {};
