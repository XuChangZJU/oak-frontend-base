/// <reference types="react" />
declare const _default: (props: import("../../..").ReactComponentProps<import("oak-domain/lib/types").EntityDict & import("oak-domain/lib/base-app-domain").EntityDict, "relation", true, {
    entity: string | number;
    entityId: string;
    onActionClicked: (id: string, entity: string) => undefined;
    onRelationClicked: (id: string, entity: string, entityId: string) => undefined;
}>) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export default _default;
