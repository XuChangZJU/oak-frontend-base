import { ED } from '../../types/AbstractComponent';
import { ReactComponentProps } from '../../types/Page';
import { ECode } from '../../types/ErrorPage';
declare const _default: <ED2 extends ED, T2 extends keyof ED2>(props: ReactComponentProps<ED2, T2, false, {
    code: ECode;
    title?: string | undefined;
    desc?: string | undefined;
    children?: React.ReactNode;
    icon?: React.ReactNode;
}>) => React.ReactElement;
export default _default;
