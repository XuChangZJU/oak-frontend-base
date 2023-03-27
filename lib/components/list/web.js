"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_1 = require("antd");
var actionBtn_1 = tslib_1.__importDefault(require("../actionBtn"));
var mobile_module_less_1 = tslib_1.__importDefault(require("./mobile.module.less"));
var classnames_1 = tslib_1.__importDefault(require("classnames"));
function Render(props) {
    var methods = props.methods, data = props.data;
    var t = methods.t;
    var oakLoading = data.oakLoading, entity = data.entity, extraActions = data.extraActions, mobileData = data.mobileData, onAction = data.onAction, _a = data.disabledOp, disabledOp = _a === void 0 ? false : _a;
    return ((0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ className: mobile_module_less_1.default.container }, { children: oakLoading ? ((0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ className: mobile_module_less_1.default.loadingView }, { children: (0, jsx_runtime_1.jsx)(antd_1.Spin, { size: 'large' }) }))) : ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: mobileData && mobileData.map(function (ele) {
                var _a, _b;
                return ((0, jsx_runtime_1.jsxs)("div", tslib_1.__assign({ className: mobile_module_less_1.default.card }, { children: [ele.title && ((0, jsx_runtime_1.jsxs)("div", tslib_1.__assign({ className: mobile_module_less_1.default.titleView }, { children: [(0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ className: mobile_module_less_1.default.title }, { children: ele.title })), ele.state && ((0, jsx_runtime_1.jsxs)("div", tslib_1.__assign({ className: mobile_module_less_1.default.stateView }, { children: [(0, jsx_runtime_1.jsx)("div", { className: (0, classnames_1.default)(mobile_module_less_1.default.badge, mobile_module_less_1.default[ele.state.color]) }), (0, jsx_runtime_1.jsx)("div", { children: ele.state.value })] })))] }))), (0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ className: mobile_module_less_1.default.cardContent }, { children: ele.rows && ele.rows.map(function (row) { return ((0, jsx_runtime_1.jsxs)("div", tslib_1.__assign({ className: mobile_module_less_1.default.textView }, { children: [(0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ className: mobile_module_less_1.default.label }, { children: row.label })), (0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ className: mobile_module_less_1.default.value }, { children: row.value }))] }))); }) })), !disabledOp && ((0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ style: { display: 'flex', alignItems: 'center', padding: 10 } }, { children: (0, jsx_runtime_1.jsx)(actionBtn_1.default, { entity: entity, extraActions: extraActions, actions: (_a = ele.record) === null || _a === void 0 ? void 0 : _a['#oakLegalActions'], cascadeActions: (_b = ele.record) === null || _b === void 0 ? void 0 : _b['#oakLegalCascadeActions'], onAction: function (action, cascadeAction) { return onAction && onAction(ele.record, action, cascadeAction); } }) })))] })));
            }) })) })));
}
exports.default = Render;
