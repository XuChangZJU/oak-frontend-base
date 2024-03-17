import React from 'react';
import { Button, Space } from 'antd';
export default function Render(props) {
    const { actionss, onActionClick } = props.data;
    // icon方案还未最终确定
    if (actionss) {
        return (<Space>
                {actionss.map((ele) => (<Button color="primary" type="default" onClick={() => onActionClick(ele.action)}>
                        {ele.label}
                    </Button>))}
            </Space>);
    }
    return null;
}
