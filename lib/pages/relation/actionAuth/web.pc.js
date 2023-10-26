"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const antd_1 = require("antd");
const { Title, Text } = antd_1.Typography;
const lodash_1 = require("oak-domain/lib/utils/lodash");
const single_1 = tslib_1.__importDefault(require("../../../components/relation/single"));
function render(props) {
    const { cascadeEntityActions, oakDirty, actions, entity } = props.data;
    const { onChange, t, clean, confirm } = props.methods;
    return ((0, jsx_runtime_1.jsxs)(antd_1.Space, { direction: "vertical", style: { width: '100%' }, children: [(0, jsx_runtime_1.jsx)(single_1.default, { entity: entity }), (0, jsx_runtime_1.jsx)(antd_1.Table, { columns: [
                    {
                        key: '1',
                        title: '源对象',
                        width: 100,
                        render: (value, record) => {
                            const { path } = record;
                            return path[2];
                        },
                    },
                    {
                        key: '1',
                        title: '路径',
                        width: 200,
                        render: (value, record) => {
                            const { path } = record;
                            return path[1];
                        },
                    },
                    {
                        fixed: 'right',
                        title: '相关角色',
                        key: 'operation',
                        width: 300,
                        render: (value, record) => {
                            const { relations, actionAuths, path } = record;
                            return ((0, jsx_runtime_1.jsx)("div", { style: {
                                    width: '100%',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                }, children: relations?.map((r) => {
                                    let checked = false, indeterminate = false;
                                    // filter出对应path的actionAuth来决定relation的check
                                    // sort deActions长的在后，不然会影响checked
                                    const actionAuthsByPath = actionAuths?.filter((ele) => false /* for compile ele.paths.includes(path[1])*/)
                                        .sort((a, b) => b.deActions.length - a.deActions.length);
                                    if (actionAuthsByPath && actions.length > 0) {
                                        for (const aa of actionAuthsByPath) {
                                            // 1.relationId相同，deActions也要相同
                                            // 如果path中存在多对一的情况要使用name进行判断
                                            if (!aa.$$deleteAt$$ && (aa.relationId === r.id
                                                || (record.path.includes('$') && aa.relation?.name === r.name))) {
                                                const { deActions } = aa;
                                                checked = (0, lodash_1.difference)(actions, deActions).length === 0;
                                                indeterminate = !checked && (0, lodash_1.intersection)(actions, deActions).length > 0;
                                                break;
                                            }
                                        }
                                    }
                                    return ((0, jsx_runtime_1.jsx)(antd_1.Checkbox, { disabled: actions.length === 0, checked: checked, indeterminate: indeterminate, onChange: ({ target }) => {
                                            const { checked } = target;
                                            const actionAuths2 = actionAuths?.filter(ele => ele.relationId === r.id || (record.path.includes('$') && ele.relation?.name === r.name));
                                            onChange(checked, r.id, path[1], actionAuths2);
                                        }, children: r.name }));
                                }) }));
                        }
                    }
                ], dataSource: cascadeEntityActions, pagination: false }), (0, jsx_runtime_1.jsxs)(antd_1.Row, { justify: "end", style: { marginTop: 20, padding: 5 }, children: [(0, jsx_runtime_1.jsx)(antd_1.Button, { style: { marginRight: 10 }, type: 'primary', disabled: !oakDirty, onClick: () => confirm(), children: t("confirm") }), (0, jsx_runtime_1.jsx)(antd_1.Button, { disabled: !oakDirty, onClick: () => clean(), children: t("reset") })] })] }));
}
exports.default = render;
