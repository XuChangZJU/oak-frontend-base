"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponsiveProvider = void 0;
const react_1 = require("react");
const context_1 = require("./context");
function ResponsiveProvider(props) {
    const { breakpoints, children } = props;
    const value = (0, react_1.useMemo)(() => ({
        breakpoints,
    }), [breakpoints]);
    return (0, react_1.createElement)(context_1.ResponsiveContext.Provider, {
        value,
    }, children);
}
exports.ResponsiveProvider = ResponsiveProvider;
