"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var antd_mobile_1 = require("antd-mobile");
var picker_1 = tslib_1.__importDefault(require("../picker"));
function render(props) {
    var _a = props.data, pickerRender = _a.pickerRender, renderValue = _a.renderValue, data = _a.data, multiple = _a.multiple, onChange = _a.onChange, entityId = _a.entityId, entityIds = _a.entityIds;
    var t = props.methods.t;
    var mode = pickerRender.mode;
    var _b = tslib_1.__read((0, react_1.useState)(false), 2), visibile = _b[0], setVisible = _b[1];
    if (!data && mode !== 'list') {
        return (0, jsx_runtime_1.jsx)("div", { children: " loading... " });
    }
    else {
        switch (mode) {
            case 'select': {
                return ((0, jsx_runtime_1.jsx)(antd_mobile_1.Selector, { value: [entityId], onChange: function (value) {
                        if (multiple) {
                            onChange(value);
                        }
                        else {
                            onChange(value[0]);
                        }
                    }, options: data.map(function (ele) { return ({
                        value: ele.id,
                        label: ele.title,
                    }); }), multiple: multiple }));
            }
            case 'radio': {
                if (multiple) {
                    return ((0, jsx_runtime_1.jsx)(antd_mobile_1.Checkbox.Group, tslib_1.__assign({ value: entityIds, onChange: onChange }, { children: data.map(function (ele) { return ((0, jsx_runtime_1.jsx)(antd_mobile_1.Checkbox, tslib_1.__assign({ value: ele.id }, { children: ele.title }))); }) })));
                }
                return ((0, jsx_runtime_1.jsx)(antd_mobile_1.Radio.Group, tslib_1.__assign({ onChange: function (value) { return onChange(value); }, value: entityId }, { children: data.map(function (ele) { return (0, jsx_runtime_1.jsx)(antd_mobile_1.Radio, tslib_1.__assign({ value: ele.id }, { children: ele.title })); }) })));
            }
            case 'list': {
                var entity = pickerRender.entity, projection = pickerRender.projection, title = pickerRender.title, titleLabel = pickerRender.titleLabel, filter = pickerRender.filter, sorter = pickerRender.sorter, required = pickerRender.required;
                var p = typeof projection === 'function' ? projection() : projection;
                var f = typeof filter === 'function' ? filter() : filter;
                var s = typeof sorter === 'function' ? sorter() : sorter;
                return ((0, jsx_runtime_1.jsxs)(antd_mobile_1.Space, { children: [(0, jsx_runtime_1.jsx)(antd_mobile_1.Input, { value: renderValue, clearable: !required, onClick: function () { return setVisible(true); }, onChange: function (value) {
                                if (!value) {
                                    onChange(undefined);
                                }
                            } }), (0, jsx_runtime_1.jsx)(antd_mobile_1.Popup, tslib_1.__assign({ visible: visibile, closeOnMaskClick: true, onClose: function () { return setVisible(false); }, destroyOnClose: true, showCloseButton: true, bodyStyle: {
                                height: '80%',
                            } }, { children: (0, jsx_runtime_1.jsx)(picker_1.default, { oakPath: "$refAttr-picker-".concat(entity), entity: entity, title: title, titleLabel: titleLabel, oakProjection: p, oakFilters: f ? [f] : undefined, oakSorters: s, onSelect: function (_a) {
                                    var _b = tslib_1.__read(_a, 1), id = _b[0].id;
                                    onChange(id);
                                    setVisible(false);
                                } }) }))] }));
            }
        }
    }
}
exports.default = render;
