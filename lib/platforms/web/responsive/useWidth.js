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
    let width = 'xs';
    const obj = breakpoints.values;
    const obj2 = {};
    Object.keys(obj)
        .sort((ele1, ele2) => obj[ele1] - obj[ele2])
        .forEach((key, index) => {
        const value = obj[key];
        const nextKey = Object.keys(obj)[index + 1];
        let result;
        if (index === 0) {
            if (value === 0) {
                result = (0, react_responsive_1.useMediaQuery)({
                    minWidth: obj[key],
                    maxWidth: obj[nextKey] - 0.2,
                });
            }
            else {
                result = (0, react_responsive_1.useMediaQuery)({
                    maxWidth: obj[key] - 0.2,
                });
            }
        }
        else if (index === Object.keys(obj).length - 1) {
            result = (0, react_responsive_1.useMediaQuery)({
                minWidth: obj[key],
            });
        }
        else {
            result = (0, react_responsive_1.useMediaQuery)({
                minWidth: obj[key],
                maxWidth: obj[nextKey] - 0.2,
            });
        }
        Object.assign(obj2, {
            [key]: result,
        });
    });
    for (let w in obj2) {
        if (obj2[w]) {
            width = w;
            break;
        }
    }
    return width;
}
exports.useWidth = useWidth;
