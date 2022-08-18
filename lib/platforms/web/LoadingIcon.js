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
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("react/jsx-runtime");
require("./index.css");
var values = '2; 2; 2; 2';
var animateValues = '0; 4; 0; 0';
function LoadingIcon(props) {
    var animate = props.animate;
    return ((0, jsx_runtime_1.jsxs)("svg", __assign({ className: "oak-pull-to-refresh-loading", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 32 32" }, { children: [(0, jsx_runtime_1.jsx)("circle", __assign({ transform: "translate(8 0)", cx: "0", cy: "16", r: "0" }, { children: (0, jsx_runtime_1.jsx)("animate", { attributeName: "r", values: !animate ? values : animateValues, dur: "1.2s", repeatCount: "indefinite", begin: "0", keyTimes: "0;0.2;0.7;1", keySplines: "0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.6 0.4 0.8", calcMode: "spline" }) })), (0, jsx_runtime_1.jsx)("circle", __assign({ transform: "translate(16 0)", cx: "0", cy: "16", r: "0" }, { children: (0, jsx_runtime_1.jsx)("animate", { attributeName: "r", values: !animate ? values : animateValues, dur: "1.2s", repeatCount: "indefinite", begin: "0.3", keyTimes: "0;0.2;0.7;1", keySplines: "0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.6 0.4 0.8", calcMode: "spline" }) })), (0, jsx_runtime_1.jsx)("circle", __assign({ transform: "translate(24 0)", cx: "0", cy: "16", r: "0" }, { children: (0, jsx_runtime_1.jsx)("animate", { attributeName: "r", values: !animate ? values : animateValues, dur: "1.2s", repeatCount: "indefinite", begin: "0.6", keyTimes: "0;0.2;0.7;1", keySplines: "0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.6 0.4 0.8", calcMode: "spline" }) }))] })));
}
exports.default = LoadingIcon;
