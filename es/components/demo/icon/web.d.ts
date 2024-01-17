import React from 'react';
import { WebComponentProps } from '../../../types/Page';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { ED } from '../../../types/AbstractComponent';
export default function Render(props: WebComponentProps<ED, keyof EntityDict, false, {}, {}>): React.JSX.Element;
