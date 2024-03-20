import React from 'react';
import { ED } from '../../../types/AbstractComponent';
import { WebComponentProps } from '../../../types/Page';
export default function Render(props: WebComponentProps<ED, keyof ED, false, {
    actionss: Array<{
        icon: {
            name: string;
        };
        label: string;
        action: string;
    }>;
    onActionClick: (action: string) => void;
}>): React.JSX.Element | null;
