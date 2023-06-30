/// <reference types="react" />
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { WebComponentProps } from '../../../types/Page';
import { OakAbsDerivedAttrDef } from '../../../types/AbstractComponent';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
export default function Render(props: WebComponentProps<EntityDict & BaseEntityDict, keyof EntityDict, false, {
    value: string | string[];
    type: OakAbsDerivedAttrDef['type'];
    color: string;
}, {}>): JSX.Element;
