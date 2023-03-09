import React from 'react';
import { ButtonProps } from 'antd';
import { WebComponentProps } from '../../types/Page';
import { EntityDict } from 'oak-domain/lib/base-app-domain';
declare type Item = {
    icon?: string;
    iconRender?: React.ReactNode;
    iconProps?: {
        style?: React.CSSProperties;
        rootStyle?: React.CSSProperties;
        bgColor?: string;
    };
    label?: string;
    action?: string;
    alerted?: boolean;
    alertTitle?: string;
    alertContent?: string;
    confirmText?: string;
    cancelText?: string;
    render?: React.ReactNode;
    onClick?: (item: Item) => void | Promise<void>;
    buttonProps?: Omit<ButtonProps, 'onClick'>;
    filter?: () => boolean;
    show?: boolean;
};
declare type IMode = 'card' | 'text';
export default function Render(props: WebComponentProps<EntityDict, keyof EntityDict, false, {
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
}>): JSX.Element | null;
export {};
