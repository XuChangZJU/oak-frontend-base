import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Form, Input, TextArea, DatePicker, Grid, Popup, Radio, Stepper, Switch, Button, } from 'antd-mobile';
import OakIcon from '../icon';
import RefAttr from '../refAttr';
import Location from '../map/location';
import Map from '../map/map';
import dayjs from 'dayjs';
function makeAttrInput(attrRender, onValueChange, t, label) {
    const [sl, setSl] = useState(false);
    const [dt, setDt] = useState(false);
    const [poi, setPoi] = useState(undefined);
    const { value, type, params, defaultValue, enumeration, required, placeholder, min, max, maxLength } = attrRender;
    switch (type) {
        case 'string':
        case 'varchar':
        case 'char':
        case 'poiName': {
            return (_jsx(Input, { clearable: !required, placeholder: placeholder || `请输入${label}`, value: value, defaultValue: defaultValue, maxLength: maxLength, onChange: (value) => {
                    onValueChange(value);
                } }));
        }
        case 'text': {
            return (_jsx(TextArea, { autoSize: true, placeholder: `请输入${label}`, defaultValue: defaultValue, value: value || '', rows: 6, showCount: true, maxLength: maxLength || 1000, onChange: (value) => {
                    onValueChange(value);
                } }));
        }
        case 'int': {
            return (_jsx(Stepper, { min: min, max: max, defaultValue: defaultValue, value: value, digits: 0, onChange: (value) => onValueChange(value) }));
        }
        case 'decimal': {
            const precision = params?.precision || 10;
            const scale = params?.scale || 0;
            const scaleValue = Math.pow(10, 0 - scale);
            /*
            const threshold = Math.pow(10, precision - scale);
            const max = threshold - scaleValue;     // 小数在这里可能会有bug
            const min = 0 - max; */
            return (_jsx(Stepper, { min: min, max: max, defaultValue: defaultValue, value: value, digits: scale, step: scaleValue, onChange: (value) => onValueChange(value) }));
        }
        case 'money': {
            // money在数据上统一用分来存储
            const valueShowed = parseFloat((value / 100).toFixed(2));
            const defaultValueShowed = parseFloat((defaultValue / 100).toFixed(2));
            return (_jsx(Stepper, { min: 0, defaultValue: defaultValueShowed, value: valueShowed, digits: 2, step: 0.01, formatter: value => `￥ ${value}`, parser: text => parseFloat(text.replace('￥', '')), onChange: (value) => {
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
            return (_jsxs("div", { style: { display: 'flex', alignItems: 'center' }, children: [_jsx(DatePicker, { visible: dt, onClose: () => setDt(false), precision: precision, value: new Date(value), defaultValue: new Date(), min: min ? new Date(min) : undefined, max: max ? new Date(max) : undefined, children: value => dayjs(value).format(format) }), _jsx(Button, { onClick: () => setDt(true), children: type === 'date' ? t('chooseDate') : t('chooseDatetime') })] }));
        }
        case 'time': {
            return (_jsx("div", { children: "\u5F85\u5B9E\u73B0" }));
        }
        case 'boolean': {
            return (_jsx(Switch, { checkedText: _jsx(OakIcon, { name: "right" }), uncheckedText: _jsx(OakIcon, { name: "close" }), checked: value, onChange: (checked) => {
                    onValueChange(checked);
                } }));
        }
        case 'enum': {
            return (_jsx(Radio.Group, { value: value, onChange: (value) => onValueChange(value), children: enumeration.map(({ label, value }) => (_jsx(Radio, { value: value, children: t(label) }))) }));
        }
        case 'ref': {
            return (_jsx(RefAttr, { multiple: false, entityId: value, pickerRender: attrRender, onChange: (value) => { onValueChange(value[0]); } }));
        }
        case 'coordinate': {
            const { coordinate } = value || {};
            const { extra } = attrRender;
            const poiNameAttr = extra?.poiName || 'poiName';
            const areaIdAttr = extra?.areaId || 'areaId';
            return (_jsxs(_Fragment, { children: [_jsxs(Popup, { closeOnMaskClick: true, destroyOnClose: true, position: 'bottom', visible: sl, onClose: () => setSl(false), bodyStyle: {
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'stretch',
                        }, children: [_jsx("div", { style: { flex: 1 }, children: _jsx(Location, { coordinate: coordinate, onLocated: (poi) => setPoi(poi) }) }), _jsxs(Grid, { columns: 2, gap: 8, children: [_jsx(Button, { block: true, color: "primary", disabled: !poi, onClick: () => {
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
                                        }, children: t('common::action.confirm') }), _jsx(Button, { block: true, fill: "outline", onClick: () => {
                                            setSl(false);
                                        }, children: t('common::action.cancel') })] })] }), _jsx("div", { style: {
                            display: 'flex',
                            width: '100%',
                            alignItems: 'center',
                        }, onClick: () => setSl(true), children: _jsx(Map, { undragable: true, unzoomable: true, zoom: 13, disableWheelZoom: true, style: { height: 200, flex: 1 }, autoLocate: true, center: coordinate, markers: coordinate ? [coordinate] : undefined }) })] }));
        }
        default: {
            throw new Error(`【Abstract Update】无法支持的数据类别${type}的渲染`);
        }
    }
}
export default function render(props) {
    const { renderData = [], helps, layout = 'horizontal', mode = 'default', entity } = props.data;
    const { update, t } = props.methods;
    return (_jsx(Form, { layout: layout, mode: mode, children: renderData.map((ele) => {
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
            return (_jsx(Form.Item, { label: label2, rules: [
                    {
                        required: !!required,
                    },
                ], help: helps && helps[attr], children: _jsx(_Fragment, { children: makeAttrInput(ele, (value, extra) => {
                        const { attr } = ele;
                        update({
                            [attr]: value,
                            ...extra,
                        });
                    }, t, label2) }) }));
        }) }));
}
