"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_1 = require("antd");
var react_1 = require("react");
var index_module_less_1 = tslib_1.__importDefault(require("./index.module.less"));
var react_i18next_1 = require("react-i18next");
var icons_1 = require("@ant-design/icons");
var buttonGroup_1 = tslib_1.__importDefault(require("../buttonGroup"));
var columnSetting_1 = tslib_1.__importDefault(require("../columnSetting"));
var listPro_1 = require("../../listPro");
function ToolBar(props) {
    var title = props.title, buttonGroup = props.buttonGroup, reload = props.reload;
    var t = (0, react_i18next_1.useTranslation)().t;
    var _a = (0, react_1.useContext)(listPro_1.TableContext), tableAttributes = _a.tableAttributes, setTableAttributes = _a.setTableAttributes;
    return ((0, jsx_runtime_1.jsxs)("div", tslib_1.__assign({ className: index_module_less_1.default.toolbarContainer }, { children: [(0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ className: index_module_less_1.default.title }, { children: title })), (0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ className: index_module_less_1.default.toolbarRight }, { children: (0, jsx_runtime_1.jsxs)(antd_1.Space, { children: [buttonGroup && buttonGroup.length && ((0, jsx_runtime_1.jsx)(buttonGroup_1.default, { items: buttonGroup })), (0, jsx_runtime_1.jsx)(antd_1.Tooltip, tslib_1.__assign({ title: t('reload') }, { children: (0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ className: index_module_less_1.default.reloadIconBox, onClick: function () {
                                    reload();
                                } }, { children: (0, jsx_runtime_1.jsx)(icons_1.ReloadOutlined, {}) })) })), (0, jsx_runtime_1.jsx)(columnSetting_1.default, {})] }) }))] })));
}
exports.default = ToolBar;
