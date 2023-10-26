"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const antd_1 = require("antd");
const antd_2 = require("antd");
const { Title, Text } = antd_2.Typography;
const lodash_1 = require("oak-domain/lib/utils/lodash");
function render(props) {
    const { relationIds, relationAuths, oakDirty, auths, sourceRelations } = props.data;
    const { onChange, t, clean, confirm } = props.methods;
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(antd_1.Table, { columns: [
                    {
                        key: '1',
                        title: t('relationAuth:attr.sourceEntity'),
                        width: 100,
                        render: (value, record) => record[2],
                    },
                    {
                        key: '1',
                        title: t('relationAuth:attr.path'),
                        width: 200,
                        render: (value, record) => record[1],
                    },
                    {
                        fixed: 'right',
                        title: t('grantedRoles'),
                        key: 'roles',
                        width: 300,
                        render: (value, record) => {
                            const sourceEntity = record[2];
                            const relations = sourceRelations.filter(ele => ele.entity === sourceEntity && !relationIds.includes(ele.id));
                            return ((0, jsx_runtime_1.jsx)("div", { style: {
                                    width: '100%',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                }, children: relations?.map((r) => {
                                    const disabled = relationIds.length === 0;
                                    let checked = false, indeterminate = false;
                                    if (!disabled && relationAuths) {
                                        const includedRelationIds = [];
                                        for (const auth of relationAuths) {
                                            if (!auth.$$deleteAt$$ && auth.sourceRelationId === r.id /* && auth.path === record[1] */) {
                                                includedRelationIds.push(auth.destRelationId);
                                            }
                                        }
                                        checked = (0, lodash_1.difference)(relationIds, includedRelationIds).length === 0;
                                        indeterminate = !checked && (0, lodash_1.intersection)(relationIds, includedRelationIds).length > 0;
                                    }
                                    return ((0, jsx_runtime_1.jsx)(antd_1.Checkbox, { disabled: disabled, checked: checked, indeterminate: indeterminate, onChange: ({ target }) => {
                                            const { checked } = target;
                                            const refRelationAuths = relationAuths?.filter(ele => ele.sourceRelationId === r.id /*&&  ele.path === record[1] */
                                                && relationIds.includes(ele.destRelationId));
                                            onChange(checked, r.id, record[1], refRelationAuths);
                                        }, children: r.name }));
                                }) }));
                        }
                    }
                ], dataSource: auths, pagination: false }), (0, jsx_runtime_1.jsxs)(antd_1.Row, { justify: "end", style: { marginTop: 20, padding: 5 }, children: [(0, jsx_runtime_1.jsx)(antd_1.Button, { style: { marginRight: 10 }, type: 'primary', disabled: !oakDirty, onClick: () => confirm(), children: t("confirm") }), (0, jsx_runtime_1.jsx)(antd_1.Button, { disabled: !oakDirty, onClick: () => clean(), children: t("reset") })] })] }));
}
exports.default = render;
