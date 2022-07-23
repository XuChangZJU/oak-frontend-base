"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponsiveProvider = void 0;
var react_1 = require("react");
var context_1 = require("./context");
function ResponsiveProvider(props) {
    var breakpoints = props.breakpoints, children = props.children;
    var value = (0, react_1.useMemo)(function () { return ({
        breakpoints: breakpoints,
    }); }, [breakpoints]);
    return (0, react_1.createElement)(context_1.ResponsiveContext.Provider, {
        value: value,
    }, children);
}
exports.ResponsiveProvider = ResponsiveProvider;
