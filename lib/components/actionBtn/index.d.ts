/// <reference types="react" />
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { ED } from '../../types/AbstractComponent';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { ActionDef } from '../../types/Page';
declare const _default: (props: import("../../types/Page").ReactComponentProps<EntityDict & BaseEntityDict, string | number, false, {
    entity: string | number;
    extraActions: string[];
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
