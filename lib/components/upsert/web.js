"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var antd_mobile_1 = require("antd-mobile");
var icon_1 = tslib_1.__importDefault(require("../icon"));
var refAttr_1 = tslib_1.__importDefault(require("../refAttr"));
var location_1 = tslib_1.__importDefault(require("../map/location"));
var map_1 = tslib_1.__importDefault(require("../map/map"));
var dayjs_1 = tslib_1.__importDefault(require("dayjs"));
function makeAttrInput(attrRender, onValueChange, t, label) {
    var _a = tslib_1.__read((0, react_1.useState)(false), 2), sl = _a[0], setSl = _a[1];
    var _b = tslib_1.__read((0, react_1.useState)(false), 2), dt = _b[0], setDt = _b[1];
    var _c = tslib_1.__read((0, react_1.useState)(undefined), 2), poi = _c[0], setPoi = _c[1];
    var _d = attrRender, value = _d.value, type = _d.type, params = _d.params, defaultValue = _d.defaultValue, enumeration = _d.enumeration, required = _d.required, placeholder = _d.placeholder, min = _d.min, max = _d.max, maxLength = _d.maxLength;
    switch (type) {
        case 'string':
        case 'varchar':
        case 'char':
        case 'poiName': {
            return ((0, jsx_runtime_1.jsx)(antd_mobile_1.Input, { clearable: !required, placeholder: placeholder || "\u8BF7\u8F93\u5165".concat(label), value: value, defaultValue: defaultValue, maxLength: maxLength, onChange: function (value) {
                    onValueChange(value);
                } }));
        }
        case 'text': {
            return ((0, jsx_runtime_1.jsx)(antd_mobile_1.TextArea, { autoSize: true, placeholder: "\u8BF7\u8F93\u5165".concat(label), defaultValue: defaultValue, value: value || '', rows: 6, showCount: true, maxLength: maxLength || 1000, onChange: function (value) {
                    onValueChange(value);
                } }));
        }
        case 'int': {
            return ((0, jsx_runtime_1.jsx)(antd_mobile_1.Stepper, { min: min, max: max, defaultValue: defaultValue, value: value, digits: 0, onChange: function (value) { return onValueChange(value); } }));
        }
        case 'decimal': {
            var precision = (params === null || params === void 0 ? void 0 : params.precision) || 10;
            var scale = (params === null || params === void 0 ? void 0 : params.scale) || 0;
            var scaleValue = Math.pow(10, 0 - scale);
            /*
            const threshold = Math.pow(10, precision - scale);
            const max = threshold - scaleValue;     // 小数在这里可能会有bug
            const min = 0 - max; */
            return ((0, jsx_runtime_1.jsx)(antd_mobile_1.Stepper, { min: min, max: max, defaultValue: defaultValue, value: value, digits: scale, step: scaleValue, onChange: function (value) { return onValueChange(value); } }));
        }
        case 'money': {
            // money在数据上统一用分来存储
            var valueShowed = parseFloat((value / 100).toFixed(2));
            var defaultValueShowed = parseFloat((defaultValue / 100).toFixed(2));
            return ((0, jsx_runtime_1.jsx)(antd_mobile_1.Stepper, { min: 0, defaultValue: defaultValueShowed, value: valueShowed, digits: 2, step: 0.01, formatter: function (value) { return "\uFFE5 ".concat(value); }, parser: function (text) { return parseFloat(text.replace('￥', '')); }, onChange: function (value) {
                    if (value !== null) {
                        var v2 = Math.round(value * 100);
                        onValueChange(v2);
                    }
                    else {
                        onValueChange(value);
                    }
                } }));
        }
        case 'datetime':
        case 'date': {
            var precision = type === 'date' ? 'day' : 'second';
            var format_1 = type === 'date' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss';
            return ((0, jsx_runtime_1.jsxs)("div", tslib_1.__assign({ style: { display: 'flex', alignItems: 'center' } }, { children: [(0, jsx_runtime_1.jsx)(antd_mobile_1.DatePicker, tslib_1.__assign({ visible: dt, onClose: function () { return setDt(false); }, precision: precision, value: new Date(value), defaultValue: new Date(), min: min ? new Date(min) : undefined, max: max ? new Date(max) : undefined }, { children: function (value) { return (0, dayjs_1.default)(value).format(format_1); } })), (0, jsx_runtime_1.jsx)(antd_mobile_1.Button, tslib_1.__assign({ onClick: function () { return setDt(true); } }, { children: type === 'date' ? t('chooseDate') : t('chooseDatetime') }))] })));
        }
        case 'time': {
            return ((0, jsx_runtime_1.jsx)("div", { children: "\u5F85\u5B9E\u73B0" }));
        }
        case 'boolean': {
            return ((0, jsx_runtime_1.jsx)(antd_mobile_1.Switch, { checkedText: (0, jsx_runtime_1.jsx)(icon_1.default, { name: "right" }), uncheckedText: (0, jsx_runtime_1.jsx)(icon_1.default, { name: "close" }), checked: value, onChange: function (checked) {
                    onValueChange(checked);
                } }));
        }
        case 'enum': {
            return ((0, jsx_runtime_1.jsx)(antd_mobile_1.Radio.Group, tslib_1.__assign({ value: value, onChange: function (value) { return onValueChange(value); } }, { children: enumeration.map(function (_a) {
                    var label = _a.label, value = _a.value;
                    return ((0, jsx_runtime_1.jsx)(antd_mobile_1.Radio, tslib_1.__assign({ value: value }, { children: t(label) })));
                }) })));
        }
        case 'ref': {
            return ((0, jsx_runtime_1.jsx)(refAttr_1.default, { multiple: false, entityId: value, pickerRender: attrRender, onChange: function (value) { onValueChange(value[0]); } }));
        }
        case 'coordinate': {
            var coordinate = (value || {}).coordinate;
            var extra = attrRender.extra;
            var poiNameAttr_1 = (extra === null || extra === void 0 ? void 0 : extra.poiName) || 'poiName';
            var areaIdAttr_1 = (extra === null || extra === void 0 ? void 0 : extra.areaId) || 'areaId';
            return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)(antd_mobile_1.Popup, tslib_1.__assign({ closeOnMaskClick: true, destroyOnClose: true, position: 'bottom', visible: sl, onClose: function () { return setSl(false); }, bodyStyle: {
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'stretch',
                        } }, { children: [(0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ style: { flex: 1 } }, { children: (0, jsx_runtime_1.jsx)(location_1.default, { coordinate: coordinate, onLocated: function (poi) { return setPoi(poi); } }) })), (0, jsx_runtime_1.jsxs)(antd_mobile_1.Grid, tslib_1.__assign({ columns: 2, gap: 8 }, { children: [(0, jsx_runtime_1.jsx)(antd_mobile_1.Button, tslib_1.__assign({ block: true, color: "primary", disabled: !poi, onClick: function () {
                                            var _a;
                                            if (poi) {
                                                var poiName = poi.poiName, coordinate_1 = poi.coordinate, areaId = poi.areaId;
                                                onValueChange({
                                                    type: 'point',
                                                    coordinate: coordinate_1,
                                                }, (_a = {},
                                                    _a[poiNameAttr_1] = poiName,
                                                    _a[areaIdAttr_1] = areaId,
                                                    _a));
                                            }
                                            setSl(false);
                                        } }, { children: t('common:action.confirm') })), (0, jsx_runtime_1.jsx)(antd_mobile_1.Button, tslib_1.__assign({ block: true, fill: "outline", onClick: function () {
                                            setSl(false);
                                        } }, { children: t('common:action.cancel') }))] }))] })), (0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ style: {
                            display: 'flex',
                            width: '100%',
                            alignItems: 'center',
                        }, onClick: function () { return setSl(true); } }, { children: (0, jsx_runtime_1.jsx)(map_1.default, { undragable: true, unzoomable: true, zoom: 13, disableWheelZoom: true, style: { height: 200, flex: 1 }, autoLocate: true, center: coordinate, markers: coordinate ? [coordinate] : undefined }) }))] }));
        }
        default: {
            throw new Error("\u3010Abstract Update\u3011\u65E0\u6CD5\u652F\u6301\u7684\u6570\u636E\u7C7B\u522B".concat(type, "\u7684\u6E32\u67D3"));
        }
    }
}
function render(props) {
    var _a = props.data, _b = _a.renderData, renderData = _b === void 0 ? [] : _b, helps = _a.helps, _c = _a.layout, layout = _c === void 0 ? 'horizontal' : _c, _d = _a.mode, mode = _d === void 0 ? 'default' : _d, entity = _a.entity;
    var _e = props.methods, update = _e.update, t = _e.t;
    return ((0, jsx_runtime_1.jsx)(antd_mobile_1.Form, tslib_1.__assign({ layout: layout, mode: mode }, { children: renderData.map(function (ele) {
            // 因为i18n渲染机制的缘故，t必须放到这里来计算
            var label = ele.label, attr = ele.attr, type = ele.type, required = ele.required;
            var label2 = label;
            if (!label2) {
                if (type === 'ref') {
                    var refEntity = ele.entity;
                    if (attr === 'entityId') {
                        // 反指
                        label2 = t("".concat(refEntity, ":name"));
                    }
                    else {
                        label2 = t("".concat(entity, ":attr.").concat(attr));
                    }
                }
                else {
                    label2 = t("".concat(entity, ":attr.").concat(attr));
                }
            }
            return ((0, jsx_runtime_1.jsx)(antd_mobile_1.Form.Item, tslib_1.__assign({ label: label2, rules: [
                    {
                        required: !!required,
                    },
                ], help: helps && helps[attr] }, { children: (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: makeAttrInput(ele, function (value, extra) {
                        var _a;
                        var attr = ele.attr;
                        update(tslib_1.__assign((_a = {}, _a[attr] = value, _a), extra));
                    }, t, label2) }) })));
        }) })));
}
exports.default = render;