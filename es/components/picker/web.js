import { jsx as _jsx } from "react/jsx-runtime";
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
        return (_jsx(AbstractList, { entity: entity, data: rows, loading: oakLoading, attributes: [titleLabel], disabledOp: true, rowSelection: {
                type: multiple ? 'checkbox' : 'radio',
                onChange: (selectRowKeys, selectedRows, info) => {
                    onSelect(selectedRows);
                }
            } }));
    }
    return (_jsx("div", { children: _jsx(Empty, { image: Empty.PRESENTED_IMAGE_SIMPLE }) }));
}
