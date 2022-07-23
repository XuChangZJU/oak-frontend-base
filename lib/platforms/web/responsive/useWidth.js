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
    var width = 'xs';
    var obj = breakpoints.values;
    var obj2 = {};
    Object.keys(obj)
        .sort(function (ele1, ele2) { return obj[ele1] - obj[ele2]; })
        .forEach(function (key, index) {
        var _a;
        var value = obj[key];
        var nextKey = Object.keys(obj)[index + 1];
        var result;
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
        Object.assign(obj2, (_a = {},
            _a[key] = result,
            _a));
    });
    for (var w in obj2) {
        if (obj2[w]) {
            width = w;
            break;
        }
    }
    return width;
}
exports.useWidth = useWidth;
