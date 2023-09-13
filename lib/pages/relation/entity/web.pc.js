"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_1 = require("antd");
var antd_2 = require("antd");
var Title = antd_2.Typography.Title, Text = antd_2.Typography.Text;
var actionAuth_1 = tslib_1.__importDefault(require("../actionAuth"));
var react_1 = require("react");
var web_pc_module_less_1 = tslib_1.__importDefault(require("./web.pc.module.less"));
function render(props) {
    var _a = props.data, oakFullpath = _a.oakFullpath, entity = _a.entity, actions = _a.actions, checkedActions = _a.checkedActions, hasDirectActionAuth = _a.hasDirectActionAuth, hasDirectRelationAuth = _a.hasDirectRelationAuth, dras = _a.dras, daas = _a.daas, relationIds = _a.relationIds, relations = _a.relations, deduceRelationAttr = _a.deduceRelationAttr;
    var _b = props.methods, onActionsSelected = _b.onActionsSelected, onRelationsSelected = _b.onRelationsSelected, t = _b.t;
    var _c = tslib_1.__read((0, react_1.useState)('actionAuth'), 2), tab = _c[0], setTab = _c[1];
    var items = deduceRelationAttr ? [
        {
            label: 'deduceRelation',
            key: 'deduceRelation',
            children: ((0, jsx_runtime_1.jsxs)("div", tslib_1.__assign({ style: {
                    width: '100%',
                    height: '100%',
                    minHeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                } }, { children: ["\u5BF9\u8C61\u7684actionAuth\u5DF2\u88ABdeduce\u5230[", (0, jsx_runtime_1.jsx)("b", { children: deduceRelationAttr }), "]\u5C5E\u6027\u4E0A"] })))
        },
    ] : [
        {
            label: 'actionAuth',
            key: 'actionAuth',
            children: ((0, jsx_runtime_1.jsx)(actionAuth_1.default, { entity: entity, oakPath: oakFullpath && "".concat(oakFullpath, ".actionAuths"), actions: checkedActions }))
        }
    ];
    /* if (hasDirectActionAuth) {
        items.push(
            {
                label: 'directActionAuth',
                key: 'directActionAuth',
                children: (
                    <Table
                        columns={[
                            {
                                key: '2',
                                title: t('sourceEntity'),
                                width: 100,
                                render: (value, record) => {
                                    return record[2];
                                },
                            },
                            {
                                key: '1',
                                title: t('path'),
                                width: 200,
                                render: (value, record) => {
                                    return record[1];
                                },
                            },
                        ]}
                        dataSource={daas}
                        pagination={false}
                    />
                )
            }
        );
    } */
    // if (relations?.length > 0) {
    //     items.push(
    //         {
    //             label: 'relationAuth',
    //             key: 'relationAuth',
    //             children: (
    //                 <RelationAuth
    //                     entity={entity}
    //                     oakPath={oakFullpath && `${oakFullpath}.relationAuths`}
    //                     relationIds={relationIds}
    //                 />
    //             )
    //         }
    //     );
    // }
    var ActionSelector = actions && ((0, jsx_runtime_1.jsxs)(antd_1.Row, tslib_1.__assign({ style: { width: '100%' }, justify: "center", align: "middle" }, { children: [(0, jsx_runtime_1.jsxs)(Text, tslib_1.__assign({ strong: true }, { children: [t('action'), ":"] })), (0, jsx_runtime_1.jsx)(antd_1.Row, tslib_1.__assign({ style: { flex: 1, marginLeft: 10 }, justify: "start", align: "middle", wrap: true }, { children: (0, jsx_runtime_1.jsx)(antd_1.Checkbox.Group, { options: actions, value: checkedActions, onChange: function (value) { return onActionsSelected(value); }, style: {
                        display: 'flex',
                        flexWrap: 'wrap',
                    } }) }))] })));
    var RelationSelector = relations && ((0, jsx_runtime_1.jsxs)(antd_1.Row, tslib_1.__assign({ style: { width: '100%' }, justify: "center", align: "middle" }, { children: [(0, jsx_runtime_1.jsxs)(Text, tslib_1.__assign({ strong: true }, { children: [t('relation'), ":"] })), (0, jsx_runtime_1.jsx)(antd_1.Row, tslib_1.__assign({ style: { flex: 1, marginLeft: 10 }, justify: "start", align: "middle", wrap: true }, { children: (0, jsx_runtime_1.jsx)(antd_1.Checkbox.Group, { options: relations.map(function (ele) { return ({ label: ele.name, value: ele.id }); }), value: relationIds, onChange: function (value) { return onRelationsSelected(value); }, style: {
                        display: 'flex',
                        flexWrap: 'wrap',
                    } }) }))] })));
    var showActionSelector = ['actionAuth', 'directActionAuth'].includes(tab);
    var showRelationSelector = ['relationAuth', 'directRelationAuth'].includes(tab);
    return ((0, jsx_runtime_1.jsxs)("div", tslib_1.__assign({ className: web_pc_module_less_1.default.container }, { children: [(0, jsx_runtime_1.jsxs)(antd_1.Row, tslib_1.__assign({ justify: "center", style: { margin: 20, padding: 10, minHeight: 100 }, align: "middle" }, { children: [(0, jsx_runtime_1.jsx)(antd_1.Col, tslib_1.__assign({ span: 8 }, { children: (0, jsx_runtime_1.jsxs)(antd_1.Row, tslib_1.__assign({ style: { width: '100%' }, justify: "center", align: "middle" }, { children: [(0, jsx_runtime_1.jsxs)(Text, tslib_1.__assign({ strong: true }, { children: [t('actionAuth:attr.destEntity'), ":"] })), (0, jsx_runtime_1.jsx)(Text, tslib_1.__assign({ code: true, style: { marginLeft: 10 } }, { children: entity }))] })) })), (0, jsx_runtime_1.jsx)(antd_1.Col, tslib_1.__assign({ span: 12 }, { children: showActionSelector ? ActionSelector : (showRelationSelector && RelationSelector) }))] })), (0, jsx_runtime_1.jsx)(antd_1.Tabs, { defaultActiveKey: "1", type: "card", size: "large", items: items, onChange: function (key) { return setTab(key); } })] })));
}
exports.default = render;