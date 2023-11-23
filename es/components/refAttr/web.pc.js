import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Checkbox, Input, Radio, Modal, Space, Select, } from 'antd';
import Picker from '../picker';
import { combineFilters } from 'oak-domain/lib/store/filter';
export default function render(props) {
    const { pickerRender, renderValue, data, multiple, onChange, entityIds, placeholder, schema, } = props.data;
    const { t } = props.methods;
    const { mode } = pickerRender;
    const [visibile, setVisible] = useState(false);
    const [dynamicFilter, setDynamicFilter] = useState(undefined);
    const [dynamicSorter, setDynamicSorter] = useState(undefined);
    const [dynamicProjection, setDynamicProjection] = useState(undefined);
    if (!data && mode !== 'list') {
        return _jsx("div", { children: " loading... " });
    }
    else {
        switch (mode) {
            case 'select': {
                const entityId = entityIds && entityIds[0];
                return (_jsx(Select, { placeholder: placeholder, mode: multiple ? 'multiple' : undefined, value: multiple ? entityIds : entityId, onChange: (value) => {
                        if (typeof value === 'string') {
                            onChange([value]);
                        }
                        else if (!value) {
                            onChange([]);
                        }
                        else if (value instanceof Array) {
                            onChange(value);
                        }
                    }, options: data.map((ele) => ({
                        value: ele.id,
                        label: ele.title,
                    })), allowClear: !pickerRender.required }));
            }
            case 'radio': {
                const entityId = entityIds && entityIds[0];
                if (multiple) {
                    return (_jsx(Checkbox.Group, { options: data.map((ele) => ({
                            value: ele.id,
                            label: ele.title,
                        })), value: entityIds, onChange: (value) => onChange(value) }));
                }
                return (_jsx(Radio.Group, { onChange: ({ target }) => onChange(target.value), value: entityId, options: data.map((ele) => ({
                        value: ele.id,
                        label: ele.title,
                    })) }));
            }
            case 'list': {
                const { entity, projection, title, titleLabel, filter, sorter, required, getDynamicSelectors, } = pickerRender;
                return (_jsxs(Space, { children: [_jsx(Input, { placeholder: placeholder, value: renderValue, allowClear: !required, onClick: async () => {
                                if (getDynamicSelectors) {
                                    // todo 这段代码没测过
                                    const { projection: dynamicProjection2, filter: dynamicFilter2, sorter: dynamicSorter2, } = await getDynamicSelectors();
                                    if (dynamicFilter2 || filter) {
                                        setDynamicFilter(combineFilters(entity, schema, [
                                            dynamicFilter2,
                                            filter,
                                        ]));
                                    }
                                    if (dynamicSorter2 || sorter) {
                                        setDynamicSorter(dynamicSorter2 || sorter);
                                    }
                                    if (dynamicProjection2 || projection) {
                                        setDynamicProjection(dynamicProjection2 || projection);
                                    }
                                }
                                else {
                                    if (filter) {
                                        setDynamicFilter(filter);
                                    }
                                    if (sorter) {
                                        setDynamicSorter(sorter);
                                    }
                                    if (projection) {
                                        setDynamicProjection(projection);
                                    }
                                }
                                setVisible(true);
                            }, onChange: ({ currentTarget }) => {
                                if (!currentTarget.value) {
                                    onChange([]);
                                }
                            } }), _jsx(Modal, { title: `选择${t(`${pickerRender.entity}:name`)}`, open: visibile, closable: true, onCancel: () => {
                                setDynamicFilter(undefined);
                                setDynamicProjection(undefined);
                                setDynamicSorter(undefined);
                                setVisible(false);
                            }, destroyOnClose: true, footer: null, children: _jsx(Picker, { multiple: false, oakPath: `$refAttr-picker-${entity}`, entity: entity, title: title, titleLabel: titleLabel, filter: dynamicFilter, sorter: dynamicSorter, projection: dynamicProjection || projection, onSelect: (data) => {
                                    onChange(data.map((ele) => ele.id));
                                    setVisible(false);
                                } }) })] }));
            }
        }
    }
}
