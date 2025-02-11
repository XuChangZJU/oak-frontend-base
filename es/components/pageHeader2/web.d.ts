import React from 'react';
import { WebComponentProps } from '../../types/Page';
import { ED } from '../../types/AbstractComponent';
import './index.less';
type PageHeaderProps = {
    style?: React.CSSProperties;
    className?: string;
    showHeader?: boolean;
    showBack?: boolean;
    onBack?: () => void;
    backIcon?: React.ReactNode;
    delta?: number;
    title?: React.ReactNode;
    subTitle?: React.ReactNode;
    tags?: React.ReactNode;
    extra?: React.ReactNode;
    children?: React.ReactNode;
    content?: React.ReactNode;
    contentStyle?: React.CSSProperties;
    contentClassName?: string;
    bodyStyle?: React.CSSProperties;
    bodyClassName?: string;
    allowBack: boolean;
};
export default function Render(props: WebComponentProps<ED, keyof ED, false, PageHeaderProps, {
    goBack: (delta?: number) => void;
}>): React.JSX.Element;
export {};
