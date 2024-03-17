/// <reference types="react" />
import { ReactComponentProps } from '../../types/Page';
import { ED } from '../../types/AbstractComponent';
declare const _default: <ED2 extends ED, T2 extends keyof ED2>(props: ReactComponentProps<ED2, T2, false, {
    style?: import("react").CSSProperties | undefined;
    className?: string | undefined;
    showHeader?: boolean | undefined;
    showBack?: boolean | undefined;
    onBack?: (() => void) | undefined;
    backIcon?: React.ReactNode;
    delta?: number | undefined;
    title?: React.ReactNode;
    subTitle?: React.ReactNode;
    tags?: React.ReactNode;
    extra?: React.ReactNode;
    children?: React.ReactNode;
    content: React.ReactNode;
    contentStyle?: import("react").CSSProperties | undefined;
    contentClassName?: string | undefined;
    bodyStyle?: import("react").CSSProperties | undefined;
    bodyClassName?: string | undefined;
}>) => React.ReactElement;
export default _default;
