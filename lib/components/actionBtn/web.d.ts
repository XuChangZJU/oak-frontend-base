/// <reference types="react" />
import { WebComponentProps } from '../../types/Page';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { OakActionBtnProps } from '../../types/AbstractComponent';
import { EntityDict } from 'oak-domain/lib/types/Entity';
export default function Render(props: WebComponentProps<EntityDict & BaseEntityDict, keyof EntityDict, false, {
    entity: string;
    oakActions: OakActionBtnProps[];
    onClick: (action: string) => void;
}, {}>): JSX.Element;
