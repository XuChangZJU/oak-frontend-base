"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_1 = require("antd");
var antd_2 = require("antd");
var Title = antd_2.Typography.Title, Text = antd_2.Typography.Text;
var react_1 = require("react");
var actionAuthList_1 = tslib_1.__importDefault(require("../actionAuthList"));
function render(props) {
    var methods = props.methods, data = props.data;
    var entity = data.entity, entityDNode = data.entityDNode, entitySNode = data.entitySNode, oakFullpath = data.oakFullpath;
    var getNodes = methods.getNodes, checkSelectRelation = methods.checkSelectRelation, resolveP = methods.resolveP;
    var _a = tslib_1.__read((0, react_1.useState)(false), 2), open = _a[0], setOpen = _a[1];
    var _b = tslib_1.__read((0, react_1.useState)([]), 2), breadcrumbItems = _b[0], setBreadcrumbItems = _b[1];
    return ((0, jsx_runtime_1.jsxs)(antd_1.Space, { direction: "vertical", style: { width: '100%' }, children: [(0, jsx_runtime_1.jsx)(antd_1.Button, { onClick: function () { return setOpen(true); }, children: "\u8BBE\u7F6E" }), (0, jsx_runtime_1.jsx)(antd_1.Modal, { title: "\u6743\u9650\u8BBE\u7F6E", open: open, destroyOnClose: true, footer: null, onCancel: function () {
                    setBreadcrumbItems([]);
                    setOpen(false);
                }, width: 900, children: (0, jsx_runtime_1.jsxs)(antd_1.Space, { direction: "vertical", style: { width: '100%', marginTop: 16 }, size: 16, children: [(0, jsx_runtime_1.jsxs)(antd_1.Space, { direction: "vertical", children: [(0, jsx_runtime_1.jsx)(Text, { style: { fontSize: 16 }, children: "\u8DEF\u5F84" }), (0, jsx_runtime_1.jsx)(antd_1.Space, { style: { width: '100%' }, wrap: true, children: (breadcrumbItems && breadcrumbItems.length > 0) ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(antd_1.Breadcrumb, { items: breadcrumbItems.map(function (ele, index) { return ({
                                                    title: ((0, jsx_runtime_1.jsx)("a", { onClick: function () {
                                                            if (checkSelectRelation()) {
                                                                return;
                                                            }
                                                            var newItems = breadcrumbItems.slice(0, index + 1);
                                                            setBreadcrumbItems(newItems);
                                                            var entity = ele.includes('$') ? ele.split('$')[0] : ele;
                                                            getNodes(entity);
                                                        }, children: ele }))
                                                }); }) }), (0, jsx_runtime_1.jsx)(antd_1.Button, { size: "small", type: "link", onClick: function () {
                                                    setBreadcrumbItems([]);
                                                    getNodes(entity);
                                                }, children: "\u6E05\u7A7A" })] })) : ((0, jsx_runtime_1.jsx)(Text, { type: "secondary", children: "\u8BF7\u5148\u9009\u62E9\u7ED3\u70B9" })) })] }), (0, jsx_runtime_1.jsx)(antd_1.Space, { direction: "vertical", style: { width: '100%' }, children: (0, jsx_runtime_1.jsxs)(antd_1.Space, { direction: "vertical", style: { width: '100%' }, children: [(0, jsx_runtime_1.jsx)(Text, { style: { fontSize: 16 }, children: "\u7ED3\u70B9" }), (0, jsx_runtime_1.jsxs)(antd_1.Row, { gutter: 24, children: [(0, jsx_runtime_1.jsx)(antd_1.Col, { span: 2, children: (0, jsx_runtime_1.jsx)(Text, { style: { whiteSpace: 'nowrap' }, children: "\u5916\u952E" }) }), (0, jsx_runtime_1.jsx)(antd_1.Col, { span: 22, children: (0, jsx_runtime_1.jsx)(antd_1.Space, { wrap: true, children: entityDNode.map(function (ele) { return ((0, jsx_runtime_1.jsx)(antd_1.Tag, { style: { cursor: 'pointer' }, color: "processing", bordered: false, onClick: function () {
                                                            if (checkSelectRelation()) {
                                                                return;
                                                            }
                                                            breadcrumbItems.push(ele);
                                                            setBreadcrumbItems(breadcrumbItems);
                                                            var path = breadcrumbItems.join('.');
                                                            var entity = resolveP(path);
                                                            getNodes(entity);
                                                        }, children: ele })); }) }) })] }), (0, jsx_runtime_1.jsxs)(antd_1.Row, { gutter: 24, children: [(0, jsx_runtime_1.jsx)(antd_1.Col, { span: 2, children: (0, jsx_runtime_1.jsx)(Text, { style: { whiteSpace: 'nowrap', marginRight: 16 }, children: "\u53CD\u6307\u7ED3\u70B9" }) }), (0, jsx_runtime_1.jsx)(antd_1.Col, { span: 22, children: (0, jsx_runtime_1.jsx)(antd_1.Space, { wrap: true, children: entitySNode.map(function (ele) { return ((0, jsx_runtime_1.jsx)(antd_1.Tag, { style: { cursor: 'pointer' }, color: "cyan", bordered: false, onClick: function () {
                                                            if (checkSelectRelation()) {
                                                                return;
                                                            }
                                                            var preNode = breadcrumbItems[breadcrumbItems.length - 1] || entity;
                                                            var parentEntity = preNode.includes('$') ? preNode.split('$')[0] : preNode;
                                                            breadcrumbItems.push("".concat(ele, "$").concat(parentEntity));
                                                            setBreadcrumbItems(breadcrumbItems);
                                                            getNodes(ele);
                                                        }, children: ele })); }) }) })] })] }) }), (0, jsx_runtime_1.jsx)(actionAuthList_1.default, { oakPath: "$actionAuthList-cpn", entity: entity, path: breadcrumbItems.join('.'), onClose: function () {
                                setBreadcrumbItems([]);
                                setOpen(false);
                            }, oakAutoUnmount: true })] }) })] }));
}
exports.default = render;
