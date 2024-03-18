/// <reference types="react" />
import { ReactComponentProps } from '../../types/Page';
import { ED } from '../../types/AbstractComponent';
declare const _default: <ED2 extends ED, T2 extends keyof ED2>(props: ReactComponentProps<ED2, T2, false, {
    entity: T2;
    style?: import("react").CSSProperties | undefined;
    className?: string | undefined;
    showQuickJumper?: boolean | {
        goButton?: React.ReactNode;
    } | undefined;
    size?: "small" | "default" | undefined;
    responsive?: boolean | undefined;
    role?: string | undefined;
    totalBoundaryShowSizeChanger?: number | undefined;
    rootClassName?: string | undefined;
    showTotal?: ((total: number, range: [number, number]) => React.ReactNode) | undefined;
}>) => React.ReactElement;
export default _default;
