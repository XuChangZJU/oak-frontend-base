import React from 'react';
import { WebComponentProps } from '../../../types/Page';
import { ED } from '../../../types/AbstractComponent';
export default function render(props: WebComponentProps<ED, keyof ED, true, {
    data: Array<{
        name: string;
        x?: number;
        y?: number;
    }>;
    links: Array<{
        source: string;
        target: string;
    }>;
}, {
    onEntityClicked: (entity: string) => void;
}>): React.JSX.Element;
