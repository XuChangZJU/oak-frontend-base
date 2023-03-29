import React from 'react';
import {
    Space,
    Button,
    Modal,
    Divider,
    Popover,
    Typography,
} from 'antd';
import {
  MoreOutlined,
} from '@ant-design/icons';
import { ActionDef, WebComponentProps } from '../../types/Page';
import { ED } from '../../types/AbstractComponent';

import { EntityDict } from 'oak-domain/lib/types/Entity';
import Style from './mobile.module.less';

export default function Render(
    props: WebComponentProps<
        ED,
        keyof EntityDict,
        false,
        {
            items: { label: string; onClick: () => void }[];
            moreItems: { label: string; onClick: () => void }[];
        },
        {
        }
    >
) {
    const { methods, data } = props;
    const { t } = methods;
    const {
        items,
        moreItems,
    } = data;
    
    return (
        <div className={Style.container}>
            {items && items.map((ele, index:number) => (
                <>
                    <div className={Style.btn} onClick={ele.onClick}>
                        <Typography.Link>
                            {ele.label}
                        </Typography.Link>
                    </div>
                    {index !== items.length - 1 && (
                        <Divider type="vertical"></Divider>
                    )}
                </>
            ))}
            <Divider type="vertical" />
            {moreItems && moreItems.length > 0 && (
                <Popover
                    placement='topRight'
                    content={
                        <Space direction="vertical">
                            {moreItems.map((ele) => (
                                <Button size="small" type="link" onClick={ele.onClick}>
                                    {ele.label}
                                </Button>
                            ))}
                        </Space>
                    }
                    trigger="click"
                >
                    <Button type='link' icon={<MoreOutlined />}></Button>
                </Popover>
            )}
        </div>
    );
}
