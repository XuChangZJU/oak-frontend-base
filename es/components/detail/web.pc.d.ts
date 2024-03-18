import React from 'react';
import { Breakpoint } from 'antd';
import { WebComponentProps } from '../../types/Page';
import { ColorDict } from 'oak-domain/lib/types/Style';
import { AttrRender, OakAbsAttrJudgeDef, ED } from '../../types/AbstractComponent';
export default function Render(props: WebComponentProps<ED, keyof ED, false, {
    entity: string;
    title: string;
    bordered: boolean;
    layout: 'horizontal' | 'vertical';
    data: any;
    handleClick?: (id: string, action: string) => void;
    colorDict: ColorDict<ED>;
    column: number | Record<Breakpoint, number>;
    renderData: AttrRender[];
    judgeAttributes: OakAbsAttrJudgeDef[];
}, {}>): React.JSX.Element;
