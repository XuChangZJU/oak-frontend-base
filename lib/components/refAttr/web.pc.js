"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var antd_1 = require("antd");
var picker_1 = tslib_1.__importDefault(require("../picker"));
function render(props) {
    var _a = props.data, pickerDef = _a.pickerDef, renderValue = _a.renderValue, data = _a.data, multiple = _a.multiple, onChange = _a.onChange, entityId = _a.entityId, entityIds = _a.entityIds;
    var t = props.methods.t;
    var mode = pickerDef.mode;
    var _b = tslib_1.__read((0, react_1.useState)(false), 2), visibile = _b[0], setVisible = _b[1];
    if (!data && mode !== 'list') {
        return (0, jsx_runtime_1.jsx)("div", { children: " loading... " });
    }
    else {
        switch (mode) {
            case 'select': {
                return ((0, jsx_runtime_1.jsx)(antd_1.Select, { value: entityId, onChange: onChange, style: { width: '50%' }, options: data.map(function (ele) { return ({
                        value: ele.id,
                        label: ele.title,
                    }); }), allowClear: true }));
            }
            case 'radio': {
                if (multiple) {
                    return ((0, jsx_runtime_1.jsx)(antd_1.Checkbox.Group, { options: data.map(function (ele) { return ({
                            value: ele.id,
                            label: ele.title,
                        }); }), value: entityIds, onChange: onChange }));
                }
                return ((0, jsx_runtime_1.jsx)(antd_1.Radio.Group, { onChange: function (_a) {
                        var target = _a.target;
                        return onChange(target.value);
                    }, value: entityId, options: data.map(function (ele) { return ({
                        value: ele.id,
                        label: ele.title,
                    }); }) }));
            }
            case 'list': {
                var entity = pickerDef.entity, projection = pickerDef.projection, title = pickerDef.title, titleLabel = pickerDef.titleLabel, filter = pickerDef.filter, sorter = pickerDef.sorter;
                var p = typeof projection === 'function' ? projection() : projection;
                var f = typeof filter === 'function' ? filter() : filter;
                var s = typeof sorter === 'function' ? sorter() : sorter;
                return ((0, jsx_runtime_1.jsxs)(antd_1.Space, { children: [(0, jsx_runtime_1.jsx)(antd_1.Input, { value: renderValue, allowClear: true, onClick: function () { return setVisible(true); }, onChange: function (_a) {
                                var currentTarget = _a.currentTarget;
                                if (!currentTarget.value) {
                                    onChange(undefined);
                                }
                            } }), (0, jsx_runtime_1.jsx)(antd_1.Modal, tslib_1.__assign({ title: "\u9009\u62E9".concat(t("".concat(pickerDef.entity, ":name"))), open: visibile, closable: true, onCancel: function () { return setVisible(false); }, destroyOnClose: true, footer: null }, { children: (0, jsx_runtime_1.jsx)(picker_1.default, { oakPath: "$refAttr-picker-".concat(entity), entity: entity, title: title, titleLabel: titleLabel, oakProjection: p, oakFilters: f ? [f] : undefined, oakSorters: s, onSelect: function (_a) {
                                    var _b = tslib_1.__read(_a, 1), id = _b[0].id;
                                    onChange(id);
                                    setVisible(false);
                                } }) }))] }));
            }
        }
    }
}
exports.default = render;
