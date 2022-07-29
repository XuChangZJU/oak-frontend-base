export declare type MessageProps = {
    title?: string;
    content?: string | any;
    type: 'info' | 'success' | 'warning' | 'error';
    icon?: string | boolean;
    duration?: number;
    zIndex?: number;
    offset?: Array<string | number>;
    placement?: 'center' | 'top' | 'left' | 'right' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    closeBtn?: string | boolean | any;
    onCloseBtnClick?: Function;
    onDurationEnd?: Function;
};
