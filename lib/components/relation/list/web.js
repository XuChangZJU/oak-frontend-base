"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const antd_mobile_1 = require("antd-mobile");
const web_module_less_1 = tslib_1.__importDefault(require("./web.module.less"));
function render(props) {
    const { entities, entity, relations, onClicked } = props.data;
    const { t, setEntityFilter } = props.methods;
    if (entities) {
        return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [!entity &&
                    (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsx)("div", { className: web_module_less_1.default.inputDiv, children: (0, jsx_runtime_1.jsx)(antd_mobile_1.Input, { placeholder: t('searchTip'), clearable: true, onChange: (val) => setEntityFilter(val) }) }) }), entities.map((e) => {
                    const rs = relations.filter(ele => ele.entity === e);
                    return ((0, jsx_runtime_1.jsx)(antd_mobile_1.List, { header: t(`${e}:name`) + ` (${e})`, children: rs.map((r) => ((0, jsx_runtime_1.jsx)(antd_mobile_1.List.Item, { extra: r.entityId && (0, jsx_runtime_1.jsx)(antd_mobile_1.Tag, { color: 'primary', fill: 'outline', children: t('hasEntityId') }), onClick: () => onClicked(r.id), children: t(`${e}:r.${r.name}`) + ` (${r.name})` }))) }));
                })] }));
    }
    return null;
}
exports.default = render;
