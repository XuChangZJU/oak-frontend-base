import { EntityDict } from 'oak-domain/lib/types/Entity';
import { WebComponentProps } from '../../types/Page';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { ColorDict } from 'oak-domain/lib/types/Style';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { AttrRender, OakAbsAttrJudgeDef } from '../../types/AbstractComponent';
export type ColSpanType = 1 | 2 | 3 | 4;
type ColumnMapType = {
    xxl: ColSpanType;
    xl: ColSpanType;
    lg: ColSpanType;
    md: ColSpanType;
    sm: ColSpanType;
    xs: ColSpanType;
};
export default function Render(props: WebComponentProps<EntityDict & BaseEntityDict, keyof EntityDict, false, {
    entity: string;
    title: string;
    bordered: boolean;
    layout: 'horizontal' | 'vertical';
    data: any;
    handleClick?: (id: string, action: string) => void;
    colorDict: ColorDict<EntityDict & BaseEntityDict>;
    dataSchema: StorageSchema<EntityDict>;
    column: ColumnMapType;
    renderData: AttrRender[];
    judgeAttributes: OakAbsAttrJudgeDef[];
}, {}>): import("react/jsx-runtime").JSX.Element;
export {};
