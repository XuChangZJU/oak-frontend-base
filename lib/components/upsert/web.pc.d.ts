/// <reference types="react" />
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { AttrRender } from '../../types/AbstractComponent';
import { WebComponentProps } from '../../types/Page';
export default function render(props: WebComponentProps<EntityDict & BaseEntityDict, keyof EntityDict, false, {
    renderData: AttrRender[];
}, {}>): JSX.Element;
