/// <reference types="react" />
import { ED, OakAbsRefAttrPickerRender } from '../../types/AbstractComponent';
declare const _default: (props: import("../..").ReactComponentProps<import("oak-domain/lib/types").EntityDict & import("oak-domain/lib/base-app-domain").EntityDict, string | number, false, {
    multiple: boolean;
    entityId: string;
    entityIds: string[];
    pickerRender: OakAbsRefAttrPickerRender<ED, string | number>;
    onChange: (value: string[]) => void;
}>) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export default _default;
