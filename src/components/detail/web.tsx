import React, { useState, useEffect } from 'react';
import { Tag, Space, Image } from 'antd-mobile';
import { WebComponentProps } from '../../types/Page';
import { ColorDict } from 'oak-domain/lib/types/Style';
import styles from './mobile.module.less';
import { AttrRender, OakAbsAttrJudgeDef, ED } from '../../types/AbstractComponent';

import { getLabel, getType, getValue, getWidth } from '../../utils/usefulFn';

export type ColSpanType = 1 | 2 | 3 | 4;
type ColumnMapType = {
    xxl: ColSpanType;
    xl: ColSpanType;
    lg: ColSpanType;
    md: ColSpanType;
    sm: ColSpanType;
    xs: ColSpanType;
};


function RenderRow(props: { label: string; value: any; type: AttrRender['type'] }) {
    const { type, label, value } = props;
    if (type === 'image') {
        if (value instanceof Array) {
            return (
                <div className={styles.renderRow}>
                    <div className={styles.renderLabel}>
                        {label}
                    </div>
                    <Space wrap>
                        {value.map((ele) => (
                            <Image width={70} height={70} src={ele} fit="contain" />
                        ))}
                    </Space>
                </div>
            )
        }
        else {
            return (
                <div className={styles.renderRow}>
                    <div className={styles.renderLabel}>
                        {label}
                    </div>
                    <Space wrap>
                        <Image width={70} height={70} src={value} fit="contain" />
                    </Space>
                </div>
            )
        }
    }
    return (
        <div className={styles.renderRow}>
            <div className={styles.renderLabel}>
                {label}
            </div>
            <div className={styles.renderValue}>{value ? String(value) : '--'}</div>
        </div>
    )
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
            column: ColumnMapType;
            renderData: AttrRender[];
            judgeAttributes: OakAbsAttrJudgeDef[];
        },
        {}
    >
) {
    const { methods, data: oakData } = props;
    const { t } = methods;
    const { title, renderData, entity, judgeAttributes, data } = oakData;
    return (
        <div className={styles.panel}>
            {title && <div className={styles.title}>{title}</div>}
            <div className={styles.panel_content}>
                <Space direction="vertical" style={{ '--gap': '10px' }}>
                    {judgeAttributes &&
                        judgeAttributes.map((ele) => {
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
                            const renderType = getType(
                                ele.attribute,
                                ele.attrType
                            );
                            if ([null, '', undefined].includes(renderValue)) {
                                renderValue = t('not_filled_in');
                            }
                            return (
                                <RenderRow
                                    label={renderLabel}
                                    value={renderValue}
                                    type={renderType!}
                                />
                            );
                        })}
                </Space>
            </div>
        </div>
    );
}
