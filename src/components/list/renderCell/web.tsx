import React from 'react';
import { Space, Typography } from 'antd';
import ImgBox from '../../imgBox';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { WebComponentProps } from '../../../types/Page';
import { OakAbsDerivedAttrDef } from '../../../types/AbstractComponent';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';

const { Link, Text } = Typography;

export default function Render(
    props: WebComponentProps<
        EntityDict & BaseEntityDict,
        keyof EntityDict,
        false,
        {
            value: string | string[];
            type: OakAbsDerivedAttrDef['type'],
            color: string;
        },
        {
        }
    >
) {
    const { methods, data: oakData } = props;
    const {
       value, type, color
    } = oakData;
    if (value === null || value === '' || value === undefined) {
        return (<>--</>);
    }
    else if (type === 'image') {
        if (value instanceof Array) {
            return (
                <Space>
                    {value.map((ele) => (
                        <ImgBox src={ele} width={100} height={60} />
                    ))}
                </Space>
            )
        }
        return (
            <ImgBox src={value} width={100} height={60} />
        )
    }
    else if (type === 'link') {
        if (value instanceof Array) {
            return (
                <Space direction="vertical">
                    {value.map((ele) => (
                        <Link href={ele} target="_blank" ellipsis>
                            {ele}
                        </Link>
                    ))}
                </Space>
            )
        }
        return (
            <Link href={value} target="_blank" ellipsis>
                {value}
            </Link>
        )
    }
    return (
        <Text ellipsis>
            {value}
        </Text>
    )
}
