import React, { useState, useEffect } from 'react';
import { Space, Tag, Tooltip, Typography } from 'antd';
import ImgBox from '../../imgBox';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { WebComponentProps } from '../../../types/Page';
import { OakAbsDerivedAttrDef } from '../../../types/AbstractComponent';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';

const { Link } = Typography;

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
    // 属性类型是enum要使用标签
    else if (type === 'enum') {
        let renderColor = color;
        // web端的Tag组件没有primary 和 danger
        if (renderColor === 'primary') {
            renderColor = 'processing';
        }
        if (renderColor === 'danger') {
            renderColor = 'error'
        }
        return (
            <Tag color={renderColor} >
                {value}
            </Tag>
        )
    }
    else if (type === 'image') {
        if (value instanceof Array) {
            return (
                <Space>
                    {value.map((ele) => (
                        <ImgBox src={ele} width={120} height={70} />
                    ))}
                </Space>
            )
        }
        return (
            <ImgBox src={value} width={120} height={70} />
        )
    }
    else if (type === 'link') {
        if (value instanceof Array) {
            return (
                <Space direction="vertical">
                    {value.map((ele) => (
                        <Link href={ele} target="_blank">
                            {ele}
                        </Link>
                    ))}
                </Space>
            )
        }
        return (
            <Link href={value} target="_blank">
                {value}
            </Link>
        )
    }
    return (
        <Tooltip placement="topLeft" title={value}>
            {value}
        </Tooltip>
    )
}
