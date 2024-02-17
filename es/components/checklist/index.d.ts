/// <reference types="react" />
declare const _default: (props: import("../..").ReactComponentProps<import("oak-domain/lib/types").EntityDict & import("oak-domain/lib/base-app-domain").EntityDict, string | number, boolean, {
    value: (string | number)[];
    option: {
        label: string;
        value: string | number;
    }[];
    onSelect: (v: Array<string | number>) => void;
    disabled: boolean;
}>) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export default _default;
