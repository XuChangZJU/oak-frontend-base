/// <reference types="react" />
import { SpaceProps } from 'antd';
import { WebComponentProps } from '../../types/Page';
import { EntityDict } from 'oak-domain/lib/base-app-domain';
import { Item } from './types';
export default function Render(props: WebComponentProps<EntityDict, keyof EntityDict, false, {
    entity: string;
    actions: string[];
    items: Item[];
    spaceProps: SpaceProps;
    mode: 'cell' | 'table-cell';
    column: 3;
}, {
    getActionName: (action?: string) => string;
    getAlertOptions: (item: Item) => {
        title: string;
        content: string;
        okText: string;
        cancelText: string;
    };
}>): JSX.Element | null;
