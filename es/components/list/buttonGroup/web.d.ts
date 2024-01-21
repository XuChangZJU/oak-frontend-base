import React from 'react';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { ListButtonProps, ED } from '../../../types/AbstractComponent';
import { WebComponentProps } from '../../../types/Page';
export default function Render(props: WebComponentProps<ED, keyof EntityDict, false, {
    items: ListButtonProps[];
}, {}>): React.JSX.Element | null;
