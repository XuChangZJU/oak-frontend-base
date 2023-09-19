"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const antd_mobile_1 = require("antd-mobile");
const icon_1 = tslib_1.__importDefault(require("../icon"));
const refAttr_1 = tslib_1.__importDefault(require("../refAttr"));
const location_1 = tslib_1.__importDefault(require("../map/location"));
const map_1 = tslib_1.__importDefault(require("../map/map"));
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
function makeAttrInput(attrRender, onValueChange, t, label) {
    const [sl, setSl] = (0, react_1.useState)(false);
    const [dt, setDt] = (0, react_1.useState)(false);
    const [poi, setPoi] = (0, react_1.useState)(undefined);
    const { value, type, params, defaultValue, enumeration, required, placeholder, min, max, maxLength } = attrRender;
    switch (type) {
        case 'string':
        case 'varchar':
        case 'char':
        case 'poiName': {
            return ((0, jsx_runtime_1.jsx)(antd_mobile_1.Input, { clearable: !required, placeholder: placeholder || `请输入${label}`, value: value, defaultValue: defaultValue, maxLength: maxLength, onChange: (value) => {
                    onValueChange(value);
                } }));
        }
        case 'text': {
            return ((0, jsx_runtime_1.jsx)(antd_mobile_1.TextArea, { autoSize: true, placeholder: `请输入${label}`, defaultValue: defaultValue, value: value || '', rows: 6, showCount: true, maxLength: maxLength || 1000, onChange: (value) => {
                    onValueChange(value);
                } }));
        }
        case 'int': {
            return ((0, jsx_runtime_1.jsx)(antd_mobile_1.Stepper, { min: min, max: max, defaultValue: defaultValue, value: value, digits: 0, onChange: (value) => onValueChange(value) }));
        }
        case 'decimal': {
            const precision = params?.precision || 10;
            const scale = params?.scale || 0;
            const scaleValue = Math.pow(10, 0 - scale);
            /*
            const threshold = Math.pow(10, precision - scale);
            const max = threshold - scaleValue;     // 小数在这里可能会有bug
            const min = 0 - max; */
            return ((0, jsx_runtime_1.jsx)(antd_mobile_1.Stepper, { min: min, max: max, defaultValue: defaultValue, value: value, digits: scale, step: scaleValue, onChange: (value) => onValueChange(value) }));
        }
        case 'money': {
            // money在数据上统一用分来存储
            const valueShowed = parseFloat((value / 100).toFixed(2));
            const defaultValueShowed = parseFloat((defaultValue / 100).toFixed(2));
            return ((0, jsx_runtime_1.jsx)(antd_mobile_1.Stepper, { min: 0, defaultValue: defaultValueShowed, value: valueShowed, digits: 2, step: 0.01, formatter: value => `￥ ${value}`, parser: text => parseFloat(text.replace('￥', '')), onChange: (value) => {
                    if (value !== null) {
                        const v2 = Math.round(value * 100);
                        onValueChange(v2);
                    }
                    else {
                        onValueChange(value);
                    }
                } }));
        }
        case 'datetime':
        case 'date': {
            const precision = type === 'date' ? 'day' : 'second';
            const format = type === 'date' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss';
            return ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)(antd_mobile_1.DatePicker, { visible: dt, onClose: () => setDt(false), precision: precision, value: new Date(value), defaultValue: new Date(), min: min ? new Date(min) : undefined, max: max ? new Date(max) : undefined, children: value => (0, dayjs_1.default)(value).format(format) }), (0, jsx_runtime_1.jsx)(antd_mobile_1.Button, { onClick: () => setDt(true), children: type === 'date' ? t('chooseDate') : t('chooseDatetime') })] }));
        }
        case 'time': {
            return ((0, jsx_runtime_1.jsx)("div", { children: "\u5F85\u5B9E\u73B0" }));
        }
        case 'boolean': {
            return ((0, jsx_runtime_1.jsx)(antd_mobile_1.Switch, { checkedText: (0, jsx_runtime_1.jsx)(icon_1.default, { name: "right" }), uncheckedText: (0, jsx_runtime_1.jsx)(icon_1.default, { name: "close" }), checked: value, onChange: (checked) => {
                    onValueChange(checked);
                } }));
        }
        case 'enum': {
            return ((0, jsx_runtime_1.jsx)(antd_mobile_1.Radio.Group, { value: value, onChange: (value) => onValueChange(value), children: enumeration.map(({ label, value }) => ((0, jsx_runtime_1.jsx)(antd_mobile_1.Radio, { value: value, children: t(label) }))) }));
        }
        case 'ref': {
            return ((0, jsx_runtime_1.jsx)(refAttr_1.default, { multiple: false, entityId: value, pickerRender: attrRender, onChange: (value) => { onValueChange(value[0]); } }));
        }
        case 'coordinate': {
            const { coordinate } = value || {};
            const { extra } = attrRender;
            const poiNameAttr = extra?.poiName || 'poiName';
            const areaIdAttr = extra?.areaId || 'areaId';
            return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)(antd_mobile_1.Popup, { closeOnMaskClick: true, destroyOnClose: true, position: 'bottom', visible: sl, onClose: () => setSl(false), bodyStyle: {
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'stretch',
                        }, children: [(0, jsx_runtime_1.jsx)("div", { style: { flex: 1 }, children: (0, jsx_runtime_1.jsx)(location_1.default, { coordinate: coordinate, onLocated: (poi) => setPoi(poi) }) }), (0, jsx_runtime_1.jsxs)(antd_mobile_1.Grid, { columns: 2, gap: 8, children: [(0, jsx_runtime_1.jsx)(antd_mobile_1.Button, { block: true, color: "primary", disabled: !poi, onClick: () => {
                                            if (poi) {
                                                const { poiName, coordinate, areaId } = poi;
                                                onValueChange({
                                                    type: 'point',
                                                    coordinate,
                                                }, {
                                                    [poiNameAttr]: poiName,
                                                    [areaIdAttr]: areaId,
                                                });
                                            }
                                            setSl(false);
                                        }, children: t('common::action.confirm') }), (0, jsx_runtime_1.jsx)(antd_mobile_1.Button, { block: true, fill: "outline", onClick: () => {
                                            setSl(false);
                                        }, children: t('common::action.cancel') })] })] }), (0, jsx_runtime_1.jsx)("div", { style: {
                            display: 'flex',
                            width: '100%',
                            alignItems: 'center',
                        }, onClick: () => setSl(true), children: (0, jsx_runtime_1.jsx)(map_1.default, { undragable: true, unzoomable: true, zoom: 13, disableWheelZoom: true, style: { height: 200, flex: 1 }, autoLocate: true, center: coordinate, markers: coordinate ? [coordinate] : undefined }) })] }));
        }
        default: {
            throw new Error(`【Abstract Update】无法支持的数据类别${type}的渲染`);
        }
    }
}
function render(props) {
    const { renderData = [], helps, layout = 'horizontal', mode = 'default', entity } = props.data;
    const { update, t } = props.methods;
    return ((0, jsx_runtime_1.jsx)(antd_mobile_1.Form, { layout: layout, mode: mode, children: renderData.map((ele) => {
            // 因为i18n渲染机制的缘故，t必须放到这里来计算
            const { label, attr, type, required } = ele;
            let label2 = label;
            if (!label2) {
                if (type === 'ref') {
                    const { entity: refEntity } = ele;
                    if (attr === 'entityId') {
                        // 反指
                        label2 = t(`${refEntity}:name`);
                    }
                    else {
                        label2 = t(`${entity}:attr.${attr}`);
                    }
                }
                else {
                    label2 = t(`${entity}:attr.${attr}`);
                }
            }
            return ((0, jsx_runtime_1.jsx)(antd_mobile_1.Form.Item, { label: label2, rules: [
                    {
                        required: !!required,
                    },
                ], help: helps && helps[attr], children: (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: makeAttrInput(ele, (value, extra) => {
                        const { attr } = ele;
                        update({
                            [attr]: value,
                            ...extra,
                        });
                    }, t, label2) }) }));
        }) }));
}
exports.default = render;
