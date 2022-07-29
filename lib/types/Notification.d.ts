/// <reference types="react" />
export declare type NotificationProps = {
    title?: string;
    content?: string | React.ReactNode;
    type: 'info' | 'success' | 'warning' | 'error';
    icon?: string | boolean;
    duration?: number;
    zIndex?: number;
    offset?: Array<string | number>;
    placement?: 'center' | 'top' | 'left' | 'right' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    footer: React.ReactNode;
    closeBtn?: string | boolean | React.ReactNode;
    onCloseBtnClick?: Function;
    onDurationEnd?: Function;
};
