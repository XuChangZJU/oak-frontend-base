import React from 'react';
import { Space, Button } from 'antd';
export default function Render(props) {
    const { methods, data: oakData } = props;
    const { items } = oakData;
    // 为了i18更新时能够重新渲染
    return (<Space>
            {items.filter((ele) => ele.show).map((ele) => (<Button type={ele.type} onClick={ele.onClick}>
                    {ele.label}
                </Button>))}
        </Space>);
}
