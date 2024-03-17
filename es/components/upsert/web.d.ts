import React from 'react';
import { WebComponentProps } from '../../types/Page';
import { AttrUpsertRender, ED } from '../../types/AbstractComponent';
export default function render<T extends keyof ED>(props: WebComponentProps<ED, T, false, {
    entity: T;
    renderData: AttrUpsertRender<ED, T>[];
    helps?: Record<string, string>;
    layout?: 'horizontal' | 'vertical';
    mode?: 'default' | 'card';
    children: any;
}>): React.JSX.Element;
