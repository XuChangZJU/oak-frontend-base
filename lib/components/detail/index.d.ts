import { ED, OakAbsAttrDef, ColumnMapType } from '../../types/AbstractComponent';
import { ReactComponentProps } from '../../types/Page';
declare const _default: <ED2 extends ED, T2 extends keyof ED2>(props: ReactComponentProps<ED2, T2, false, {
    column?: ColumnMapType | undefined;
    entity: T2;
    attributes: OakAbsAttrDef[];
    data: Partial<ED2[T2]["Schema"]>;
    title?: string | undefined;
    bordered?: boolean | undefined;
    layout?: "horizontal" | "vertical" | undefined;
}>) => React.ReactElement;
export default _default;
