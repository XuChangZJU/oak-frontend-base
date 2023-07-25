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
    var entity = data.entity, entityDNode = data.entityDNode, entitySNode = data.entitySNode, oakFullpath = data.oakFullpath, showExecuteTip = data.showExecuteTip, rows = data.rows;
    var getNodes = methods.getNodes;
    var _a = tslib_1.__read((0, react_1.useState)(false), 2), open = _a[0], setOpen = _a[1];
    var _b = tslib_1.__read((0, react_1.useState)(false), 2), openTip = _b[0], setOpenTip = _b[1];
    var _c = tslib_1.__read((0, react_1.useState)([]), 2), breadcrumbItems = _c[0], setBreadcrumbItems = _c[1];
    (0, react_1.useEffect)(function () {
        if (!showExecuteTip) {
            setOpenTip(false);
        }
    }, [showExecuteTip]);
    var checkExecute = function () {
        if (showExecuteTip) {
            methods.setMessage({
                content: '有未保存的权限设置，请先保存',
                type: 'warning',
            });
            setOpenTip(true);
            return true;
        }
    };
    return ((0, jsx_runtime_1.jsxs)(antd_1.Space, tslib_1.__assign({ direction: "vertical", style: { width: '100%' } }, { children: [(0, jsx_runtime_1.jsx)(antd_1.Button, tslib_1.__assign({ onClick: function () { return setOpen(true); } }, { children: "\u8BBE\u7F6E" })), (0, jsx_runtime_1.jsx)(antd_1.Modal, tslib_1.__assign({ title: "\u6743\u9650\u8BBE\u7F6E", open: open, destroyOnClose: true, footer: ((0, jsx_runtime_1.jsx)(antd_1.Button, tslib_1.__assign({ onClick: function () { return setOpen(false); } }, { children: "\u5173\u95ED" }))), onCancel: function () { return setOpen(false); }, width: 900 }, { children: (0, jsx_runtime_1.jsxs)(antd_1.Space, tslib_1.__assign({ direction: "vertical", style: { width: '100%', marginTop: 16 }, size: 16 }, { children: [(0, jsx_runtime_1.jsxs)(antd_1.Space, tslib_1.__assign({ direction: "vertical" }, { children: [(0, jsx_runtime_1.jsx)(Text, tslib_1.__assign({ style: { fontSize: 16 } }, { children: "\u8DEF\u5F84" })), (0, jsx_runtime_1.jsx)(antd_1.Space, tslib_1.__assign({ style: { width: '100%' }, wrap: true }, { children: (breadcrumbItems && breadcrumbItems.length > 0) ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(antd_1.Breadcrumb, { items: breadcrumbItems.map(function (ele, index) { return ({
                                                    title: ((0, jsx_runtime_1.jsx)("a", tslib_1.__assign({ onClick: function () {
                                                            if (checkExecute()) {
                                                                return;
                                                            }
                                                            var newItems = breadcrumbItems.slice(0, index + 1);
                                                            setBreadcrumbItems(newItems);
                                                            var entity = ele.includes('$') ? ele.split('$')[0] : ele;
                                                            getNodes(entity);
                                                        } }, { children: ele })))
                                                }); }) }), (0, jsx_runtime_1.jsx)(antd_1.Button, tslib_1.__assign({ size: "small", type: "link", onClick: function () {
                                                    setBreadcrumbItems([]);
                                                    getNodes(entity);
                                                } }, { children: "\u6E05\u7A7A" }))] })) : ((0, jsx_runtime_1.jsx)(Text, tslib_1.__assign({ type: "secondary" }, { children: "\u8BF7\u5148\u9009\u62E9\u7ED3\u70B9" }))) }))] })), (0, jsx_runtime_1.jsx)(antd_1.Space, tslib_1.__assign({ direction: "vertical", style: { width: '100%' } }, { children: (0, jsx_runtime_1.jsxs)(antd_1.Space, tslib_1.__assign({ direction: "vertical", style: { width: '100%' } }, { children: [(0, jsx_runtime_1.jsx)(Text, tslib_1.__assign({ style: { fontSize: 16 } }, { children: "\u7ED3\u70B9" })), (0, jsx_runtime_1.jsxs)(antd_1.Space, tslib_1.__assign({ align: "start", style: { width: '100%' } }, { children: [(0, jsx_runtime_1.jsx)(Text, { children: "\u5916\u952E" }), (0, jsx_runtime_1.jsx)(antd_1.Space, tslib_1.__assign({ wrap: true }, { children: entityDNode.map(function (ele) { return ((0, jsx_runtime_1.jsx)(antd_1.Tag, tslib_1.__assign({ style: { cursor: 'pointer' }, color: "processing", bordered: false, onClick: function () {
                                                        if (checkExecute()) {
                                                            return;
                                                        }
                                                        breadcrumbItems.push(ele);
                                                        setBreadcrumbItems(breadcrumbItems);
                                                        getNodes(ele);
                                                    } }, { children: ele }))); }) }))] })), (0, jsx_runtime_1.jsxs)(antd_1.Space, tslib_1.__assign({ align: "start", style: { width: '100%' } }, { children: [(0, jsx_runtime_1.jsx)(Text, { children: "\u53CD\u6307\u7ED3\u70B9" }), (0, jsx_runtime_1.jsx)(antd_1.Space, tslib_1.__assign({ wrap: true }, { children: entitySNode.map(function (ele) { return ((0, jsx_runtime_1.jsx)(antd_1.Tag, tslib_1.__assign({ style: { cursor: 'pointer' }, color: "cyan", bordered: false, onClick: function () {
                                                        if (checkExecute()) {
                                                            return;
                                                        }
                                                        var parentEntity = breadcrumbItems[breadcrumbItems.length - 1] || entity;
                                                        breadcrumbItems.push("".concat(ele, "$").concat(parentEntity));
                                                        setBreadcrumbItems(breadcrumbItems);
                                                        getNodes(ele);
                                                    } }, { children: ele }))); }) }))] }))] })) })), (0, jsx_runtime_1.jsx)(actionAuthList_1.default, { oakPath: "$actionAuthList-cpn", entity: entity, path: breadcrumbItems.join('.'), openTip: openTip })] })) }))] })));
}
exports.default = render;
