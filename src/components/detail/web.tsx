import React, { useState, useEffect } from 'react';
import { Tag, Descriptions, Image } from 'antd';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { WebComponentProps } from '../../types/Page';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { ColorDict } from 'oak-domain/lib/types/Style';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
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

export default function Render(
    props: WebComponentProps<
        EntityDict & BaseEntityDict,
        keyof EntityDict,
        false,
        {
            entity: string;
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
        entity,
        handleClick,
        colorDict,
        dataSchema,
        column = DEFAULT_COLUMN_MAP,
        renderData,
    } = oakData;

    const data = renderData.map((ele) => {
        const item = {
            label: ele.label,
            span: 1,
            value: ele.value,
        };
        // 类型如果是日期占两格，文本类型占4格
        if (ele?.type === 'datetime') {
            Object.assign(item, { span: 2 });
        }
        if (ele?.type === 'text') {
            Object.assign(item, { span: 4 });
        }
        // //类型如果是枚举，用tag
        // if (ele?.type === 'enum') {
        //     Object.assign(item, {
        //         value: (
        //             <Tag color={colorDict![entity]![attr]![String(ele.value)]}>
        //                 {ele.value}
        //             </Tag>
        //         ),
        //     });
        // }
        if (ele?.type === 'image') {
            Object.assign(item, {
                value: <Image src={ele.value} />,
                span: 4,
            });
        }
        return Object.assign(item, typeof ele !== 'string' && ele);
    });

    return (
        <Descriptions column={column}>
            {data?.map((ele) => (
                <Descriptions.Item label={ele.label} span={ele.span || 1}>
                    {ele.value}
                </Descriptions.Item>
            ))}
        </Descriptions>
    );
}
