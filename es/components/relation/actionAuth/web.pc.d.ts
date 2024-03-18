import { WebComponentProps } from '../../../types/Page';
import { ED } from '../../../types/AbstractComponent';
import React from 'react';
export default function render(props: WebComponentProps<ED, 'actionAuth', true, {
    cascadeEntityActions: Array<{
        path: any;
        relations: ED['relation']['Schema'][];
        actionAuths?: ED['actionAuth']['Schema'][];
    }>;
    actionAuthList: Array<{
        paths: string[];
        sourceEntity: string;
        relations: ED['actionAuth']['Schema'][];
        relationSelections: Array<{
            id: string;
            name: string;
        }>;
    }>;
    actions: string[];
    entity: keyof ED;
}, {
    onChange: (checked: boolean, relationId: string, path: string, actionAuth?: ED['actionAuth']['Schema'][]) => void;
    onChange2: (checked: boolean, relationId: string, paths: string[], actionAuths: ED['actionAuth']['Schema'][], actionAuth?: ED['actionAuth']['Schema']) => void;
    confirm: () => void;
}>): React.JSX.Element;
