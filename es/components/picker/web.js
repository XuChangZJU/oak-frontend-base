import React from 'react';
import { Empty } from 'antd';
import AbstractList from '../list';
export default function Render(props) {
    const { oakLoading, rows, onSelect, titleLabel, multiple = false, entity, } = props.data;
    const { t } = props.methods;
    const columns = [{
            dataIndex: 'title',
            title: titleLabel,
        }];
    if (rows && rows.length) {
        return (<AbstractList entity={entity} data={rows} loading={oakLoading} attributes={[titleLabel]} disabledOp={true} rowSelection={{
                type: multiple ? 'checkbox' : 'radio',
                onChange: (selectRowKeys, selectedRows, info) => {
                    onSelect(selectedRows);
                }
            }}/>);
    }
    return (<div>
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>
        </div>);
}
