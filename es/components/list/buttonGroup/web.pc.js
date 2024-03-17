import React from 'react';
import { Space, Button } from 'antd';
export default function Render(props) {
    const { methods, data } = props;
    const { items } = data;
    if (!items || items.length === 0) {
        return null;
    }
    return (<Space>
            {items
            ?.filter((ele) => ele.show)
            .map((ele, index) => (<Button key={`c_buttonGroup_${index}`} type={ele.type} onClick={ele.onClick} icon={ele.icon}>
                        {ele.label}
                    </Button>))}
        </Space>);
}
