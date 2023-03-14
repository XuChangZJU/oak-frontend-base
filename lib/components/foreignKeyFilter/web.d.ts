/// <reference types="react" />
import { WebComponentProps } from '../../types/Page';
import { ED } from '../../types/AbstractComponent';
import { ColumnProps } from '../../types/Filter';
export default function Render<ED2 extends ED>(props: WebComponentProps<ED, keyof ED, false, {
    entity: keyof ED2;
    column: ColumnProps<ED2, keyof ED2>;
    onSearch: () => void;
    formItem: boolean;
}, {
    getNamedFilter: (name: string) => Record<string, any>;
    getRefByAttr: <T extends keyof ED2>(entity: T, attr: keyof ED2[T]['OpSchema']) => {
        entity: keyof ED2;
        attr: string;
        attrType: string;
        entityI18n: keyof ED2;
        attrI18n: string;
        attribute: Record<string, any>;
    };
    getEntityData: (entity: keyof ED2, ids: string[]) => ED2[keyof ED2]['Schema'][];
}>): JSX.Element | null;
