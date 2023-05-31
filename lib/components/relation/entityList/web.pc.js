"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_1 = require("antd");
var echarts_for_react_1 = tslib_1.__importDefault(require("echarts-for-react"));
var react_1 = require("react");
function render(props) {
    var _a = props.data, data = _a.data, links = _a.links;
    var onEntityClicked = props.methods.onEntityClicked;
    var _b = tslib_1.__read((0, react_1.useState)(''), 2), search = _b[0], setSearch = _b[1];
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(antd_1.Row, { children: (0, jsx_runtime_1.jsx)(antd_1.Col, tslib_1.__assign({ span: 8, style: { padding: 20 } }, { children: (0, jsx_runtime_1.jsx)(antd_1.Input, { onChange: function (_a) {
                            var currentTarget = _a.currentTarget;
                            return setSearch(currentTarget.value);
                        }, allowClear: true }) })) }), (0, jsx_runtime_1.jsx)(antd_1.Row, { children: (0, jsx_runtime_1.jsx)(echarts_for_react_1.default, { style: { width: 2048, height: 1024 }, option: {
                        tooltip: {},
                        series: [
                            {
                                type: 'graph',
                                layout: 'force',
                                force: {
                                    initLayout: 'circular',
                                    gravity: 0,
                                    repulsion: [10, 80],
                                    edgeLength: [10, 50]
                                },
                                data: data,
                                links: links,
                                lineStyle: {
                                    opacity: 0.9,
                                    width: 2,
                                    curveness: 0
                                },
                                label: {
                                    show: true
                                },
                                roam: true,
                                draggable: true,
                                edgeSymbol: ['none', 'arrow'],
                                edgeSymbolSize: 7,
                                emphasis: {
                                    scale: true,
                                    label: {
                                        show: true,
                                    },
                                    focus: 'adjacency',
                                    lineStyle: {
                                        width: 10
                                    }
                                }
                            },
                        ],
                    }, notMerge: true, lazyUpdate: false }) })] }));
}
exports.default = render;
