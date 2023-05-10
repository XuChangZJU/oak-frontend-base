"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_1 = require("antd");
var antd_2 = require("antd");
var Title = antd_2.Typography.Title, Text = antd_2.Typography.Text;
var actionAuth_1 = tslib_1.__importDefault(require("../actionAuth"));
var directActionAuth_1 = tslib_1.__importDefault(require("../directActionAuth"));
var freeActionAuth_1 = tslib_1.__importDefault(require("../freeActionAuth"));
var relationAuth_1 = tslib_1.__importDefault(require("../relationAuth"));
var directRelationAuth_1 = tslib_1.__importDefault(require("../directRelationAuth"));
var react_1 = require("react");
function render(props) {
    var _a = props.data, oakFullpath = _a.oakFullpath, entity = _a.entity, actions = _a.actions, action = _a.action, hasDirectActionAuth = _a.hasDirectActionAuth, hasDirectRelationAuth = _a.hasDirectRelationAuth, relationId = _a.relationId, relations = _a.relations, deducedRelationAttr = _a.deducedRelationAttr;
    var _b = props.methods, onActionSelected = _b.onActionSelected, onRelationSelected = _b.onRelationSelected, t = _b.t;
    var _c = tslib_1.__read((0, react_1.useState)('freeActionAuth'), 2), tab = _c[0], setTab = _c[1];
    var items = deducedRelationAttr ? [
        {
            label: 'deducedRelation',
            key: 'deducedRelation',
            children: ((0, jsx_runtime_1.jsxs)("div", { children: ["\u5BF9\u8C61\u7684actionAuth\u5DF2\u88ABdeduce\u5230$", deducedRelationAttr, "\u5C5E\u6027\u4E0A"] }))
        },
    ] : [
        {
            label: 'freeActionAuth',
            key: 'freeActionAuth',
            children: ((0, jsx_runtime_1.jsx)(freeActionAuth_1.default, { entity: entity, oakPath: oakFullpath && "".concat(oakFullpath, ".freeActionAuths") }))
        },
        {
            label: 'actionAuth',
            key: 'actionAuth',
            children: ((0, jsx_runtime_1.jsx)(actionAuth_1.default, { entity: entity, oakPath: oakFullpath && "".concat(oakFullpath, ".actionAuths"), action: action }))
        }
    ];
    if (hasDirectActionAuth) {
        items.push({
            label: 'directActionAuth',
            key: 'directActionAuth',
            children: ((0, jsx_runtime_1.jsx)(directActionAuth_1.default, { entity: entity, oakPath: oakFullpath && "".concat(oakFullpath, ".directActionAuths"), action: action }))
        });
    }
    if ((relations === null || relations === void 0 ? void 0 : relations.length) > 0) {
        items.push({
            label: 'relationAuth',
            key: 'relationAuth',
            children: ((0, jsx_runtime_1.jsx)(relationAuth_1.default, { entity: entity, oakPath: oakFullpath && "".concat(oakFullpath, ".relationAuths"), relationId: relationId }))
        });
    }
    if (hasDirectRelationAuth) {
        items.push({
            label: 'directRelationAuth',
            key: 'directRelationAuth',
            children: ((0, jsx_runtime_1.jsx)(directRelationAuth_1.default, { entity: entity, oakPath: oakFullpath && "".concat(oakFullpath, ".directRelationAuths"), relationId: relationId }))
        });
    }
    var ActionSelector = ((0, jsx_runtime_1.jsxs)(antd_1.Row, tslib_1.__assign({ style: { width: '100%' }, justify: "center", align: "middle" }, { children: [(0, jsx_runtime_1.jsxs)(Text, tslib_1.__assign({ strong: true }, { children: [t('action'), ":"] })), (0, jsx_runtime_1.jsx)(antd_1.Row, tslib_1.__assign({ style: { flex: 1, marginLeft: 10 }, justify: "start", align: "middle", wrap: true }, { children: actions === null || actions === void 0 ? void 0 : actions.map(function (a) { return ((0, jsx_runtime_1.jsx)(antd_1.Radio, tslib_1.__assign({ checked: a === action, onChange: function (_a) {
                        var target = _a.target;
                        if (target.checked) {
                            onActionSelected(a);
                        }
                    } }, { children: a }))); }) }))] })));
    var RelationSelector = ((0, jsx_runtime_1.jsxs)(antd_1.Row, tslib_1.__assign({ style: { width: '100%' }, justify: "center", align: "middle" }, { children: [(0, jsx_runtime_1.jsxs)(Text, tslib_1.__assign({ strong: true }, { children: [t('relation'), ":"] })), (0, jsx_runtime_1.jsx)(antd_1.Row, tslib_1.__assign({ style: { flex: 1, marginLeft: 10 }, justify: "start", align: "middle", wrap: true }, { children: relations === null || relations === void 0 ? void 0 : relations.map(function (r) { return ((0, jsx_runtime_1.jsx)(antd_1.Radio, tslib_1.__assign({ checked: r.id === relationId, onChange: function (_a) {
                        var target = _a.target;
                        if (target.checked) {
                            onRelationSelected(r.id);
                        }
                    } }, { children: r.name }))); }) }))] })));
    var showActionSelector = ['actionAuth', 'directActionAuth'].includes(tab);
    var showRelationSelector = ['relationAuth', 'directRelationAuth'].includes(tab);
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)(antd_1.Row, tslib_1.__assign({ justify: "center", style: { margin: 20, padding: 10, minHeight: 100 }, align: "middle" }, { children: [(0, jsx_runtime_1.jsx)(antd_1.Col, tslib_1.__assign({ span: 8 }, { children: (0, jsx_runtime_1.jsxs)(antd_1.Row, tslib_1.__assign({ style: { width: '100%' }, justify: "center", align: "middle" }, { children: [(0, jsx_runtime_1.jsxs)(Text, tslib_1.__assign({ strong: true }, { children: [t('actionAuth:attr.destEntity'), ":"] })), (0, jsx_runtime_1.jsx)(Text, tslib_1.__assign({ code: true, style: { marginLeft: 10 } }, { children: entity }))] })) })), (0, jsx_runtime_1.jsx)(antd_1.Col, tslib_1.__assign({ span: 12 }, { children: showActionSelector ? ActionSelector : (showRelationSelector && RelationSelector) }))] })), (0, jsx_runtime_1.jsx)(antd_1.Tabs, { defaultActiveKey: "1", type: "card", size: "large", items: items, onChange: function (key) { return setTab(key); } })] }));
}
exports.default = render;
