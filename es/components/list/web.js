import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Spin } from 'antd';
import ActionBtn from '../actionBtn';
import styles from './mobile.module.less';
import { Checkbox } from 'antd-mobile';
import RenderCell from './renderCell';
export default function Render(props) {
    const { methods, data } = props;
    const { t } = methods;
    const { oakLoading, entity, extraActions, mobileData, onAction, disabledOp = false, rowSelection } = data;
    const useSelect = !!rowSelection?.type;
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    return (_jsx("div", { className: styles.container, children: oakLoading ? (_jsx("div", { className: styles.loadingView, children: _jsx(Spin, { size: 'large' }) })) : (_jsx(_Fragment, { children: mobileData && mobileData.map((ele) => (_jsxs("div", { style: { display: 'flex', alignItems: 'center', flex: 1 }, children: [useSelect && (_jsx(Checkbox, { checked: selectedRowKeys.includes(ele.record.id), onChange: (checked) => {
                            if (checked) {
                                selectedRowKeys.push(ele.record.id);
                                setSelectedRowKeys([...selectedRowKeys]);
                            }
                            else {
                                const index = selectedRowKeys.findIndex((ele2) => ele2 === ele.record.id);
                                selectedRowKeys.splice(index, 1);
                                setSelectedRowKeys([...selectedRowKeys]);
                            }
                        } })), _jsxs("div", { className: styles.card, onClick: () => {
                            const index = selectedRowKeys.findIndex((ele2) => ele2 === ele.record?.id);
                            let keys = selectedRowKeys;
                            if (rowSelection?.type === 'checkbox') {
                                if (index !== -1) {
                                    keys.splice(index, 1);
                                }
                                else {
                                    keys.push(ele.record?.id);
                                }
                                setSelectedRowKeys([...selectedRowKeys]);
                            }
                            else {
                                keys = [ele.record?.id];
                                setSelectedRowKeys([ele.record?.id]);
                            }
                            rowSelection?.onChange && rowSelection?.onChange(keys, ele.record, { type: rowSelection.type === 'checkbox' ? 'multiple' : 'single' });
                        }, children: [_jsx("div", { className: styles.cardContent, children: ele.data.map((ele2) => (_jsxs("div", { className: styles.textView, children: [_jsx("div", { className: styles.label, children: ele2.label }), _jsx("div", { className: styles.value, children: _jsx(RenderCell, { value: ele2.value, type: ele2.type }) })] }))) }), !disabledOp && (_jsx("div", { style: { display: 'flex', alignItems: 'center', padding: 10 }, children: _jsx(ActionBtn, { entity: entity, extraActions: extraActions, actions: ele.record?.['#oakLegalActions'], cascadeActions: ele.record?.['#oakLegalCascadeActions'], onAction: (action, cascadeAction) => onAction && onAction(ele.record, action, cascadeAction) }) }))] })] }))) })) }));
}
