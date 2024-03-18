import React from 'react';
import { WebComponentProps } from '../../types/Page';
import { ED } from '../../types/AbstractComponent';
import './web.less';
export default function Render(props: WebComponentProps<ED, keyof ED, false, {
    name: string;
    color?: 'primary' | 'success' | 'error' | 'waring' | 'info' | string;
    size?: string;
    className?: string;
    style?: React.CSSProperties;
}, {}>): React.JSX.Element;
