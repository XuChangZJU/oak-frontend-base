/// <reference types="react" />
import { WebComponentProps } from '../../types/Page';
import { ED } from '../../types/AbstractComponent';
import { EntityDict } from 'oak-domain/lib/types/Entity';
export default function Render(props: WebComponentProps<ED, keyof EntityDict, false, {
    items: {
        label: string;
        onClick: () => void;
    }[];
    moreItems: {
        label: string;
        onClick: () => void;
    }[];
}, {}>): JSX.Element;
