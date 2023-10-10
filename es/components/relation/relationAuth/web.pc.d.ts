import { WebComponentProps } from '../../../types/Page';
import { AuthCascadePath, EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
type ED = EntityDict & BaseEntityDict;
export default function render(props: WebComponentProps<ED, 'relationAuth', true, {
    relationIds: string[];
    relationAuths: ED['relationAuth']['OpSchema'][];
    auths: AuthCascadePath<ED>[];
    sourceRelations: ED['relation']['OpSchema'][];
}, {
    onChange: (checked: boolean, relationId: string, path: string, relationAuths?: ED['relationAuth']['OpSchema'][]) => void;
    confirm: () => void;
}>): import("react/jsx-runtime").JSX.Element;
export {};
