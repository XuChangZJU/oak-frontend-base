import React from 'react';
import { WebComponentProps } from '../../types/Page';
import { ED } from '../../types/AbstractComponent';
import { EntityDict } from 'oak-domain/lib/types/Entity';
export default function Render(props: WebComponentProps<ED, keyof EntityDict, false, {
    searchValue: string;
    placeholder: string;
}, {
    searchChange: (value: string) => void;
    searchConfirm: (value: string) => void;
    searchClear: () => void;
}>): React.JSX.Element;
