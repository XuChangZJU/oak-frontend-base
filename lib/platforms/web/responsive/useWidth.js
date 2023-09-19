"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useWidth = void 0;
const react_1 = require("react");
const react_responsive_1 = require("react-responsive");
const context_1 = require("./context");
function useWidth(props) {
    const { breakpoints: breakpointsFromContext } = (0, react_1.useContext)(context_1.ResponsiveContext) || {};
    const { breakpoints: breakpointsFromProps } = props || {};
    const breakpoints = Object.assign(context_1.defaultBreakpoints, breakpointsFromProps, breakpointsFromContext);
    const responsiveValues = breakpoints.values;
    const smWidth = responsiveValues['sm'];
    const mdWidth = responsiveValues['md'];
    const lgWidth = responsiveValues['lg'];
    const xlWidth = responsiveValues['xl'];
    const xxlWidth = responsiveValues['xxl'];
    const xxlWidthResult = (0, react_responsive_1.useMediaQuery)({
        minWidth: xxlWidth,
    });
    const xlWidthResult = (0, react_responsive_1.useMediaQuery)({
        minWidth: xlWidth,
    });
    const lgWidthResult = (0, react_responsive_1.useMediaQuery)({
        minWidth: lgWidth,
    });
    const mdWidthResult = (0, react_responsive_1.useMediaQuery)({
        minWidth: mdWidth,
    });
    const smWidthResult = (0, react_responsive_1.useMediaQuery)({
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
