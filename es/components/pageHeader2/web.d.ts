import React from 'react';
import { WebComponentProps } from '../../types/Page';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
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
    allowBack: boolean;
};
type ED = EntityDict & BaseEntityDict;
export default function Render(props: WebComponentProps<ED, keyof ED, false, PageHeaderProps, {
    goBack: (delta?: number) => void;
}>): React.JSX.Element;
export {};
