import React from 'react';
import { ButtonProps } from 'antd';
type buttonProps = {
    label: string;
    type?: ButtonProps['type'];
    onClick: () => void;
};
type ToolBarProps = {
    title?: React.ReactNode;
    buttonGroup?: buttonProps[];
    extraContent?: React.ReactNode;
    reload: () => void;
};
declare function ToolBar(props: ToolBarProps): React.JSX.Element;
export default ToolBar;
