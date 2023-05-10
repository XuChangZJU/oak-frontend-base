/// <reference types="react" />
import { WebComponentProps } from '../../../types/Page';
import { AuthCascadePath, EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
declare type ED = EntityDict & BaseEntityDict;
export default function render(props: WebComponentProps<ED, 'directRelationAuth', true, {
    paths: AuthCascadePath<ED>[];
    directRelationAuths?: ED['directRelationAuth']['OpSchema'][];
    relationId: string;
}, {
    onChange: (checked: boolean, path: AuthCascadePath<ED>, directRelationAuth?: ED['directRelationAuth']['OpSchema']) => void;
    confirm: () => void;
}>): JSX.Element;
export {};
