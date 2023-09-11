import { jsx as _jsx } from "react/jsx-runtime";
// TODO 应该是要antd-mobile组件
import { FloatButton } from 'antd';
import { BarsOutlined, } from '@ant-design/icons';
export default function Render(props) {
    const { methods, data } = props;
    const { t } = methods;
    const { items } = data;
    if (items && items.length === 1) {
        const item = items[0];
        return (_jsx(FloatButton, { shape: "circle", type: "primary", style: { right: 24 }, icon: item.icon, description: item.icon ? null : item.label, onClick: () => item.onClick() }));
    }
    return (_jsx(FloatButton.Group, { shape: 'circle', trigger: "click", type: "primary", style: { right: 24 }, icon: _jsx(BarsOutlined, {}), children: items && items.map((ele) => (_jsx(FloatButton, { icon: ele.icon, description: ele.icon ? null : ele.label, onClick: () => ele.onClick() }))) }));
}
