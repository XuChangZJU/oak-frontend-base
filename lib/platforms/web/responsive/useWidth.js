"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useWidth = void 0;
var react_1 = require("react");
var react_responsive_1 = require("react-responsive");
var context_1 = require("./context");
function useWidth(props) {
    var breakpointsFromContext = ((0, react_1.useContext)(context_1.ResponsiveContext) || {}).breakpoints;
    var breakpointsFromProps = (props || {}).breakpoints;
    var breakpoints = Object.assign(context_1.defaultBreakpoints, breakpointsFromProps, breakpointsFromContext);
    var responsiveValues = breakpoints.values;
    var smWidth = responsiveValues['sm'];
    var mdWidth = responsiveValues['md'];
    var lgWidth = responsiveValues['lg'];
    var xlWidth = responsiveValues['xl'];
    var xxlWidth = responsiveValues['xxl'];
    var xxlWidthResult = (0, react_responsive_1.useMediaQuery)({
        minWidth: xxlWidth,
    });
    var xlWidthResult = (0, react_responsive_1.useMediaQuery)({
        minWidth: xlWidth,
    });
    var lgWidthResult = (0, react_responsive_1.useMediaQuery)({
        minWidth: lgWidth,
    });
    var mdWidthResult = (0, react_responsive_1.useMediaQuery)({
        minWidth: mdWidth,
    });
    var smWidthResult = (0, react_responsive_1.useMediaQuery)({
        minWidth: smWidth,
    });
    if (xxlWidthResult) {
        return 'xxl';
    }
    else if (xlWidthResult) {
        return 'xl';
    }
    else if (lgWidthResult) {
        return 'lg';
    }
    else if (mdWidthResult) {
        return 'md';
    }
    else if (smWidthResult) {
        return 'sm';
    }
    return 'xs';
}
exports.useWidth = useWidth;
