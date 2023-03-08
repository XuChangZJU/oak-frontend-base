import React from 'react';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { WebComponentProps } from '../../types/Page';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { AttrRender } from '../../types/AbstractComponent';

export default function render(props: WebComponentProps<
    EntityDict & BaseEntityDict,
    keyof EntityDict,
    false,
    {
        renderData: AttrRender[];
    },
    {
    }
>) {

}