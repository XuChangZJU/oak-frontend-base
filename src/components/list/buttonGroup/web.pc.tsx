import React from 'react';
import { Space, Button } from 'antd';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { WebComponentProps } from '../../../types/Page';
import { ListButtonProps, ED } from '../../../types/AbstractComponent';

export default function Render(
    props: WebComponentProps<
        ED,
        keyof EntityDict,
        false,
        {
            items: ListButtonProps[];
        },
        {}
    >
) {
    const { methods, data } = props;
    const { items } = data;
    if (!items || items.length === 0) {
        return null;
    }
    return (
        <Space>
            {items?.filter((ele) => ele.show)
                .map((ele, index) => (
                    <Button
                        key={`c_buttonGroup_${index}`}
                        type={ele.type}
                        onClick={ele.onClick}
                    >
                        {ele.label}
                    </Button>
                ))}
        </Space>
    );
}
