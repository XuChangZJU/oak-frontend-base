import React from 'react';
import { WebComponentProps } from '../../types/Page';
import { EntityDict } from 'oak-domain/lib/base-app-domain';
import './web.less';
export default function Render(props: WebComponentProps<EntityDict, keyof EntityDict, false, {
    name: string;
    color?: 'primary' | 'success' | 'error' | 'waring' | 'info' | string;
    size?: string;
    className?: string;
    style?: React.CSSProperties;
}, {}>): import("react/jsx-runtime").JSX.Element;
