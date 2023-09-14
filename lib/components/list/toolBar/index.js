"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_1 = require("antd");
var icons_1 = require("@ant-design/icons");
var buttonGroup_1 = tslib_1.__importDefault(require("../buttonGroup"));
var columnSetting_1 = tslib_1.__importDefault(require("../columnSetting"));
var web_1 = require("../../../platforms/web");
var index_module_less_1 = tslib_1.__importDefault(require("./index.module.less"));
function ToolBar(props) {
    var title = props.title, buttonGroup = props.buttonGroup, reload = props.reload;
    var features = (0, web_1.useFeatures)();
    return ((0, jsx_runtime_1.jsxs)("div", { className: index_module_less_1.default.toolbarContainer, children: [(0, jsx_runtime_1.jsx)("div", { className: index_module_less_1.default.title, children: title }), (0, jsx_runtime_1.jsx)("div", { className: index_module_less_1.default.toolbarRight, children: (0, jsx_runtime_1.jsxs)(antd_1.Space, { children: [buttonGroup && buttonGroup.length > 0 && ((0, jsx_runtime_1.jsx)(buttonGroup_1.default, { items: buttonGroup })), (0, jsx_runtime_1.jsx)(antd_1.Tooltip, { title: features.locales.t('reload'), children: (0, jsx_runtime_1.jsx)("div", { className: index_module_less_1.default.reloadIconBox, onClick: function () {
                                    reload();
                                }, children: (0, jsx_runtime_1.jsx)(icons_1.ReloadOutlined, {}) }) }), (0, jsx_runtime_1.jsx)(columnSetting_1.default, {})] }) })] }));
}
exports.default = ToolBar;
