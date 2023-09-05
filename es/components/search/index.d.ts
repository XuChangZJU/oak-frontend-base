/// <reference types="react" />
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict } from 'oak-domain/lib/types/Entity';
declare const _default: (props: import("../../types/Page").ReactComponentProps<EntityDict & BaseEntityDict, string | number, true, {
    entity: string | number;
    attributes: string[];
    placeholder: string;
}>) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export default _default;
