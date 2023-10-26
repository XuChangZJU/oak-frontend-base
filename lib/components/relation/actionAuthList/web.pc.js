"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const antd_1 = require("antd");
const antd_2 = require("antd");
const { Title, Text } = antd_2.Typography;
function render(props) {
    const { data, methods } = props;
    const { rows, relations, actions, path, entity, openTip, oakExecutable, onClose } = data;
    const [datasource, setDatasource] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        const tableRows = relations.map((ele) => ({
            relationId: ele.id,
            relation: ele.name,
            actions,
        }));
        setDatasource(tableRows);
    }, [relations]);
    return ((0, jsx_runtime_1.jsxs)(antd_1.Space, { direction: "vertical", style: { width: '100%' }, children: [(0, jsx_runtime_1.jsx)(antd_1.Space, { children: (0, jsx_runtime_1.jsx)(Text, { style: { fontSize: 16 }, children: "\u6388\u6743" }) }), (0, jsx_runtime_1.jsx)(antd_1.Table, { rowKey: 'relationId', dataSource: datasource, columns: [
                    {
                        width: 200,
                        dataIndex: 'relation',
                        title: '角色',
                    },
                    {
                        dataIndex: 'actions',
                        title: '操作权限',
                        render: (value, row) => {
                            const options = value.map((ele) => ({
                                label: ele,
                                value: ele,
                            }));
                            const actionAuth = rows
                                .filter((ele) => ele.relationId === row.relationId)
                                .sort((a, b) => b.deActions.length - a.deActions.length)?.[0];
                            const defaultValue = actionAuth
                                ? actionAuth.deActions
                                : [];
                            return ((0, jsx_runtime_1.jsx)(antd_1.Checkbox.Group, { style: {
                                    width: '100%',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                }, options: options, defaultValue: defaultValue, onChange: (checkedArr) => {
                                    const path2 = path.replaceAll('(user)', '');
                                    if (!actionAuth) {
                                        /* methods.addItem({
                                            relationId:
                                                row.relationId || '',
                                            paths: [path2],
                                            deActions:
                                                checkedArr as string[],
                                            destEntity: entity as string,
                                        }); */
                                    }
                                    else {
                                        methods.updateItem({
                                            deActions: checkedArr,
                                        }, actionAuth.id);
                                    }
                                    if (!checkedArr.length && actionAuth) {
                                        methods.removeItem(actionAuth.id);
                                    }
                                } }));
                        },
                    },
                ], pagination: false }), (0, jsx_runtime_1.jsx)("div", { style: {
                    display: 'flex',
                    width: '100%',
                    justifyContent: 'flex-end',
                    padding: 8,
                }, children: (0, jsx_runtime_1.jsx)(antd_1.Button, { disabled: !path, type: "primary", onClick: () => {
                        methods.execute();
                        onClose();
                    }, children: "\u4FDD\u5B58\u5E76\u5173\u95ED" }) })] }));
}
exports.default = render;
