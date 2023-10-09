"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const antd_1 = require("antd");
const antd_2 = require("antd");
const { Title, Text } = antd_2.Typography;
const actionAuth_1 = tslib_1.__importDefault(require("../actionAuth"));
const react_1 = require("react");
const web_pc_module_less_1 = tslib_1.__importDefault(require("./web.pc.module.less"));
function render(props) {
    const { oakFullpath, entity, actions, checkedActions, hasDirectActionAuth, hasDirectRelationAuth, dras, daas, relationIds, relations, deduceRelationAttr } = props.data;
    const { onActionsSelected, onRelationsSelected, t } = props.methods;
    const [tab, setTab] = (0, react_1.useState)('actionAuth');
    const items = deduceRelationAttr ? [
        {
            label: 'deduceRelation',
            key: 'deduceRelation',
            children: ((0, jsx_runtime_1.jsxs)("div", { style: {
                    width: '100%',
                    height: '100%',
                    minHeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }, children: ["\u5BF9\u8C61\u7684actionAuth\u5DF2\u88ABdeduce\u5230[", (0, jsx_runtime_1.jsx)("b", { children: deduceRelationAttr }), "]\u5C5E\u6027\u4E0A"] }))
        },
    ] : [
        {
            label: 'actionAuth',
            key: 'actionAuth',
            children: ((0, jsx_runtime_1.jsx)(actionAuth_1.default, { entity: entity, oakPath: oakFullpath && `${oakFullpath}.actionAuths`, actions: checkedActions }))
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
    const ActionSelector = actions && ((0, jsx_runtime_1.jsxs)(antd_1.Row, { style: { width: '100%' }, justify: "center", align: "middle", children: [(0, jsx_runtime_1.jsxs)(Text, { strong: true, children: [t('action'), ":"] }), (0, jsx_runtime_1.jsx)(antd_1.Row, { style: { flex: 1, marginLeft: 10 }, justify: "start", align: "middle", wrap: true, children: (0, jsx_runtime_1.jsx)(antd_1.Checkbox.Group, { options: actions, value: checkedActions, onChange: (value) => onActionsSelected(value), style: {
                        display: 'flex',
                        flexWrap: 'wrap',
                    } }) })] }));
    const RelationSelector = relations && ((0, jsx_runtime_1.jsxs)(antd_1.Row, { style: { width: '100%' }, justify: "center", align: "middle", children: [(0, jsx_runtime_1.jsxs)(Text, { strong: true, children: [t('relation'), ":"] }), (0, jsx_runtime_1.jsx)(antd_1.Row, { style: { flex: 1, marginLeft: 10 }, justify: "start", align: "middle", wrap: true, children: (0, jsx_runtime_1.jsx)(antd_1.Checkbox.Group, { options: relations.map(ele => ({ label: ele.name, value: ele.id })), value: relationIds, onChange: (value) => onRelationsSelected(value), style: {
                        display: 'flex',
                        flexWrap: 'wrap',
                    } }) })] }));
    const showActionSelector = ['actionAuth', 'directActionAuth'].includes(tab);
    const showRelationSelector = ['relationAuth', 'directRelationAuth'].includes(tab);
    return ((0, jsx_runtime_1.jsxs)("div", { className: web_pc_module_less_1.default.container, children: [(0, jsx_runtime_1.jsxs)(antd_1.Row, { justify: "center", style: { margin: 20, padding: 10, minHeight: 100 }, align: "middle", children: [(0, jsx_runtime_1.jsx)(antd_1.Col, { span: 8, children: (0, jsx_runtime_1.jsxs)(antd_1.Row, { style: { width: '100%' }, justify: "center", align: "middle", children: [(0, jsx_runtime_1.jsxs)(Text, { strong: true, children: [t('actionAuth:attr.destEntity'), ":"] }), (0, jsx_runtime_1.jsx)(Text, { code: true, style: { marginLeft: 10 }, children: entity })] }) }), (0, jsx_runtime_1.jsx)(antd_1.Col, { span: 12, children: showActionSelector ? ActionSelector : (showRelationSelector && RelationSelector) })] }), (0, jsx_runtime_1.jsx)(antd_1.Tabs, { defaultActiveKey: "1", type: "card", size: "large", items: items, onChange: (key) => setTab(key) })] }));
}
exports.default = render;
