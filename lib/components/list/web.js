"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var antd_1 = require("antd");
var actionBtn_1 = tslib_1.__importDefault(require("../actionBtn"));
var mobile_module_less_1 = tslib_1.__importDefault(require("./mobile.module.less"));
var antd_mobile_1 = require("antd-mobile");
var renderCell_1 = tslib_1.__importDefault(require("./renderCell"));
function Render(props) {
    var methods = props.methods, data = props.data;
    var t = methods.t;
    var oakLoading = data.oakLoading, entity = data.entity, extraActions = data.extraActions, mobileData = data.mobileData, onAction = data.onAction, _a = data.disabledOp, disabledOp = _a === void 0 ? false : _a, rowSelection = data.rowSelection;
    var useSelect = !!(rowSelection === null || rowSelection === void 0 ? void 0 : rowSelection.type);
    var _b = tslib_1.__read((0, react_1.useState)([]), 2), selectedRowKeys = _b[0], setSelectedRowKeys = _b[1];
    return ((0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ className: mobile_module_less_1.default.container }, { children: oakLoading ? ((0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ className: mobile_module_less_1.default.loadingView }, { children: (0, jsx_runtime_1.jsx)(antd_1.Spin, { size: 'large' }) }))) : ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: mobileData && mobileData.map(function (ele) {
                var _a, _b;
                return ((0, jsx_runtime_1.jsxs)("div", tslib_1.__assign({ style: { display: 'flex', alignItems: 'center', flex: 1 } }, { children: [useSelect && ((0, jsx_runtime_1.jsx)(antd_mobile_1.Checkbox, { checked: selectedRowKeys.includes(ele.record.id), onChange: function (checked) {
                                if (checked) {
                                    selectedRowKeys.push(ele.record.id);
                                    setSelectedRowKeys(tslib_1.__spreadArray([], tslib_1.__read(selectedRowKeys), false));
                                }
                                else {
                                    var index = selectedRowKeys.findIndex(function (ele2) { return ele2 === ele.record.id; });
                                    selectedRowKeys.splice(index, 1);
                                    setSelectedRowKeys(tslib_1.__spreadArray([], tslib_1.__read(selectedRowKeys), false));
                                }
                            } })), (0, jsx_runtime_1.jsxs)("div", tslib_1.__assign({ className: mobile_module_less_1.default.card, onClick: function () {
                                var _a, _b, _c;
                                var index = selectedRowKeys.findIndex(function (ele2) { var _a; return ele2 === ((_a = ele.record) === null || _a === void 0 ? void 0 : _a.id); });
                                var keys = selectedRowKeys;
                                if ((rowSelection === null || rowSelection === void 0 ? void 0 : rowSelection.type) === 'checkbox') {
                                    if (index !== -1) {
                                        keys.splice(index, 1);
                                    }
                                    else {
                                        keys.push((_a = ele.record) === null || _a === void 0 ? void 0 : _a.id);
                                    }
                                    setSelectedRowKeys(tslib_1.__spreadArray([], tslib_1.__read(selectedRowKeys), false));
                                }
                                else {
                                    keys = [(_b = ele.record) === null || _b === void 0 ? void 0 : _b.id];
                                    setSelectedRowKeys([(_c = ele.record) === null || _c === void 0 ? void 0 : _c.id]);
                                }
                                (rowSelection === null || rowSelection === void 0 ? void 0 : rowSelection.onChange) && (rowSelection === null || rowSelection === void 0 ? void 0 : rowSelection.onChange(keys, ele.record, { type: rowSelection.type === 'checkbox' ? 'multiple' : 'single' }));
                            } }, { children: [(0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ className: mobile_module_less_1.default.cardContent }, { children: ele.data.map(function (ele2) { return ((0, jsx_runtime_1.jsxs)("div", tslib_1.__assign({ className: mobile_module_less_1.default.textView }, { children: [(0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ className: mobile_module_less_1.default.label }, { children: ele2.label })), (0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ className: mobile_module_less_1.default.value }, { children: (0, jsx_runtime_1.jsx)(renderCell_1.default, { value: ele2.value, type: ele2.type }) }))] }))); }) })), !disabledOp && ((0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ style: { display: 'flex', alignItems: 'center', padding: 10 } }, { children: (0, jsx_runtime_1.jsx)(actionBtn_1.default, { entity: entity, extraActions: extraActions, actions: (_a = ele.record) === null || _a === void 0 ? void 0 : _a['#oakLegalActions'], cascadeActions: (_b = ele.record) === null || _b === void 0 ? void 0 : _b['#oakLegalCascadeActions'], onAction: function (action, cascadeAction) { return onAction && onAction(ele.record, action, cascadeAction); } }) })))] }))] })));
            }) })) })));
}
exports.default = Render;
