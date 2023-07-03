/// <reference types="react" />
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { WebComponentProps } from '../../../types/Page';
import { ListButtonProps } from '../../../types/AbstractComponent';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
export default function Render(props: WebComponentProps<EntityDict & BaseEntityDict, keyof EntityDict, false, {
    items: ListButtonProps[];
}, {}>): JSX.Element;
