import React from 'react';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { ActionDef, WebComponentProps } from '../../types/Page';
import { ED, OakExtraActionProps, CascadeActionProps, CascadeActionDef } from '../../types/AbstractComponent';
export default function Render(props: WebComponentProps<ED, keyof ED, false, {
    i18n: any;
    items: {
        action: string;
        label: string;
        path: string;
        onClick: () => void;
    }[];
    schema: StorageSchema<ED>;
    entity: string;
    actions: ActionDef<ED, keyof ED>[];
    cascadeActions: CascadeActionDef;
    extraActions: OakExtraActionProps[];
    onAction: (action?: string, cascadeAction?: CascadeActionProps) => void;
}, {
    makeItems: () => void;
}>): React.JSX.Element;
