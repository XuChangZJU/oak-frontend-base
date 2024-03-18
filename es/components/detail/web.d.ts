import React from 'react';
import { WebComponentProps } from '../../types/Page';
import { ColorDict } from 'oak-domain/lib/types/Style';
import { AttrRender, OakAbsAttrJudgeDef, ED } from '../../types/AbstractComponent';
export type ColSpanType = 1 | 2 | 3 | 4;
type ColumnMapType = {
    xxl: ColSpanType;
    xl: ColSpanType;
    lg: ColSpanType;
    md: ColSpanType;
    sm: ColSpanType;
    xs: ColSpanType;
};
export default function Render(props: WebComponentProps<ED, keyof ED, false, {
    entity: string;
    title: string;
    bordered: boolean;
    layout: 'horizontal' | 'vertical';
    data: any;
    handleClick?: (id: string, action: string) => void;
    colorDict: ColorDict<ED>;
    column: ColumnMapType;
    renderData: AttrRender[];
    judgeAttributes: OakAbsAttrJudgeDef[];
}, {}>): React.JSX.Element;
export {};
