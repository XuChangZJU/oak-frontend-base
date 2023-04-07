
import {
    ButtonProps,
} from 'antd';

export type Item = {
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