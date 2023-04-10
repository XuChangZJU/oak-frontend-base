import { ED, OakAbsAttrDef } from '../../types/AbstractComponent';
import { ReactComponentProps } from '../../types/Page';
export declare type ColSpanType = 1 | 2 | 3 | 4;
declare const _default: <ED2 extends ED, T2 extends keyof ED2>(props: ReactComponentProps<ED2, T2, false, {
    entity: T2;
    attributes: OakAbsAttrDef[];
    data: ED2[T2]["Schema"];
}>) => React.ReactElement;
export default _default;
