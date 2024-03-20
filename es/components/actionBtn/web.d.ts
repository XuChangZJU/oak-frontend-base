import React from 'react';
import { WebComponentProps } from '../../types/Page';
import { ED } from '../../types/AbstractComponent';
export default function Render(props: WebComponentProps<ED, keyof ED, false, {
    width: string;
    i18n: any;
    items: {
        label: string;
        onClick: () => void;
    }[];
    moreItems: {
        label: string;
        onClick: () => void;
    }[];
}, {
    makeItems: (isMobile: boolean) => void;
}>): React.JSX.Element;
