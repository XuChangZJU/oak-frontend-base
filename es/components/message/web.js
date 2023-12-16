import React, { useEffect } from 'react';
import { message } from 'antd';
export default function Render(props) {
    const [messageApi, contextHolder] = message.useMessage();
    const { data } = props.data;
    useEffect(() => {
        if (data) {
            messageApi[data.type](data);
        }
    }, [data]);
    return <>{contextHolder}</>;
}
