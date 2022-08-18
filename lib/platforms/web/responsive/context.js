"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponsiveContext = exports.defaultBreakpoints = exports.values = exports.keys = void 0;
var tslib_1 = require("tslib");
var React = tslib_1.__importStar(require("react"));
exports.keys = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
exports.values = {
    xs: 576,
    sm: 768,
    md: 992,
    lg: 1200,
    xl: 1400,
    xxl: 1880,
};
exports.defaultBreakpoints = {
    keys: exports.keys,
    values: exports.values,
};
exports.ResponsiveContext = React.createContext({
    breakpoints: exports.defaultBreakpoints,
});
