import React from 'react';
import { SpaceProps } from 'antd';
import { WebComponentProps } from '../../types/Page';
import { ED } from '../../types/AbstractComponent';
import { Item } from './types';
export default function Render(props: WebComponentProps<ED, keyof ED, false, {
    entity: string;
    actions: string[];
    items: Item[];
    spaceProps: SpaceProps;
    mode: 'cell' | 'table-cell' | 'default';
    column: 3;
}, {
    getActionName: (action?: string) => string;
    getAlertOptions: (item: Item) => {
        title: string;
        content: string;
        okText: string;
        cancelText: string;
    };
}>): React.JSX.Element | null;
