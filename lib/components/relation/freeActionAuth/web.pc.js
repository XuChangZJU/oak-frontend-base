"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_1 = require("antd");
function render(props) {
    var _a = props.data, entity = _a.entity, freeActionAuths = _a.freeActionAuths, actions = _a.actions, oakDirty = _a.oakDirty;
    var _b = props.methods, onChange = _b.onChange, confirm = _b.confirm, t = _b.t, clean = _b.clean;
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(antd_1.Row, tslib_1.__assign({ wrap: true, justify: "start", style: { paddingLeft: 40 } }, { children: actions === null || actions === void 0 ? void 0 : actions.map(function (action) {
                    var checked = !!(freeActionAuths === null || freeActionAuths === void 0 ? void 0 : freeActionAuths.find(function (ele) { return ele.deActions.includes(action) && !ele.$$deleteAt$$; }));
                    return ((0, jsx_runtime_1.jsx)(antd_1.Row, tslib_1.__assign({ style: { padding: 10 } }, { children: (0, jsx_runtime_1.jsx)(antd_1.Checkbox, tslib_1.__assign({ checked: checked, onChange: function (_a) {
                                var target = _a.target;
                                var checked = target.checked;
                                var freeActionAuth = freeActionAuths === null || freeActionAuths === void 0 ? void 0 : freeActionAuths.find(function (ele) { return ele.deActions.includes(action); });
                                onChange(checked, action, freeActionAuth);
                            } }, { children: action })) })));
                }) })), (0, jsx_runtime_1.jsxs)(antd_1.Row, tslib_1.__assign({ justify: "end", style: { marginTop: 20, padding: 5 } }, { children: [(0, jsx_runtime_1.jsx)(antd_1.Button, tslib_1.__assign({ style: { marginRight: 10 }, type: 'primary', disabled: !oakDirty, onClick: function () { return confirm(); } }, { children: t("confirm") })), (0, jsx_runtime_1.jsx)(antd_1.Button, tslib_1.__assign({ disabled: !oakDirty, onClick: function () { return clean(); } }, { children: t("reset") }))] }))] }));
}
exports.default = render;
