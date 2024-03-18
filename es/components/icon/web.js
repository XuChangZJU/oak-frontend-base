import React from 'react';
import './web.less';
export default function Render(props) {
    const { data } = props;
    const { name, color = '', size, className, style = {} } = data;
    const isColor = ['primary', 'info', 'success', 'error', 'warning'].includes(color);
    let class_name = 'oak-icon ' + 'oak-icon-' + name;
    if (isColor || color === '') {
        class_name += ' ' + 'oak-icon__' + (color || 'primary');
    }
    if (className) {
        class_name += ' ' + className;
    }
    return (<span className={class_name} style={Object.assign(style, size && { fontSize: size }, color && !isColor && { color })}></span>);
}
