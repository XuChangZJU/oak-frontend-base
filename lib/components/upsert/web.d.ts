/// <reference types="react" />
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
declare type ED = EntityDict & BaseEntityDict;
import { WebComponentProps } from '../../types/Page';
import { AttrUpsertRender } from '../../types/AbstractComponent';
export default function render(props: WebComponentProps<ED, keyof EntityDict, false, {
    entity: keyof ED;
    renderData: AttrUpsertRender<ED>[];
    helps?: Record<string, string>;
    layout?: 'horizontal' | 'vertical';
    mode?: 'default' | 'card';
    children: any;
}>): JSX.Element;
export {};
