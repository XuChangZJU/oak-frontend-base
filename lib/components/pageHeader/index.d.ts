/// <reference types="react" />
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { ReactComponentProps } from '../../types/Page';
declare const _default: <ED2 extends EntityDict & BaseEntityDict, T2 extends keyof ED2>(props: ReactComponentProps<ED2, T2, false, {
    style?: import("react").CSSProperties | undefined;
    className?: string | undefined;
    title?: React.ReactNode;
    showBack?: boolean | undefined;
    onBack?: (() => void) | undefined;
    backIcon?: React.ReactNode;
    delta?: number | undefined;
    extra?: React.ReactNode;
    subTitle?: React.ReactNode;
    contentMargin?: boolean | undefined;
    contentStyle?: import("react").CSSProperties | undefined;
    contentClassName?: string | undefined;
    tags?: React.ReactNode;
    children?: React.ReactNode;
    showHeader?: boolean | undefined;
}>) => React.ReactElement;
export default _default;
