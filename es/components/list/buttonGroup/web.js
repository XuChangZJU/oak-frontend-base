import React from 'react';
// TODO 应该是要antd-mobile组件
import { FloatButton } from 'antd';
import { BarsOutlined, } from '@ant-design/icons';
export default function Render(props) {
    const { methods, data } = props;
    const { items } = data;
    if (!items || items.length === 0) {
        return null;
    }
    if (items?.length === 1) {
        const item = items[0];
        return (<FloatButton shape="circle" type="primary" style={{ right: 24 }} icon={item.icon} description={item.icon ? null : item.label} onClick={() => item.onClick()}/>);
    }
    return (<FloatButton.Group shape="circle" trigger="click" type="primary" style={{ right: 24 }} icon={<BarsOutlined />}>
            {items?.map((ele, index) => (<FloatButton key={`c_buttonGroup_${index}`} icon={ele.icon} description={ele.icon ? null : ele.label} onClick={() => ele.onClick()}/>))}
        </FloatButton.Group>);
}
