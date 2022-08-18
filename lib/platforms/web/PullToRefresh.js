"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("react/jsx-runtime");
var rmc_pull_to_refresh_1 = __importDefault(require("rmc-pull-to-refresh"));
require("./index.css");
// import LoadingIcon from './LoadingIcon';
var OakPullToRefresh = function (props) {
    return ((0, jsx_runtime_1.jsx)(rmc_pull_to_refresh_1.default, __assign({}, props, { getScrollContainer: function () { return document.body; } })));
};
exports.default = OakPullToRefresh;
