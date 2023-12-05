import React from 'react';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
type ED = EntityDict & BaseEntityDict;
import { WebComponentProps } from '../../types/Page';
import { AttrUpsertRender } from '../../types/AbstractComponent';
export default function render<T extends keyof ED>(props: WebComponentProps<ED, T, false, {
    entity: T;
    renderData: AttrUpsertRender<ED, T>[];
    helps?: Record<string, string>;
    layout?: 'horizontal' | 'vertical';
    mode?: 'default' | 'card';
    children: any;
}>): React.JSX.Element;
export {};
