import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import { WebComponentProps, RowWithActions } from '../../types/Page';
import { ED } from '../../types/AbstractComponent';
import AbstractList from '../list';

import Style from './web.module.less';

export default function Render(
    props: WebComponentProps<
        ED,
        keyof ED,
        false,
        {
            entity: keyof ED;
            rows: RowWithActions<ED, keyof ED>[];
            projection: Record<string, any>;
            onSelect: (rows: RowWithActions<ED, keyof ED>[]) => void;
            multiple: boolean;
            titleLabel: string;
        },
        {}
    >
) {
    const {
        oakLoading,
        rows,
        onSelect,
        titleLabel,
        multiple = false,
        entity,
    } = props.data;
    const { t } = props.methods;

    const columns = [{
        dataIndex: 'title',
        title: titleLabel,
    }]

    if (rows && rows.length) {
        return (
            <AbstractList
                entity={entity}
                data={rows}
                loading={oakLoading}
                attributes={[titleLabel]}
                disabledOp={true}
                rowSelection={{
                    type: multiple ? 'checkbox' : 'radio',
                    onChange: (selectRowKeys, selectedRows, info) => {
                        onSelect(selectedRows);
                    }
                }}
            />
        )
    }
    return (
        <div>无数据</div>
    )
}
