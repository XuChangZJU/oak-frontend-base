"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const antd_mobile_1 = require("antd-mobile");
const picker_1 = tslib_1.__importDefault(require("../picker"));
const filter_1 = require("oak-domain/lib/store/filter");
function render(props) {
    const { pickerRender, renderValue, data, multiple, onChange, entityId, entityIds, schema, } = props.data;
    const { t } = props.methods;
    const { mode } = pickerRender;
    const [visibile, setVisible] = (0, react_1.useState)(false);
    const [dynamicFilter, setDynamicFilter] = (0, react_1.useState)(undefined);
    const [dynamicSorter, setDynamicSorter] = (0, react_1.useState)(undefined);
    const [dynamicProjection, setDynamicProjection] = (0, react_1.useState)(undefined);
    if (!data && mode !== 'list') {
        return (0, jsx_runtime_1.jsx)("div", { children: " loading... " });
    }
    else {
        switch (mode) {
            case 'select': {
                return ((0, jsx_runtime_1.jsx)(antd_mobile_1.Selector, { value: [entityId], onChange: (value) => {
                        onChange(value);
                    }, options: data.map((ele) => ({
                        value: ele.id,
                        label: ele.title,
                    })), multiple: multiple }));
            }
            case 'radio': {
                if (multiple) {
                    return ((0, jsx_runtime_1.jsx)(antd_mobile_1.Checkbox.Group, { value: entityIds, onChange: (value) => onChange(value), children: data.map((ele) => ((0, jsx_runtime_1.jsx)(antd_mobile_1.Checkbox, { value: ele.id, children: ele.title }))) }));
                }
                return ((0, jsx_runtime_1.jsx)(antd_mobile_1.Radio.Group, { onChange: (value) => onChange([value]), value: entityId, children: data.map((ele) => ((0, jsx_runtime_1.jsx)(antd_mobile_1.Radio, { value: ele.id, children: ele.title }))) }));
            }
            case 'list': {
                const { entity, projection, title, titleLabel, filter, sorter, required, getDynamicSelectors, } = pickerRender;
                return ((0, jsx_runtime_1.jsxs)(antd_mobile_1.Space, { children: [(0, jsx_runtime_1.jsx)(antd_mobile_1.Input, { value: renderValue, clearable: !required, onClick: async () => {
                                if (getDynamicSelectors) {
                                    // todo 这段代码没测过
                                    const { projection: dynamicProjection2, filter: dynamicFilter2, sorter: dynamicSorter2, } = await getDynamicSelectors();
                                    if (dynamicFilter2 || filter) {
                                        setDynamicFilter((0, filter_1.combineFilters)(entity, schema, [
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
                            }, onChange: (value) => {
                                if (!value) {
                                    onChange([]);
                                }
                            } }), (0, jsx_runtime_1.jsx)(antd_mobile_1.Popup, { visible: visibile, closeOnMaskClick: true, onClose: () => {
                                setDynamicFilter(undefined);
                                setDynamicProjection(undefined);
                                setDynamicSorter(undefined);
                                setVisible(false);
                            }, destroyOnClose: true, showCloseButton: true, bodyStyle: {
                                height: '80%',
                            }, children: (0, jsx_runtime_1.jsx)(picker_1.default, { multiple: false, oakPath: `$refAttr-picker-${entity}`, entity: entity, title: title, titleLabel: titleLabel, oakFilters: dynamicFilter
                                    ? [
                                        {
                                            filter: dynamicFilter,
                                        },
                                    ]
                                    : undefined, oakSorters: dynamicSorter
                                    ? dynamicSorter.map((ele) => ({
                                        sorter: ele,
                                    }))
                                    : undefined, oakProjection: dynamicProjection, onSelect: (data) => {
                                    onChange(data.map((ele) => ele.id));
                                    setVisible(false);
                                } }) })] }));
            }
        }
    }
}
exports.default = render;
