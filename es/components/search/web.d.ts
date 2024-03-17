import React from 'react';
import { WebComponentProps } from '../../types/Page';
import { ED } from '../../types/AbstractComponent';
export default function Render(props: WebComponentProps<ED, keyof ED, false, {
    searchValue: string;
    placeholder: string;
}, {
    searchChange: (value: string) => void;
    searchConfirm: (value: string) => void;
    searchClear: () => void;
}>): React.JSX.Element;
