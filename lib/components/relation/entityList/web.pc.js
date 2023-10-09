"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const antd_1 = require("antd");
const echarts_for_react_1 = tslib_1.__importDefault(require("echarts-for-react"));
const react_1 = require("react");
const lodash_1 = require("oak-domain/lib/utils/lodash");
const web_pc_module_less_1 = tslib_1.__importDefault(require("./web.pc.module.less"));
function render(props) {
    const { data, links } = props.data;
    const { onEntityClicked } = props.methods;
    const [search, setSearch] = (0, react_1.useState)('');
    const [strict, setStrict] = (0, react_1.useState)(false);
    const keywords = search && search.split(',');
    let data2 = data;
    let links2 = links;
    if (keywords) {
        if (!strict) {
            links2 = links.filter(ele => {
                if (keywords.find(k => ele.source.includes(k) || ele.target.includes(k))) {
                    return true;
                }
                return false;
            });
            data2 = (0, lodash_1.uniq)(links2.map(ele => ele.source).concat(links2.map(ele => ele.target))).map(ele => ({ name: ele }));
        }
        else {
            links2 = links.filter(ele => {
                if (keywords.find(k => ele.source.includes(k) && ele.target.includes(k))) {
                    return true;
                }
                return false;
            });
            data2 = data.filter(ele => {
                if (keywords.find(k => ele.name.includes(k))) {
                    return true;
                }
                return false;
            });
        }
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: web_pc_module_less_1.default.container, children: [(0, jsx_runtime_1.jsxs)(antd_1.Form, { style: {
                    margin: 20,
                }, children: [(0, jsx_runtime_1.jsx)(antd_1.Form.Item, { label: "filter", children: (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsx)(antd_1.Input, { onChange: ({ currentTarget }) => setSearch(currentTarget.value), allowClear: true }) }) }), (0, jsx_runtime_1.jsx)(antd_1.Form.Item, { label: "strict mode", children: (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsx)(antd_1.Switch, { checked: strict, onChange: (checked) => setStrict(checked) }) }) })] }), (0, jsx_runtime_1.jsx)(echarts_for_react_1.default, { style: { width: '100%', height: '100%', minHeight: 750 }, option: {
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
                    click: (info) => {
                        const { data, dataType } = info;
                        if (dataType === 'node') {
                            const { name } = data;
                            onEntityClicked(name);
                        }
                    },
                } })] }));
}
exports.default = render;
