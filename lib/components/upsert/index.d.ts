import { ED, OakAbsAttrUpsertDef } from '../../types/AbstractComponent';
import { ReactComponentProps } from '../../types/Page';
declare const _default: <ED2 extends ED, T2 extends keyof ED2>(props: ReactComponentProps<ED2, T2, false, {
    helps: Record<string, string>;
    entity: T2;
    attributes: OakAbsAttrUpsertDef<ED2, T2>[];
    data: ED2[T2]["Schema"];
    layout: 'horizontal' | 'vertical';
    mode: 'default' | 'card';
}>) => React.ReactElement;
export default _default;
