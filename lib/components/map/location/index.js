"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_1 = require("antd");
var map_1 = tslib_1.__importDefault(require("../map"));
function Location(props) {
    if (window.innerWidth < 500) {
        // 窄屏
    }
    return ((0, jsx_runtime_1.jsx)(antd_1.Row, tslib_1.__assign({ gutter: [16, 16] }, { children: (0, jsx_runtime_1.jsx)(antd_1.Col, tslib_1.__assign({ xs: 24, sm: 14 }, { children: (0, jsx_runtime_1.jsx)(map_1.default, { center: props.coordinate, undragable: true, unzoomable: true }) })) })));
}
exports.default = Location;
