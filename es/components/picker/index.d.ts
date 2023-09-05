/// <reference types="react" />
import { ED } from '../../types/AbstractComponent';
import { RowWithActions } from '../..';
declare const _default: (props: import("../..").ReactComponentProps<import("oak-domain/lib/types").EntityDict & import("oak-domain/lib/base-app-domain").EntityDict, string | number, true, {
    entity: string | number;
    multiple: boolean;
    onSelect: (value: [{
        id: string;
    }]) => void;
    title: (row: RowWithActions<ED, keyof ED>) => string;
    titleLabel: string;
}>) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export default _default;
