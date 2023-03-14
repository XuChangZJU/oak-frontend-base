import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import { WebComponentProps } from '../../types/Page';
import { ED } from '../../types/AbstractComponent';

import Style from './web.module.less';

export default function Render(
    props: WebComponentProps<
        ED,
        keyof ED,
        false,
        {
            entity: string;
            rows: ED[keyof ED]['Schema'][];
            projection: Record<string, any>;
            onSelect: (rows: ED[keyof ED]['Schema'][]) => void;
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
    } = props.data;
    const { t } = props.methods;

    const columns = [{
        dataIndex: 'title',
        title: titleLabel,
    }]

    return (
        <>
            <Table
                loading={oakLoading}
                dataSource={rows}
                rowKey="id"
                rowSelection={{
                    type: multiple ? 'checkbox' : 'radio',
                    // onSelect: (record) => {
                    //     onSelect(record);
                    // },
                    onChange: (
                        selectedRowKeys,
                        selectedRows,
                        info
                    ) => {
                        onSelect(selectedRows);
                    },
                }}
                onRow={!multiple ? (record) => {
                    return {
                        onClick: (event) => {
                            onSelect([record]);
                        }, // 点击行
                    };
                } : undefined}
                columns={columns}
            />
        </>
    );
}
