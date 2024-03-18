import React, { useState, useEffect } from 'react';
import { Tag, Descriptions, Image, Card, Breakpoint, Space } from 'antd';
import { WebComponentProps } from '../../types/Page';
import { ColorDict } from 'oak-domain/lib/types/Style';
import styles from './web.module.less';

import {
    AttrRender,
    OakAbsAttrJudgeDef,
    OakAbsDerivedAttrDef,
    ED,
} from '../../types/AbstractComponent';
import { getLabel, getType, getValue, getWidth } from '../../utils/usefulFn';
import { get } from 'oak-domain/lib/utils/lodash';


function RenderRow(props: { value: any; color: string; type: AttrRender['type'] }) {
    const { type, value, color } = props;
    if (type === 'image') {
        if (value instanceof Array) {
            return (
                <Space wrap>
                    {value.map((ele) => (
                        <Image width={100} height={100} src={ele} style={{objectFit: 'contain'}} />
                    ))}
                </Space>
        )
        }
        else {
            return (
                <Space wrap>
                    <Image width={100} height={100} src={value} style={{objectFit: 'contain'}} />
                </Space>
            )
        }
    }
    if (type === 'enum') {
        <Tag color={color}>
            {value}
        </Tag>
    }
    return value;
}


export default function Render(
    props: WebComponentProps<
        ED,
        keyof ED,
        false,
        {
            entity: string;
            title: string;
            bordered: boolean;
            layout: 'horizontal' | 'vertical';
            data: any;
            handleClick?: (id: string, action: string) => void;
            colorDict: ColorDict<ED>;
            column: number | Record<Breakpoint, number>;
            renderData: AttrRender[];
            judgeAttributes: OakAbsAttrJudgeDef[];
        },
        {}
    >
) {
    const { methods, data: oakData } = props;
    const { t } = methods;
    const {
        entity,
        title,
        colorDict,
        bordered,
        column,
        renderData,
        layout = 'horizontal',
        judgeAttributes,
        data,
    } = oakData;

    return (
        <Descriptions
            title={title}
            column={column}
            bordered={bordered}
            layout={layout}
        >
            {judgeAttributes?.map((ele) => {
                let renderValue = getValue(
                    data,
                    ele.path,
                    ele.entity,
                    ele.attr,
                    ele.attrType,
                    t
                );
                let renderLabel = getLabel(
                    ele.attribute,
                    ele.entity,
                    ele.attr,
                    t
                );
                const renderType = getType(ele.attribute, ele.attrType);
                if ([null, '', undefined].includes(renderValue)) {
                    renderValue = t('not_filled_in');
                }
                const stateValue = get(data, ele.path);

                const color =
                    (colorDict &&
                        (colorDict[ele.entity]?.[ele.attr]?.[
                            stateValue
                        ] as string)) ||
                    'default';
                return (
                    <Descriptions.Item
                        label={renderLabel}
                        span={(ele.attribute as OakAbsDerivedAttrDef).span || 1}
                    >
                        <RenderRow
                            type={renderType!}
                            value={renderValue}
                            color={color}
                        />
                    </Descriptions.Item>
                );
            })}
        </Descriptions>
    );
}
