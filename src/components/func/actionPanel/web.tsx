import React from 'react';
import { Button, Space } from 'antd-mobile';
import { ED } from '../../../types/AbstractComponent';
import { WebComponentProps } from '../../../types/Page';

import Style from './mobile.module.less';

export default function Render(
    props: WebComponentProps<
        ED,
        keyof ED,
        false,
        {
            actionss: Array<{
                icon: { name: string };
                label: string;
                action: string;
            }>;
            onActionClick: (action: string) => void;
        }
    >
) {
    const { actionss, onActionClick } = props.data;
    // icon方案还未最终确定
    if (actionss) {
        return (
            <Space wrap className={Style.container}>
                {actionss.map((ele) => (
                    <Button
                        color="primary"
                        fill="outline"
                        onClick={() => onActionClick(ele.action)}
                    >
                        {ele.label}
                    </Button>
                ))}
            </Space>
        );
    }
    return null;
}
