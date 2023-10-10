"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const antd_1 = require("antd");
const antd_2 = require("antd");
const { Title, Text } = antd_2.Typography;
function render(props) {
    const { cascadeEntityActions, oakDirty, entity, relationName } = props.data;
    const { onChange, t, clean, confirm } = props.methods;
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)(antd_1.Row, { justify: "center", style: { margin: 20, padding: 10 }, children: [(0, jsx_runtime_1.jsxs)(antd_1.Row, { style: { marginRight: 10 }, children: [(0, jsx_runtime_1.jsx)(Title, { level: 4, children: "\u5F53\u524D\u5BF9\u8C61\uFF1A" }), (0, jsx_runtime_1.jsx)(Text, { code: true, children: entity })] }), (0, jsx_runtime_1.jsxs)(antd_1.Row, { children: [(0, jsx_runtime_1.jsx)(Title, { level: 4, children: "\u5F53\u524D\u89D2\u8272\uFF1A" }), (0, jsx_runtime_1.jsx)(Text, { code: true, children: relationName })] })] }), (0, jsx_runtime_1.jsx)(antd_1.Table, { columns: [
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
                            return ((0, jsx_runtime_1.jsx)(antd_1.Checkbox.Group, { style: {
                                    width: '100%',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                }, options: actions, value: actionAuth?.deActions, onChange: (value) => onChange(value, path, actionAuth) }));
                        }
                    }
                ], dataSource: cascadeEntityActions, pagination: false }), (0, jsx_runtime_1.jsxs)(antd_1.Row, { justify: "end", style: { marginTop: 20, padding: 5 }, children: [(0, jsx_runtime_1.jsx)(antd_1.Button, { style: { marginRight: 10 }, type: 'primary', disabled: !oakDirty, onClick: () => confirm(), children: t("confirm") }), (0, jsx_runtime_1.jsx)(antd_1.Button, { disabled: !oakDirty, onClick: () => clean(), children: t("reset") })] })] }));
}
exports.default = render;
