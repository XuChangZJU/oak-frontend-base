/// <reference types="react" />
import { WebComponentProps } from '../../../types/Page';
import { AuthCascadePath, EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
declare type ED = EntityDict & BaseEntityDict;
export default function render(props: WebComponentProps<ED, 'directActionAuth', true, {
    paths: AuthCascadePath<ED>[];
    directActionAuths?: ED['directActionAuth']['OpSchema'][];
    actions: string[];
}, {
    onChange: (checked: boolean, path: AuthCascadePath<ED>, directActionAuth?: ED['directActionAuth']['OpSchema']) => void;
    confirm: () => void;
}>): JSX.Element;
export {};
