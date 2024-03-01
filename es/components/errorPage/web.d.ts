import React from 'react';
import { WebComponentProps } from '../../types/Page';
import { ED } from '../../types/AbstractComponent';
import { ECode } from '../../types/ErrorPage';
import './web.less';
interface IErrorPageProps {
    code: ECode;
    title?: string;
    desc?: string;
    children?: React.ReactNode;
    icon?: React.ReactNode;
}
export default function Render(props: WebComponentProps<ED, keyof ED, false, IErrorPageProps, {
    goBack: (delta?: number) => void;
}>): React.JSX.Element;
export {};
