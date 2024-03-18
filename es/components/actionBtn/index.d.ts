/// <reference types="react" />
import { ED, OakExtraActionProps } from '../../types/AbstractComponent';
import { ActionDef } from '../../types/Page';
declare const _default: (props: import("../../types/Page").ReactComponentProps<import("oak-domain/lib/types").EntityDict & import("oak-domain/lib/base-app-domain").EntityDict, string | number, false, {
    entity: string | number;
    extraActions: OakExtraActionProps[];
    actions: ActionDef<ED, string | number>[];
    cascadeActions: {
        [x: string]: ActionDef<ED, string | number>[] | undefined;
        id?: ActionDef<ED, string | number>[] | undefined;
        $$seq$$?: ActionDef<ED, string | number>[] | undefined;
        $$createAt$$?: ActionDef<ED, string | number>[] | undefined;
        $$updateAt$$?: ActionDef<ED, string | number>[] | undefined;
        $$deleteAt$$?: ActionDef<ED, string | number>[] | undefined;
    };
    onAction: Function;
}>) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export default _default;
