/// <reference types="react" />
import { Item } from './types';
declare const _default: (props: import("../..").ReactComponentProps<import("oak-domain").EntityDict & import("oak-domain").BaseEntityDict, string | number, false, {
    entity: string | number;
    items: Item[];
    mode: "cell" | "default" | "table-cell";
    column: number;
    fixed: boolean;
}>) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export default _default;
