"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const antd_1 = require("antd");
const web_pc_module_less_1 = tslib_1.__importDefault(require("./web.pc.module.less"));
function render(props) {
    const { entities, entity, relations, onClicked } = props.data;
    const { t, setEntityFilter } = props.methods;
    if (entities) {
        return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [!entity &&
                    (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsx)("div", { className: web_pc_module_less_1.default.inputDiv, children: (0, jsx_runtime_1.jsx)(antd_1.Input, { placeholder: t('searchTip'), allowClear: true, onChange: ({ currentTarget }) => setEntityFilter(currentTarget.value) }) }) }), entities.map((e) => {
                    const rs = relations.filter(ele => ele.entity === e);
                    return ((0, jsx_runtime_1.jsx)(antd_1.Card, { title: t(`${e}:name`) + ` (${e})`, style: { margin: 10 }, children: rs.map((r) => ((0, jsx_runtime_1.jsx)(antd_1.Button, { type: r.entityId ? 'primary' : 'link', onClick: () => onClicked(r.id), children: t(`${e}:r.${r.name}`) + ` (${r.name})` }))) }));
                })] }));
    }
    return null;
}
exports.default = render;
