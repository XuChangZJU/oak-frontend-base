import React from 'react';
import { WebComponentProps } from '../../types/Page';
import { ED } from '../../types/AbstractComponent';
import './web.less';

export default function Render(
    props: WebComponentProps<
        ED,
        keyof ED,
        false,
        {
            name: string;
            color?:
                | 'primary'
                | 'success'
                | 'error'
                | 'waring'
                | 'info'
                | string;
            size?: string;
            className?: string;
            style?: React.CSSProperties;
        },
        {}
    >
) {
    const { data } = props;

    const { name, color = '', size, className, style = {} } = data;

    const isColor = ['primary', 'info', 'success', 'error', 'warning'].includes(
        color
    );

    let class_name = 'oak-icon ' + 'oak-icon-' + name;
    if (isColor || color === '') {
        class_name += ' ' + 'oak-icon__' + (color || 'primary');
    }
    if (className) {
        class_name += ' ' + className;
    }
    return (
        <span
            className={class_name}
            style={
                Object.assign(
                    style,
                    size && { fontSize: size },
                    color && !isColor && { color }
                ) as React.CSSProperties
            }
        ></span>
    );
}