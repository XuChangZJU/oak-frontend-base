"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const antd_1 = require("antd");
const actionBtn_1 = tslib_1.__importDefault(require("../actionBtn"));
const mobile_module_less_1 = tslib_1.__importDefault(require("./mobile.module.less"));
const antd_mobile_1 = require("antd-mobile");
const renderCell_1 = tslib_1.__importDefault(require("./renderCell"));
function Render(props) {
    const { methods, data } = props;
    const { t } = methods;
    const { oakLoading, entity, extraActions, mobileData, onAction, disabledOp = false, rowSelection } = data;
    const useSelect = !!rowSelection?.type;
    const [selectedRowKeys, setSelectedRowKeys] = (0, react_1.useState)([]);
    return ((0, jsx_runtime_1.jsx)("div", { className: mobile_module_less_1.default.container, children: oakLoading ? ((0, jsx_runtime_1.jsx)("div", { className: mobile_module_less_1.default.loadingView, children: (0, jsx_runtime_1.jsx)(antd_1.Spin, { size: 'large' }) })) : ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: mobileData && mobileData.map((ele) => ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'center', flex: 1 }, children: [useSelect && ((0, jsx_runtime_1.jsx)(antd_mobile_1.Checkbox, { checked: selectedRowKeys.includes(ele.record.id), onChange: (checked) => {
                            if (checked) {
                                selectedRowKeys.push(ele.record.id);
                                setSelectedRowKeys([...selectedRowKeys]);
                            }
                            else {
                                const index = selectedRowKeys.findIndex((ele2) => ele2 === ele.record.id);
                                selectedRowKeys.splice(index, 1);
                                setSelectedRowKeys([...selectedRowKeys]);
                            }
                        } })), (0, jsx_runtime_1.jsxs)("div", { className: mobile_module_less_1.default.card, onClick: () => {
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
                        }, children: [(0, jsx_runtime_1.jsx)("div", { className: mobile_module_less_1.default.cardContent, children: ele.data.map((ele2) => ((0, jsx_runtime_1.jsxs)("div", { className: mobile_module_less_1.default.textView, children: [(0, jsx_runtime_1.jsx)("div", { className: mobile_module_less_1.default.label, children: ele2.label }), (0, jsx_runtime_1.jsx)("div", { className: mobile_module_less_1.default.value, children: (0, jsx_runtime_1.jsx)(renderCell_1.default, { value: ele2.value, type: ele2.type }) })] }))) }), !disabledOp && ((0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', alignItems: 'center', padding: 10 }, children: (0, jsx_runtime_1.jsx)(actionBtn_1.default, { entity: entity, extraActions: extraActions, actions: ele.record?.['#oakLegalActions'], cascadeActions: ele.record?.['#oakLegalCascadeActions'], onAction: (action, cascadeAction) => onAction && onAction(ele.record, action, cascadeAction) }) }))] })] }))) })) }));
}
exports.default = Render;
