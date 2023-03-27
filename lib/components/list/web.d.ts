/// <reference types="react" />
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { WebComponentProps } from '../../types/Page';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { onActionFnDef } from '../../types/AbstractComponent';
export default function Render(props: WebComponentProps<EntityDict & BaseEntityDict, keyof EntityDict, false, {
    entity: string;
    extraActions: string[];
    mobileData: {
        title: any;
        rows: {
            label: string;
            value: string;
        }[];
        state: {
            color: string;
            value: string;
        };
        record: any;
    }[];
    onAction?: onActionFnDef;
    disabledOp: boolean;
}, {}>): JSX.Element;
