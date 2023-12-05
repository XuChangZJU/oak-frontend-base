import React from 'react';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { ListButtonProps } from '../../../types/AbstractComponent';
import { WebComponentProps } from '../../../types/Page';
export default function Render(props: WebComponentProps<EntityDict & BaseEntityDict, keyof EntityDict, false, {
    items: ListButtonProps[];
}, {}>): React.JSX.Element;
