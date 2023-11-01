"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const antd_mobile_1 = require("antd-mobile");
function render(props) {
    const { entities, entity, relations, onClicked } = props.data;
    if (entities) {
        return ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: entities.map((e) => {
                const rs = relations.filter(ele => ele.entity === e);
                return ((0, jsx_runtime_1.jsx)(antd_mobile_1.List, { header: e, children: rs.map((r) => ((0, jsx_runtime_1.jsx)(antd_mobile_1.List.Item, { onClick: () => onClicked(r.id), children: r.name }))) }));
            }) }));
    }
    return null;
}
exports.default = render;
