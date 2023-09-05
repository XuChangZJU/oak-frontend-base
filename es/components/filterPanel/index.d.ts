import { ED } from '../../types/AbstractComponent';
import { ColumnProps } from '../../types/Filter';
import { ReactComponentProps } from '../../types/Page';
declare const _default: <ED2 extends ED, T2 extends keyof ED2>(props: ReactComponentProps<ED2, T2, false, {
    entity: T2;
    columns: ColumnProps<ED2, T2>[];
}>) => React.ReactElement;
export default _default;
