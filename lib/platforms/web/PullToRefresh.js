"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var rmc_pull_to_refresh_1 = tslib_1.__importDefault(require("rmc-pull-to-refresh"));
require("rmc-pull-to-refresh/assets/index.css");
var OakPullToRefresh = function (props) {
    return ((0, jsx_runtime_1.jsx)(rmc_pull_to_refresh_1.default, tslib_1.__assign({}, props, { getScrollContainer: function () { return document.body; } })));
};
exports.default = OakPullToRefresh;
