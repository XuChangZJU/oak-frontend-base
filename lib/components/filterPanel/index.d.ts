/// <reference types="react" />
import { ED } from '../../types/AbstractComponent';
import { ColumnProps } from '../../types/Filter';
declare const _default: (props: import("../..").ReactComponentProps<import("oak-domain/lib/types").EntityDict & import("oak-domain/lib/base-app-domain").EntityDict, string | number, true, {
    entity: string | number;
    columns: ColumnProps<ED, string | number>[];
}>) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export default _default;
