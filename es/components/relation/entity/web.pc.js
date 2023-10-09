import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Row, Col, Tabs, Checkbox } from 'antd';
import { Typography } from 'antd';
const { Title, Text } = Typography;
import ActionAuth from '../actionAuth';
import { useState } from 'react';
import Styles from './web.pc.module.less';
export default function render(props) {
    const { oakFullpath, entity, actions, checkedActions, hasDirectActionAuth, hasDirectRelationAuth, dras, daas, relationIds, relations, deduceRelationAttr } = props.data;
    const { onActionsSelected, onRelationsSelected, t } = props.methods;
    const [tab, setTab] = useState('actionAuth');
    const items = deduceRelationAttr ? [
        {
            label: 'deduceRelation',
            key: 'deduceRelation',
            children: (_jsxs("div", { style: {
                    width: '100%',
                    height: '100%',
                    minHeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }, children: ["\u5BF9\u8C61\u7684actionAuth\u5DF2\u88ABdeduce\u5230[", _jsx("b", { children: deduceRelationAttr }), "]\u5C5E\u6027\u4E0A"] }))
        },
    ] : [
        {
            label: 'actionAuth',
            key: 'actionAuth',
            children: (_jsx(ActionAuth, { entity: entity, oakPath: oakFullpath && `${oakFullpath}.actionAuths`, actions: checkedActions }))
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
    const ActionSelector = actions && (_jsxs(Row, { style: { width: '100%' }, justify: "center", align: "middle", children: [_jsxs(Text, { strong: true, children: [t('action'), ":"] }), _jsx(Row, { style: { flex: 1, marginLeft: 10 }, justify: "start", align: "middle", wrap: true, children: _jsx(Checkbox.Group, { options: actions, value: checkedActions, onChange: (value) => onActionsSelected(value), style: {
                        display: 'flex',
                        flexWrap: 'wrap',
                    } }) })] }));
    const RelationSelector = relations && (_jsxs(Row, { style: { width: '100%' }, justify: "center", align: "middle", children: [_jsxs(Text, { strong: true, children: [t('relation'), ":"] }), _jsx(Row, { style: { flex: 1, marginLeft: 10 }, justify: "start", align: "middle", wrap: true, children: _jsx(Checkbox.Group, { options: relations.map(ele => ({ label: ele.name, value: ele.id })), value: relationIds, onChange: (value) => onRelationsSelected(value), style: {
                        display: 'flex',
                        flexWrap: 'wrap',
                    } }) })] }));
    const showActionSelector = ['actionAuth', 'directActionAuth'].includes(tab);
    const showRelationSelector = ['relationAuth', 'directRelationAuth'].includes(tab);
    return (_jsxs("div", { className: Styles.container, children: [_jsxs(Row, { justify: "center", style: { margin: 20, padding: 10, minHeight: 100 }, align: "middle", children: [_jsx(Col, { span: 8, children: _jsxs(Row, { style: { width: '100%' }, justify: "center", align: "middle", children: [_jsxs(Text, { strong: true, children: [t('actionAuth:attr.destEntity'), ":"] }), _jsx(Text, { code: true, style: { marginLeft: 10 }, children: entity })] }) }), _jsx(Col, { span: 12, children: showActionSelector ? ActionSelector : (showRelationSelector && RelationSelector) })] }), _jsx(Tabs, { defaultActiveKey: "1", type: "card", size: "large", items: items, onChange: (key) => setTab(key) })] }));
}
