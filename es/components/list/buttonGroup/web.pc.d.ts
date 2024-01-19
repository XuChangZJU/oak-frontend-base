import React from 'react';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { WebComponentProps } from '../../../types/Page';
import { ListButtonProps, ED } from '../../../types/AbstractComponent';
export default function Render(props: WebComponentProps<ED, keyof EntityDict, false, {
    items: ListButtonProps[];
}, {}>): React.JSX.Element | null;
