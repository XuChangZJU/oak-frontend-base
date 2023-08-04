import React, { useState, useEffect } from 'react';
import { Tag, Space, Image, Ellipsis } from 'antd-mobile';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { WebComponentProps } from '../../types/Page';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { ColorDict } from 'oak-domain/lib/types/Style';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import styles from './mobile.module.less';
import {
    DataType,
    DataTypeParams,
} from 'oak-domain/lib/types/schema/DataTypes';
import { AttrRender } from '../../types/AbstractComponent';

// type Width = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export type ColSpanType = 1 | 2 | 3 | 4;
type ColumnMapType = {
    xxl: ColSpanType;
    xl: ColSpanType;
    lg: ColSpanType;
    md: ColSpanType;
    sm: ColSpanType;
    xs: ColSpanType;
};

const DEFAULT_COLUMN_MAP: ColumnMapType = {
    xxl: 4,
    xl: 4,
    lg: 4,
    md: 3,
    sm: 2,
    xs: 1,
};

// function getColumn(column: ColSpanType | ColumnMapType, width: Width) {
//     if (typeof column === 'number') {
//         return column;
//     }

//     if (typeof column === 'object') {
//         if (column[width] !== undefined) {
//             return column[width] || DEFAULT_COLUMN_MAP[width];
//         }
//     }

//     return 3;
// }

function RenderRow(props: { label: string; value: any; type: AttrRender['type'] }) {
    const { type, label, value } = props;
    if (type === 'img') {
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
            <Ellipsis direction='end' content={value} />
        </div>
    )
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
            column: ColumnMapType;
            renderData: AttrRender[];
        },
        {}
    >
) {
    const { methods, data: oakData } = props;
    const { t } = methods;
    const {
        title,
        renderData,
    } = oakData;

    return (
        <div className={styles.panel}>
            {title && (
                <div className={styles.title}>
                    {title}
                </div>
            )}
            <div className={styles.panel_content}>
                {renderData && renderData.map((ele) => (
                    <RenderRow label={ele.label} value={ele.value} type={ele.type} />
                ))}
            </div>
        </div>
    );
}
