/// <reference types="react" />
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { ED } from '../../../types/AbstractComponent';
import { WebComponentProps } from '../../../types/Page';
export default function Render(props: WebComponentProps<ED, keyof EntityDict, false, {
    actionss: Array<{
        icon: {
            name: string;
        };
        label: string;
        action: string;
    }>;
    onActionClick: (action: string) => void;
}>): import("react").JSX.Element | null;
