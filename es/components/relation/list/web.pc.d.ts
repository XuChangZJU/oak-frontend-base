import React from 'react';
import { RowWithActions, WebComponentProps } from '../../../types/Page';
import { ED } from '../../../types/AbstractComponent';
export default function render(props: WebComponentProps<ED, 'relation', true, {
    relations: RowWithActions<ED, 'relation'>[];
    entity: string;
    entities: (keyof ED)[];
    onClicked: (relationId: string) => any;
}, {
    setEntityFilter: (filter: string) => void;
}>): React.JSX.Element | null;
