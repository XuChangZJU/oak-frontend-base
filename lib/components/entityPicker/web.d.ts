/// <reference types="react" />
import { WebComponentProps } from '../../types/Page';
import { ED } from '../../types/AbstractComponent';
export default function Render(props: WebComponentProps<ED, keyof ED, false, {
    entity: string;
    rows: ED[keyof ED]['Schema'][];
    projection: Record<string, any>;
    onSelect: (rows: ED[keyof ED]['Schema'][]) => void;
    multiple: boolean;
    titleLabel: string;
}, {}>): JSX.Element;
