import React from 'react';
import { WebComponentProps } from '../../types/Page';
import { ED } from '../../types/AbstractComponent';
import { IMode, Item } from './type';
export default function Render(props: WebComponentProps<ED, keyof ED, false, {
    entity: string;
    actions: string[];
    items: Item[];
    rows?: number;
    column?: number;
    mode?: IMode;
    id?: string;
}, {
    getActionName: (action?: string) => string;
    getAlertOptions: (item: Item) => {
        title: string;
        content: string;
        okText: string;
        cancelText: string;
    };
}>): React.JSX.Element | null;
