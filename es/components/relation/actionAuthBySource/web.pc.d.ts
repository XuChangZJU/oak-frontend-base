import React from 'react';
import { WebComponentProps } from '../../../types/Page';
import { ED } from '../../../types/AbstractComponent';
export default function render(props: WebComponentProps<ED, 'actionAuth', true, {
    entity: string;
    relationName: string;
    cascadeEntityActions: Array<{
        path: any;
        actions: string[];
        actionAuth?: ED['actionAuth']['OpSchema'];
    }>;
}, {
    onChange: (actions: string[], path: any, actionAuth?: ED['actionAuth']['OpSchema']) => void;
    confirm: () => void;
}>): React.JSX.Element;
