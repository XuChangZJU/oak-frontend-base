"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var antd_mobile_1 = require("antd-mobile");
var picker_1 = tslib_1.__importDefault(require("../picker"));
var filter_1 = require("oak-domain/lib/store/filter");
function render(props) {
    var _this = this;
    var _a = props.data, pickerRender = _a.pickerRender, renderValue = _a.renderValue, data = _a.data, multiple = _a.multiple, onChange = _a.onChange, entityId = _a.entityId, entityIds = _a.entityIds, schema = _a.schema;
    var t = props.methods.t;
    var mode = pickerRender.mode;
    var _b = tslib_1.__read((0, react_1.useState)(false), 2), visibile = _b[0], setVisible = _b[1];
    var _c = tslib_1.__read((0, react_1.useState)(undefined), 2), dynamicFilter = _c[0], setDynamicFilter = _c[1];
    var _d = tslib_1.__read((0, react_1.useState)(undefined), 2), dynamicSorter = _d[0], setDynamicSorter = _d[1];
    var _e = tslib_1.__read((0, react_1.useState)(undefined), 2), dynamicProjection = _e[0], setDynamicProjection = _e[1];
    if (!data && mode !== 'list') {
        return (0, jsx_runtime_1.jsx)("div", { children: " loading... " });
    }
    else {
        switch (mode) {
            case 'select': {
                return ((0, jsx_runtime_1.jsx)(antd_mobile_1.Selector, { value: [entityId], onChange: function (value) {
                        onChange(value);
                    }, options: data.map(function (ele) { return ({
                        value: ele.id,
                        label: ele.title,
                    }); }), multiple: multiple }));
            }
            case 'radio': {
                if (multiple) {
                    return ((0, jsx_runtime_1.jsx)(antd_mobile_1.Checkbox.Group, { value: entityIds, onChange: function (value) { return onChange(value); }, children: data.map(function (ele) { return ((0, jsx_runtime_1.jsx)(antd_mobile_1.Checkbox, { value: ele.id, children: ele.title })); }) }));
                }
                return ((0, jsx_runtime_1.jsx)(antd_mobile_1.Radio.Group, { onChange: function (value) { return onChange([value]); }, value: entityId, children: data.map(function (ele) { return ((0, jsx_runtime_1.jsx)(antd_mobile_1.Radio, { value: ele.id, children: ele.title })); }) }));
            }
            case 'list': {
                var entity_1 = pickerRender.entity, projection_1 = pickerRender.projection, title = pickerRender.title, titleLabel = pickerRender.titleLabel, filter_2 = pickerRender.filter, sorter_1 = pickerRender.sorter, required = pickerRender.required, getDynamicSelectors_1 = pickerRender.getDynamicSelectors;
                return ((0, jsx_runtime_1.jsxs)(antd_mobile_1.Space, { children: [(0, jsx_runtime_1.jsx)(antd_mobile_1.Input, { value: renderValue, clearable: !required, onClick: function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                var _a, dynamicProjection2, dynamicFilter2, dynamicSorter2;
                                return tslib_1.__generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            if (!getDynamicSelectors_1) return [3 /*break*/, 2];
                                            return [4 /*yield*/, getDynamicSelectors_1()];
                                        case 1:
                                            _a = _b.sent(), dynamicProjection2 = _a.projection, dynamicFilter2 = _a.filter, dynamicSorter2 = _a.sorter;
                                            if (dynamicFilter2 || filter_2) {
                                                setDynamicFilter((0, filter_1.combineFilters)(entity_1, schema, [
                                                    dynamicFilter2,
                                                    filter_2,
                                                ]));
                                            }
                                            if (dynamicSorter2 || sorter_1) {
                                                setDynamicSorter(dynamicSorter2 || sorter_1);
                                            }
                                            if (dynamicProjection2 || projection_1) {
                                                setDynamicProjection(dynamicProjection2 || projection_1);
                                            }
                                            return [3 /*break*/, 3];
                                        case 2:
                                            if (filter_2) {
                                                setDynamicFilter(filter_2);
                                            }
                                            if (sorter_1) {
                                                setDynamicSorter(sorter_1);
                                            }
                                            if (projection_1) {
                                                setDynamicProjection(projection_1);
                                            }
                                            _b.label = 3;
                                        case 3:
                                            setVisible(true);
                                            return [2 /*return*/];
                                    }
                                });
                            }); }, onChange: function (value) {
                                if (!value) {
                                    onChange([]);
                                }
                            } }), (0, jsx_runtime_1.jsx)(antd_mobile_1.Popup, { visible: visibile, closeOnMaskClick: true, onClose: function () {
                                setDynamicFilter(undefined);
                                setDynamicProjection(undefined);
                                setDynamicSorter(undefined);
                                setVisible(false);
                            }, destroyOnClose: true, showCloseButton: true, bodyStyle: {
                                height: '80%',
                            }, children: (0, jsx_runtime_1.jsx)(picker_1.default, { multiple: false, oakPath: "$refAttr-picker-".concat(entity_1), entity: entity_1, title: title, titleLabel: titleLabel, oakFilters: dynamicFilter
                                    ? [
                                        {
                                            filter: dynamicFilter,
                                        },
                                    ]
                                    : undefined, oakSorters: dynamicSorter
                                    ? dynamicSorter.map(function (ele) { return ({
                                        sorter: ele,
                                    }); })
                                    : undefined, oakProjection: dynamicProjection, onSelect: function (data) {
                                    onChange(data.map(function (ele) { return ele.id; }));
                                    setVisible(false);
                                } }) })] }));
            }
        }
    }
}
exports.default = render;
