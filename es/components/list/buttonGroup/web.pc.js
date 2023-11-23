import { jsx as _jsx } from "react/jsx-runtime";
import { Space, Button } from 'antd';
export default function Render(props) {
    const { methods, data: oakData } = props;
    const { items } = oakData;
    // 为了i18更新时能够重新渲染
    return (_jsx(Space, { children: items.filter((ele) => ele.show).map((ele) => (_jsx(Button, { type: ele.type, onClick: ele.onClick, children: ele.label }))) }));
}
