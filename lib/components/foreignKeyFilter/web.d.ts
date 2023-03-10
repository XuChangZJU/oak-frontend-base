/// <reference types="react" />
import { WebComponentProps } from '../../types/Page';
import { ED } from '../../types/AbstractComponent';
import { ColumnProps } from '../../types/Filter';
export default function Render(props: WebComponentProps<ED, keyof ED, false, {
    entity: keyof ED;
    column: ColumnProps;
    onSearch: () => void;
    formItem: boolean;
}, {
    getNamedFilter: (name: string) => Record<string, any>;
    getRefByAttr: (entity: keyof ED, attr: string) => {
        entity: keyof ED;
        attr: string;
        attrType: string;
        entityI18n: keyof ED;
        attrI18n: string;
        attribute: Record<string, any>;
    };
    getEntityData: (entity: keyof ED, ids: string[]) => ED[keyof ED]['Schema'][];
}>): JSX.Element | null;
