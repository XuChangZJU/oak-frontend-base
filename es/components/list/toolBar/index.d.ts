import { ButtonProps } from 'antd';
type buttonProps = {
    label: string;
    type?: ButtonProps['type'];
    onClick: () => void;
};
type ToolBarProps = {
    title?: string;
    buttonGroup?: buttonProps[];
    reload: () => void;
};
declare function ToolBar(props: ToolBarProps): import("react/jsx-runtime").JSX.Element;
export default ToolBar;
