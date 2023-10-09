import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Table, Checkbox, Button, Row } from 'antd';
import { Typography } from 'antd';
const { Title, Text } = Typography;
export default function render(props) {
    const { cascadeEntityActions, oakDirty, entity, relationName } = props.data;
    const { onChange, t, clean, confirm } = props.methods;
    return (_jsxs(_Fragment, { children: [_jsxs(Row, { justify: "center", style: { margin: 20, padding: 10 }, children: [_jsxs(Row, { style: { marginRight: 10 }, children: [_jsx(Title, { level: 4, children: "\u5F53\u524D\u5BF9\u8C61\uFF1A" }), _jsx(Text, { code: true, children: entity })] }), _jsxs(Row, { children: [_jsx(Title, { level: 4, children: "\u5F53\u524D\u89D2\u8272\uFF1A" }), _jsx(Text, { code: true, children: relationName })] })] }), _jsx(Table, { columns: [
                    {
                        key: '1',
                        title: '目标对象',
                        width: 100,
                        render: (value, record) => {
                            const { path } = record;
                            return path[0];
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
                        title: '操作',
                        key: 'operation',
                        width: 300,
                        render: (value, record) => {
                            const { actions, actionAuth, path } = record;
                            return (_jsx(Checkbox.Group, { style: {
                                    width: '100%',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                }, options: actions, value: actionAuth?.deActions, onChange: (value) => onChange(value, path, actionAuth) }));
                        }
                    }
                ], dataSource: cascadeEntityActions, pagination: false }), _jsxs(Row, { justify: "end", style: { marginTop: 20, padding: 5 }, children: [_jsx(Button, { style: { marginRight: 10 }, type: 'primary', disabled: !oakDirty, onClick: () => confirm(), children: t("confirm") }), _jsx(Button, { disabled: !oakDirty, onClick: () => clean(), children: t("reset") })] })] }));
}
