/// <reference types="react" />
import { WebComponentProps, RowWithActions } from '../../types/Page';
import { ED } from '../../types/AbstractComponent';
export default function Render(props: WebComponentProps<ED, keyof ED, false, {
    entity: keyof ED;
    rows: RowWithActions<ED, keyof ED>[];
    projection: Record<string, any>;
    onSelect: (rows: RowWithActions<ED, keyof ED>[]) => void;
    multiple: boolean;
    titleLabel: string;
}, {}>): JSX.Element;
