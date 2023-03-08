/// <reference types="react" />
import { WebComponentProps } from '../../types/Page';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { OakActionBtnProps } from '../../types/oakActionBtn';
import { EntityDict } from 'oak-domain/lib/types/Entity';
export default function Render(props: WebComponentProps<EntityDict & BaseEntityDict, keyof EntityDict, false, {
    id: string;
    entity: string;
    oakActions: OakActionBtnProps[];
    onClick: (id: string, action: string) => void;
}, {}>): JSX.Element;
