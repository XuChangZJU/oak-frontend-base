"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const antd_1 = require("antd");
const { Title, Text } = antd_1.Typography;
const lodash_1 = require("oak-domain/lib/utils/lodash");
const single_1 = tslib_1.__importDefault(require("../../relation/single"));
function render(props) {
    const { cascadeEntityActions, oakDirty, actions, entity, actionAuthList } = props.data;
    const { onChange, t, clean, confirm, onChange2 } = props.methods;
    return ((0, jsx_runtime_1.jsxs)(antd_1.Space, { direction: "vertical", style: { width: '100%' }, children: [(0, jsx_runtime_1.jsx)(single_1.default, { entity: entity }), (0, jsx_runtime_1.jsx)(antd_1.Table, { columns: [
                    {
                        key: '1',
                        title: '源对象',
                        width: 100,
                        render: (value, record) => {
                            const { sourceEntity } = record;
                            return sourceEntity;
                        },
                    },
                    {
                        key: '1',
                        title: '路径',
                        width: 200,
                        render: (value, record) => {
                            const { paths } = record;
                            return paths.map((ele, index) => {
                                if (index === 0) {
                                    return ele;
                                }
                                else {
                                    return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("br", {}), ele] });
                                }
                            });
                        },
                    },
                    {
                        fixed: 'right',
                        title: '相关角色',
                        key: 'operation',
                        width: 300,
                        render: (value, record) => {
                            // const { relations, actionAuths, path } = record;
                            const { relations, relationSelections } = record;
                            return ((0, jsx_runtime_1.jsx)("div", { style: {
                                    width: '100%',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                }, children: relationSelections.map((ele) => {
                                    let checked = false, indeterminate = false;
                                    if (actions && actions.length > 0) {
                                        const relation = relations.find((ele2) => ele2.relationId === ele.id && !ele2.$$deleteAt$$);
                                        if (relation) {
                                            const { deActions } = relation;
                                            checked = (0, lodash_1.difference)(actions, deActions).length === 0;
                                            indeterminate = !checked && (0, lodash_1.intersection)(actions, deActions).length > 0;
                                        }
                                    }
                                    return (0, jsx_runtime_1.jsx)(antd_1.Checkbox, { disabled: actions.length === 0, checked: checked, indeterminate: indeterminate, onChange: ({ target }) => {
                                            onChange2(target.checked, ele.id, record.paths, relations);
                                        }, children: ele.name });
                                }) }));
                        }
                    }
                ], dataSource: actionAuthList, pagination: false }), (0, jsx_runtime_1.jsxs)(antd_1.Row, { justify: "end", style: { marginTop: 20, padding: 5 }, children: [(0, jsx_runtime_1.jsx)(antd_1.Button, { style: { marginRight: 10 }, type: 'primary', disabled: !oakDirty, onClick: () => confirm(), children: t("confirm") }), (0, jsx_runtime_1.jsx)(antd_1.Button, { disabled: !oakDirty, onClick: () => clean(), children: t("reset") })] })] }));
}
exports.default = render;
