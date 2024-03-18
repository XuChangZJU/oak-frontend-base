import React from 'react';
import { WebComponentProps } from '../../../types/Page';
import { ED } from '../../../types/AbstractComponent';
type TableData = {
    relationId: string;
    relation: string;
    actions: string[];
};
export default function render(props: WebComponentProps<ED, 'actionAuth', true, {
    relations: ED['relation']['Schema'][];
    actions: string[];
    datasource: TableData[];
    rows: ED['actionAuth']['Schema'][];
    path: string;
    entity: keyof ED;
    openTip: boolean;
    onClose: () => void;
}, {}>): React.JSX.Element;
export {};
