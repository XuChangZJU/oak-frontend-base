import React from 'react';
import { WebComponentProps } from '../../../types/Page';
import { ED } from '../../../types/AbstractComponent';
export default function render(props: WebComponentProps<ED, keyof ED, false, {
    entity: keyof ED;
    entityDNode: string[];
    entitySNode: string[];
}, {
    getNodes: (entity: keyof ED) => void;
    checkSelectRelation: () => boolean;
    resolveP: (path: string) => string;
}>): React.JSX.Element;
