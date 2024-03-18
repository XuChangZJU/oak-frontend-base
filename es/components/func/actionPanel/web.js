import React from 'react';
import { Button, Space } from 'antd-mobile';
import Style from './mobile.module.less';
export default function Render(props) {
    const { actionss, onActionClick } = props.data;
    // icon方案还未最终确定
    if (actionss) {
        return (<Space wrap className={Style.container}>
                {actionss.map((ele) => (<Button color="primary" fill="outline" onClick={() => onActionClick(ele.action)}>
                        {ele.label}
                    </Button>))}
            </Space>);
    }
    return null;
}
