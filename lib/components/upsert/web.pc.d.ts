/// <reference types="react" />
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { AttrUpsertRender } from '../../types/AbstractComponent';
import { WebComponentProps } from '../../types/Page';
declare type ED = EntityDict & BaseEntityDict;
export default function render(props: WebComponentProps<ED, keyof EntityDict, false, {
    renderData: AttrUpsertRender<ED>[];
    children: any;
}, {}>): JSX.Element;
export {};
