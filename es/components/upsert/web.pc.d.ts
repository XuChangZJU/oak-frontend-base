import React from 'react';
import { AttrUpsertRender, ED } from '../../types/AbstractComponent';
import { WebComponentProps } from '../../types/Page';
export default function render<T extends keyof ED>(props: WebComponentProps<ED, T, false, {
    entity: keyof ED;
    renderData: AttrUpsertRender<ED, T>[];
    helps?: Record<string, string>;
    layout?: 'horizontal' | 'vertical';
    children: any;
}>): React.JSX.Element;
