import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Table, Checkbox, Button, Row } from 'antd';
import { Typography } from 'antd';
const { Title, Text } = Typography;
import { intersection, difference } from 'oak-domain/lib/utils/lodash';
export default function render(props) {
    const { relationIds, relationAuths, oakDirty, auths, sourceRelations } = props.data;
    const { onChange, t, clean, confirm } = props.methods;
    return (_jsxs(_Fragment, { children: [_jsx(Table, { columns: [
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
                            return (_jsx("div", { style: {
                                    width: '100%',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                }, children: relations?.map((r) => {
                                    const disabled = relationIds.length === 0;
                                    let checked = false, indeterminate = false;
                                    if (!disabled && relationAuths) {
                                        const includedRelationIds = [];
                                        for (const auth of relationAuths) {
                                            if (!auth.$$deleteAt$$ && auth.sourceRelationId === r.id && auth.path === record[1]) {
                                                includedRelationIds.push(auth.destRelationId);
                                            }
                                        }
                                        checked = difference(relationIds, includedRelationIds).length === 0;
                                        indeterminate = !checked && intersection(relationIds, includedRelationIds).length > 0;
                                    }
                                    return (_jsx(Checkbox, { disabled: disabled, checked: checked, indeterminate: indeterminate, onChange: ({ target }) => {
                                            const { checked } = target;
                                            const refRelationAuths = relationAuths?.filter(ele => ele.sourceRelationId === r.id && ele.path === record[1]
                                                && relationIds.includes(ele.destRelationId));
                                            onChange(checked, r.id, record[1], refRelationAuths);
                                        }, children: r.name }));
                                }) }));
                        }
                    }
                ], dataSource: auths, pagination: false }), _jsxs(Row, { justify: "end", style: { marginTop: 20, padding: 5 }, children: [_jsx(Button, { style: { marginRight: 10 }, type: 'primary', disabled: !oakDirty, onClick: () => confirm(), children: t("confirm") }), _jsx(Button, { disabled: !oakDirty, onClick: () => clean(), children: t("reset") })] })] }));
}
