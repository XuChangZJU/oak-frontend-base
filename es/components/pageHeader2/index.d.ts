/// <reference types="react" />
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { ReactComponentProps } from '../../types/Page';
declare const _default: <ED2 extends EntityDict & BaseEntityDict, T2 extends keyof ED2>(props: ReactComponentProps<ED2, T2, false, {
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
}>) => React.ReactElement;
export default _default;
