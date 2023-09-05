/// <reference types="react" />
import { ButtonProps } from 'antd';
export declare type Item = {
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
export declare type IMode = 'card' | 'text';
