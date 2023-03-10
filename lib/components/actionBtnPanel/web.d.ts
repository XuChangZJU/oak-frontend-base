import React from 'react';
import { ButtonProps, SpaceProps } from 'antd';
import { WebComponentProps } from '../../types/Page';
import { EntityDict } from 'oak-domain/lib/base-app-domain';
declare type Item = {
    icon?: string | React.ReactNode;
    label?: string;
    action?: string;
    type?: 'a' | 'button';
    alerted?: boolean;
    alertTitle?: string;
    alertContent?: string;
    confirmText?: string;
    cancelText?: string;
    render?: React.ReactNode;
    onClick?: (item: Item) => void | Promise<void>;
    buttonProps?: Omit<ButtonProps, 'onClick'>;
    show?: boolean;
};
export default function Render(props: WebComponentProps<EntityDict, keyof EntityDict, false, {
    entity: string;
    actions: string[];
    items: Item[];
    spaceProps: SpaceProps;
    mode: 'cell' | 'table-cell';
    column: 3;
}, {
    getActionName: (action?: string) => string;
    getAlertOptions: (item: Item) => {
        title: string;
        content: string;
        okText: string;
        cancelText: string;
    };
}>): JSX.Element | null;
export {};
