"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var antd_1 = require("antd");
var antd_2 = require("antd");
var Title = antd_2.Typography.Title, Text = antd_2.Typography.Text;
function render(props) {
    var data = props.data, methods = props.methods;
    var rows = data.rows, relations = data.relations, actions = data.actions, path = data.path, entity = data.entity, openTip = data.openTip, oakExecutable = data.oakExecutable;
    var _a = tslib_1.__read((0, react_1.useState)([]), 2), datasource = _a[0], setDatasource = _a[1];
    (0, react_1.useEffect)(function () {
        var tableRows = relations.map(function (ele) { return ({
            relationId: ele.id,
            relation: ele.name,
            actions: actions,
        }); });
        setDatasource(tableRows);
    }, [relations]);
    return ((0, jsx_runtime_1.jsxs)(antd_1.Space, tslib_1.__assign({ direction: "vertical", style: { width: '100%' } }, { children: [(0, jsx_runtime_1.jsxs)(antd_1.Space, { children: [(0, jsx_runtime_1.jsx)(Text, tslib_1.__assign({ style: { fontSize: 16 } }, { children: "\u6388\u6743" })), (0, jsx_runtime_1.jsx)(antd_1.Tooltip, tslib_1.__assign({ title: "点击保存", open: openTip, placement: "right" }, { children: (0, jsx_runtime_1.jsx)(antd_1.Button, tslib_1.__assign({ type: "link", disabled: !oakExecutable, onClick: function () { return methods.execute(); } }, { children: "\u4FDD\u5B58" })) }))] }), (0, jsx_runtime_1.jsx)(antd_1.Table, { rowKey: "relationId", dataSource: datasource, columns: [
                    {
                        dataIndex: 'relation',
                        title: '角色'
                    },
                    {
                        dataIndex: 'actions',
                        title: '操作权限',
                        render: function (value, row) {
                            var options = value.map(function (ele) { return ({
                                label: ele,
                                value: ele,
                            }); });
                            var actionAuth = rows.find(function (ele) { return ele.relationId === row.relationId; });
                            var defaultValue = actionAuth ? actionAuth.deActions : [];
                            return ((0, jsx_runtime_1.jsx)(antd_1.Checkbox.Group, { options: options, defaultValue: defaultValue, onChange: function (checkedArr) {
                                    if (!actionAuth) {
                                        methods.addItem({
                                            relationId: row.relationId,
                                            path: path,
                                            deActions: checkedArr,
                                            destEntity: entity,
                                        });
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
                        }
                    }
                ], pagination: false })] })));
}
exports.default = render;
