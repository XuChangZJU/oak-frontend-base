/// <reference types="react" />
import { WebComponentProps } from '../../types/Page';
import { ED } from '../../types/AbstractComponent';
import { ColumnProps, ValueType, ViewType } from '../../types/Filter';
export default function Render<ED2 extends ED>(props: WebComponentProps<ED2, keyof ED2, false, {
    entity: keyof ED2;
    column: ColumnProps<ED2, keyof ED2>;
    viewType: ViewType | undefined;
    searchValue: string;
    entityI18n: keyof ED2;
    attrI18n: string;
    options: {
        value: string | boolean;
    }[];
    isCommonI18n: boolean;
    onSearch: () => void;
}, {
    getNamedFilter: (name: string) => Record<string, any>;
    setFilterAndResetFilter: (viewType: ViewType, value?: ValueType) => void;
}>): JSX.Element | null;
