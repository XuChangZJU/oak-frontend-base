import React from 'react';
// TODO 应该是要antd-mobile组件
import { FloatButton } from 'antd';

import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { ListButtonProps } from '../../../types/AbstractComponent';
import { WebComponentProps } from '../../../types/Page';

import {
    BarsOutlined,
} from '@ant-design/icons';
type ED = EntityDict & BaseEntityDict;

export default function Render(
    props: WebComponentProps<
        EntityDict & BaseEntityDict,
        keyof EntityDict,
        false,
        {
            items: ListButtonProps[];
        },
        {
        }
    >
) {
    const { methods, data } = props;
    const { t } = methods;
    const {
       items
    } = data;
    if (items && items.length === 1) {
        const item = items[0];
        return (
            <FloatButton
                shape="circle"
                type="primary"
                style={{ right: 24 }}
                icon={item.icon}
                description={item.icon ? null : item.label}
                onClick={() => item.onClick()}
            />
        )
    }
    return (
        <FloatButton.Group
            shape='circle'
            trigger="click"
            type="primary"
            style={{ right: 24 }}
            icon={<BarsOutlined />}
        >
            {items && items.map((ele) => (
                <FloatButton
                    icon={ele.icon}
                    description={ele.icon ? null : ele.label}
                    onClick={() => ele.onClick()}
                />
            ))}
        </FloatButton.Group>
    );
}
