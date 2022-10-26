"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponsiveContext = exports.defaultBreakpoints = exports.values = exports.keys = void 0;
var tslib_1 = require("tslib");
var react_1 = tslib_1.__importDefault(require("react"));
exports.keys = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
exports.values = {
    xs: 576,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1600,
};
exports.defaultBreakpoints = {
    keys: exports.keys,
    values: exports.values,
};
exports.ResponsiveContext = react_1.default.createContext({
    breakpoints: exports.defaultBreakpoints,
});
