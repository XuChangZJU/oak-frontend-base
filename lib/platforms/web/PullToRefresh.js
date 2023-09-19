"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const rmc_pull_to_refresh_1 = tslib_1.__importDefault(require("rmc-pull-to-refresh"));
require("./PullToRefresh.css");
const OakPullToRefresh = (props) => {
    return (0, jsx_runtime_1.jsx)(rmc_pull_to_refresh_1.default, { ...props, prefixCls: "oak-pull-to-refresh" });
};
exports.default = OakPullToRefresh;
