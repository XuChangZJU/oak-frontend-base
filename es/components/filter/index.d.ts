/// <reference types="react" />
import { ED } from '../../types/AbstractComponent';
import { ColumnProps } from '../../types/Filter';
import { ReactComponentProps } from '../../types/Page';
declare const _default: (props: ReactComponentProps<import("oak-domain/lib/types").EntityDict & import("oak-domain").BaseEntityDict, string | number, true, {
    entity: string | number;
    column: ColumnProps<ED, string | number>;
}>) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export default _default;
