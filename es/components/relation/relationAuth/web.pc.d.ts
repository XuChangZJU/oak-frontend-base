/// <reference types="react" />
import { WebComponentProps } from '../../../types/Page';
import { ED } from '../../../types/AbstractComponent';
export default function render(props: WebComponentProps<ED, 'relationAuth', true, {
    relationIds: string[];
    relationAuths: ED['relationAuth']['OpSchema'][];
    auths: any[];
    sourceRelations: ED['relation']['OpSchema'][];
}, {
    onChange: (checked: boolean, relationId: string, path: string, relationAuths?: ED['relationAuth']['OpSchema'][]) => void;
    confirm: () => void;
}>): import("react").JSX.Element;
