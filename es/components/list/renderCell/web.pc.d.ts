import React from 'react';
import { WebComponentProps } from '../../../types/Page';
import { OakAbsDerivedAttrDef, ED } from '../../../types/AbstractComponent';
export default function Render(props: WebComponentProps<ED, keyof ED, false, {
    value: string | string[];
    type: OakAbsDerivedAttrDef['type'];
    color: string;
    linkUrl: string;
}, {}>): React.JSX.Element;
