import React from 'react';
import { WebComponentProps } from '../../types/Page';
import { ED } from '../../types/AbstractComponent';
import './index.less';
type PageHeaderProps = {
    style?: React.CSSProperties;
    className?: string;
    title?: React.ReactNode;
    showBack?: boolean;
    onBack?: () => void;
    backIcon?: React.ReactNode;
    delta?: number;
    extra?: React.ReactNode;
    subTitle?: React.ReactNode;
    contentMargin?: boolean;
    contentStyle?: React.CSSProperties;
    contentClassName?: string;
    tags?: React.ReactNode;
    children?: React.ReactNode;
    showHeader?: boolean;
};
export default function Render(props: WebComponentProps<ED, keyof ED, false, PageHeaderProps, {
    goBack: (delta?: number) => void;
}>): React.JSX.Element;
export {};
