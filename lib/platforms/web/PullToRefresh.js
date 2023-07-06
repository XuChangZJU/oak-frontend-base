"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var rmc_pull_to_refresh_1 = tslib_1.__importDefault(require("rmc-pull-to-refresh"));
require("./PullToRefresh.css");
var OakPullToRefresh = function (props) {
    return (0, jsx_runtime_1.jsx)(rmc_pull_to_refresh_1.default, tslib_1.__assign({}, props, { prefixCls: "oak-pull-to-refresh" }));
};
exports.default = OakPullToRefresh;
