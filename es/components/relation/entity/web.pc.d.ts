import React from 'react';
import { WebComponentProps } from '../../../types/Page';
import { ED } from '../../../types/AbstractComponent';
export default function render(props: WebComponentProps<ED, keyof ED, false, {
    entity: keyof ED;
    actions: string[];
    daas: any[];
    dras: any[];
    checkedActions: string[];
    relations: ED['relation']['OpSchema'][];
    relationIds: string[];
    hasDirectActionAuth: boolean;
    hasDirectRelationAuth: boolean;
    deduceRelationAttr?: string;
}, {
    onActionsSelected: (actions: string[]) => void;
    onRelationsSelected: (relationIds: string[]) => void;
}>): React.JSX.Element;
