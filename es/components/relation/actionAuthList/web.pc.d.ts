import React from 'react';
import { WebComponentProps } from '../../../types/Page';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
type ED = EntityDict & BaseEntityDict;
type TableData = {
    relationId: string;
    relation: string;
    actions: string[];
};
export default function render(props: WebComponentProps<ED, 'actionAuth', true, {
    relations: EntityDict['relation']['Schema'][];
    actions: string[];
    datasource: TableData[];
    rows: ED['actionAuth']['Schema'][];
    path: string;
    entity: keyof ED;
    openTip: boolean;
    onClose: () => void;
}, {}>): React.JSX.Element;
export {};
