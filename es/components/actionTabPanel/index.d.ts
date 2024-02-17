/// <reference types="react" />
import { IMode, Item } from "./type";
declare const _default: (props: import("../..").ReactComponentProps<import("oak-domain/lib/types").EntityDict & import("oak-domain/lib/base-app-domain").EntityDict, string | number, false, {
    entity: string | number;
    items: Item[];
    rows: number;
    column: number;
    mode: IMode;
}>) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export default _default;
