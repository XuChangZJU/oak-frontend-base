import React from 'react';

import { Space, Tag, Tooltip, Typography } from 'antd';

import { OakAbsDerivedAttrDef } from '../../../types/AbstractComponent';
import ImgBox from '../../imgBox';

const { Link } = Typography;

type Props = {
    value: string | string[];
    type: OakAbsDerivedAttrDef['type'],
    color: string;
}

function TableCell(props: Props) {
    const { value, type, color } = props;
    if (!value) {
        return (<>--</>);
    }
    // 属性类型是enum要使用标签
    else if (type === 'enum') {
        return (
            <Tag color={color} >
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

export default TableCell;