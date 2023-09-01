import React, { useState, useEffect } from 'react';
import { Space, Button, Avatar } from 'antd';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { WebComponentProps } from '../../../types/Page';
import { ListButtonProps } from '../../../types/AbstractComponent';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';

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
    const { methods, data: oakData } = props;
    const {
       items
    } = oakData;
    // 为了i18更新时能够重新渲染
    return (
        <Space>
            {items.filter((ele) => ele.show).map((ele) => (
                <Button type={ele.type} onClick={ele.onClick}>
                    {ele.label}
                </Button>
            ))}
        </Space>
    );
}
