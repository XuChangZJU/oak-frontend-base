"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_1 = require("antd");
var echarts_for_react_1 = tslib_1.__importDefault(require("echarts-for-react"));
var react_1 = require("react");
var lodash_1 = require("oak-domain/lib/utils/lodash");
function render(props) {
    var _a = props.data, data = _a.data, links = _a.links;
    var onEntityClicked = props.methods.onEntityClicked;
    var _b = tslib_1.__read((0, react_1.useState)(''), 2), search = _b[0], setSearch = _b[1];
    var _c = tslib_1.__read((0, react_1.useState)(false), 2), strict = _c[0], setStrict = _c[1];
    var keywords = search && search.split(',');
    var data2 = data;
    var links2 = links;
    if (keywords) {
        if (!strict) {
            links2 = links.filter(function (ele) {
                if (keywords.find(function (k) { return ele.source.includes(k) || ele.target.includes(k); })) {
                    return true;
                }
                return false;
            });
            data2 = (0, lodash_1.uniq)(links2.map(function (ele) { return ele.source; }).concat(links2.map(function (ele) { return ele.target; }))).map(function (ele) { return ({ name: ele }); });
        }
        else {
            links2 = links.filter(function (ele) {
                if (keywords.find(function (k) { return ele.source.includes(k) && ele.target.includes(k); })) {
                    return true;
                }
                return false;
            });
            data2 = data.filter(function (ele) {
                if (keywords.find(function (k) { return ele.name.includes(k); })) {
                    return true;
                }
                return false;
            });
        }
    }
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)(antd_1.Form, tslib_1.__assign({ style: {
                    margin: 20,
                } }, { children: [(0, jsx_runtime_1.jsx)(antd_1.Form.Item, tslib_1.__assign({ label: "filter" }, { children: (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsx)(antd_1.Input, { onChange: function (_a) {
                                    var currentTarget = _a.currentTarget;
                                    return setSearch(currentTarget.value);
                                }, allowClear: true }) }) })), (0, jsx_runtime_1.jsx)(antd_1.Form.Item, tslib_1.__assign({ label: "strict mode" }, { children: (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsx)(antd_1.Switch, { checked: strict, onChange: function (checked) { return setStrict(checked); } }) }) }))] })), (0, jsx_runtime_1.jsx)(echarts_for_react_1.default, { style: { width: '100%', height: '100%' }, option: {
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
                            data: data2,
                            links: links2,
                            lineStyle: {
                                opacity: 0.9,
                                width: 2,
                                curveness: 0
                            },
                            label: {
                                show: true
                            },
                            autoCurveness: true,
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
                }, notMerge: true, lazyUpdate: false, onEvents: {
                    click: function (info) {
                        var data = info.data, dataType = info.dataType;
                        if (dataType === 'node') {
                            var name_1 = data.name;
                            onEntityClicked(name_1);
                        }
                    },
                } })] }));
}
exports.default = render;
