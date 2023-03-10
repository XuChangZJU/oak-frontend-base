/// <reference types="react" />
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { AttrUpsertRender } from '../../types/AbstractComponent';
import { WebComponentProps } from '../../types/Page';
export default function render(props: WebComponentProps<EntityDict & BaseEntityDict, keyof EntityDict, false, {
    renderData: AttrUpsertRender<EntityDict & BaseEntityDict>[];
    children: any;
}, {}>): JSX.Element;
