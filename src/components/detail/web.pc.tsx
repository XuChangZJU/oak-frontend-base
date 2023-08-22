import React, { useState, useEffect } from 'react';
import { Tag, Descriptions, Image, Card, Breakpoint, Space } from 'antd';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { WebComponentProps } from '../../types/Page';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { ColorDict } from 'oak-domain/lib/types/Style';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import styles from './web.module.less';
import dayjs from 'dayjs';

import { AttrRender } from '../../types/AbstractComponent';


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
        EntityDict & BaseEntityDict,
        keyof EntityDict,
        false,
        {
            entity: string;
            title: string;
            bordered: boolean;
            layout: 'horizontal' | 'vertical'
            // data: any[];
            handleClick?: (id: string, action: string) => void;
            colorDict: ColorDict<EntityDict & BaseEntityDict>;
            dataSchema: StorageSchema<EntityDict>;
            column: number | Record<Breakpoint, number>;
            renderData: AttrRender[];
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
        layout = "horizontal",
    } = oakData;

    return (
        <Descriptions title={title} column={column} bordered={bordered} layout={layout}>
            {renderData?.map((ele) => {
                let renderValue = ele.value || t('not_filled_in');
                if ([null, '', undefined].includes(renderValue)) {
                    renderValue = t('not_filled_in');
                }
                const color = colorDict && colorDict[entity]?.[ele.attr]?.[ele.value] as string || 'default';
                if (ele.type === 'enum') {
                    renderValue = ele.value && t(`${entity}:v.${ele.attr}.${ele.value}`)
                }
                if (ele.type === 'datetime') {
                    renderValue = ele.value && dayjs(ele.value).format('YYYY-MM-DD');
                }
                return (
                    <Descriptions.Item label={ele.label} span={ele.span || 1}>
                        <RenderRow type={ele.type} value={renderValue} color={color} />
                    </Descriptions.Item>
                )
            })}
        </Descriptions>
    );
}
