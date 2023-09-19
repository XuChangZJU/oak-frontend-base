"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const antd_1 = require("antd");
const antd_2 = require("antd");
const { Title, Text } = antd_2.Typography;
const react_1 = require("react");
const actionAuthList_1 = tslib_1.__importDefault(require("../actionAuthList"));
function render(props) {
    const { methods, data } = props;
    const { entity, entityDNode, entitySNode, oakFullpath } = data;
    const { getNodes, checkSelectRelation, resolveP } = methods;
    const [open, setOpen] = (0, react_1.useState)(false);
    const [breadcrumbItems, setBreadcrumbItems] = (0, react_1.useState)([]);
    return ((0, jsx_runtime_1.jsxs)(antd_1.Space, { direction: "vertical", style: { width: '100%' }, children: [(0, jsx_runtime_1.jsx)(antd_1.Button, { onClick: () => setOpen(true), children: "\u8BBE\u7F6E" }), (0, jsx_runtime_1.jsx)(antd_1.Modal, { title: `权限设置`, open: open, destroyOnClose: true, footer: null, onCancel: () => {
                    setBreadcrumbItems([]);
                    setOpen(false);
                }, width: 900, children: (0, jsx_runtime_1.jsxs)(antd_1.Space, { direction: "vertical", style: { width: '100%', marginTop: 16 }, size: 16, children: [(0, jsx_runtime_1.jsxs)(antd_1.Space, { direction: "vertical", children: [(0, jsx_runtime_1.jsx)(Text, { style: { fontSize: 16 }, children: "\u8DEF\u5F84" }), (0, jsx_runtime_1.jsx)(antd_1.Space, { style: { width: '100%' }, wrap: true, children: (breadcrumbItems && breadcrumbItems.length > 0) ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(antd_1.Breadcrumb, { items: breadcrumbItems.map((ele, index) => ({
                                                    title: ((0, jsx_runtime_1.jsx)("a", { onClick: () => {
                                                            if (checkSelectRelation()) {
                                                                return;
                                                            }
                                                            const newItems = breadcrumbItems.slice(0, index + 1);
                                                            setBreadcrumbItems(newItems);
                                                            const entity = ele.includes('$') ? ele.split('$')[0] : ele;
                                                            getNodes(entity);
                                                        }, children: ele }))
                                                })) }), (0, jsx_runtime_1.jsx)(antd_1.Button, { size: "small", type: "link", onClick: () => {
                                                    setBreadcrumbItems([]);
                                                    getNodes(entity);
                                                }, children: "\u6E05\u7A7A" })] })) : ((0, jsx_runtime_1.jsx)(Text, { type: "secondary", children: "\u8BF7\u5148\u9009\u62E9\u7ED3\u70B9" })) })] }), (0, jsx_runtime_1.jsx)(antd_1.Space, { direction: "vertical", style: { width: '100%' }, children: (0, jsx_runtime_1.jsxs)(antd_1.Space, { direction: "vertical", style: { width: '100%' }, children: [(0, jsx_runtime_1.jsx)(Text, { style: { fontSize: 16 }, children: "\u7ED3\u70B9" }), (0, jsx_runtime_1.jsxs)(antd_1.Row, { gutter: 24, children: [(0, jsx_runtime_1.jsx)(antd_1.Col, { span: 2, children: (0, jsx_runtime_1.jsx)(Text, { style: { whiteSpace: 'nowrap' }, children: "\u5916\u952E" }) }), (0, jsx_runtime_1.jsx)(antd_1.Col, { span: 22, children: (0, jsx_runtime_1.jsx)(antd_1.Space, { wrap: true, children: entityDNode.map((ele) => ((0, jsx_runtime_1.jsx)(antd_1.Tag, { style: { cursor: 'pointer' }, color: "processing", bordered: false, onClick: () => {
                                                            if (checkSelectRelation()) {
                                                                return;
                                                            }
                                                            breadcrumbItems.push(ele);
                                                            setBreadcrumbItems(breadcrumbItems);
                                                            const path = breadcrumbItems.join('.');
                                                            const entity = resolveP(path);
                                                            getNodes(entity);
                                                        }, children: ele }))) }) })] }), (0, jsx_runtime_1.jsxs)(antd_1.Row, { gutter: 24, children: [(0, jsx_runtime_1.jsx)(antd_1.Col, { span: 2, children: (0, jsx_runtime_1.jsx)(Text, { style: { whiteSpace: 'nowrap', marginRight: 16 }, children: "\u53CD\u6307\u7ED3\u70B9" }) }), (0, jsx_runtime_1.jsx)(antd_1.Col, { span: 22, children: (0, jsx_runtime_1.jsx)(antd_1.Space, { wrap: true, children: entitySNode.map((ele) => ((0, jsx_runtime_1.jsx)(antd_1.Tag, { style: { cursor: 'pointer' }, color: "cyan", bordered: false, onClick: () => {
                                                            if (checkSelectRelation()) {
                                                                return;
                                                            }
                                                            const preNode = breadcrumbItems[breadcrumbItems.length - 1] || entity;
                                                            const parentEntity = preNode.includes('$') ? preNode.split('$')[0] : preNode;
                                                            breadcrumbItems.push(`${ele}$${parentEntity}`);
                                                            setBreadcrumbItems(breadcrumbItems);
                                                            getNodes(ele);
                                                        }, children: ele }))) }) })] })] }) }), (0, jsx_runtime_1.jsx)(actionAuthList_1.default, { oakPath: "$actionAuthList-cpn", entity: entity, path: breadcrumbItems.join('.'), onClose: () => {
                                setBreadcrumbItems([]);
                                setOpen(false);
                            }, oakAutoUnmount: true })] }) })] }));
}
exports.default = render;
