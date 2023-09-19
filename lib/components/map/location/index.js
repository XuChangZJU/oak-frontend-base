"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = tslib_1.__importStar(require("react"));
const antd_1 = require("antd");
const icons_1 = require("@ant-design/icons");
const map_1 = tslib_1.__importDefault(require("../map"));
const web_module_less_1 = tslib_1.__importDefault(require("./web.module.less"));
function Location(props) {
    const [mode, setMode] = (0, react_1.useState)('dragMap');
    const [searchValue, setSearchValue] = (0, react_1.useState)('');
    const [searchLoading, setSearchLoading] = (0, react_1.useState)(false);
    const [pois, setPois] = (0, react_1.useState)();
    const [currentPoi, setCurrentPoi] = (0, react_1.useState)();
    const searchRef = (0, react_1.useRef)();
    // 这里不能用useFeatures，因为无法引用lib里面的provider，引用src注入是不行的
    const featureGeo = global.features.geo;
    (0, react_1.useEffect)(() => {
        if (searchValue?.length > 1) {
            setSearchLoading(true);
            featureGeo.searchPoi(searchValue).then(({ result }) => {
                setSearchLoading(false);
                setPois(result);
                // setCurrentPoi(pois[0]);
            }, (error) => {
                console.warn(error);
                setPois(undefined);
                setSearchLoading(false);
            });
        }
        else {
            setPois(undefined);
        }
    }, [searchValue]);
    const center = currentPoi?.coordinate || props.coordinate;
    const Locate = ((0, jsx_runtime_1.jsx)(antd_1.List, { className: web_module_less_1.default["location-list"], header: (0, jsx_runtime_1.jsx)(antd_1.Input, { ref: searchRef, placeholder: "\u8BF7\u8F93\u5165\u5B8C\u6574\u540D\u79F0\uFF08\u5982\u201C\u6D59\u6C5F\u5927\u5B66\u201D\uFF09\u800C\u975E\u7B80\u79F0\uFF08\u5982\u201C\u6D59\u5927\u201D\uFF09", value: searchValue, allowClear: true, onChange: (e) => {
                setSearchValue(e.target.value);
            }, prefix: (0, jsx_runtime_1.jsx)(icons_1.SearchOutlined, {}), onFocus: () => {
                setMode('searchPoi');
            }, onBlur: () => {
            } }), children: mode === 'searchPoi' && ((0, jsx_runtime_1.jsx)(react_1.default.Fragment, { children: searchLoading ? ((0, jsx_runtime_1.jsx)("div", { className: web_module_less_1.default['location-list-meta'], children: (0, jsx_runtime_1.jsx)(antd_1.Spin, { delay: 0, spinning: true, size: "default" }) })) : (pois?.length
                ? pois.map((poi, index) => {
                    return ((0, jsx_runtime_1.jsx)("div", { onClick: () => {
                            setCurrentPoi(poi);
                            props.onLocated({
                                poiName: poi.detail,
                                coordinate: poi.coordinate,
                                areaId: poi.areaId,
                            });
                        }, children: (0, jsx_runtime_1.jsx)(antd_1.List.Item, { actions: [
                                (0, jsx_runtime_1.jsx)("div", { style: {
                                        width: 24,
                                    }, children: currentPoi?.id ===
                                        poi.id && ((0, jsx_runtime_1.jsx)(icons_1.CheckCircleFilled, { className: web_module_less_1.default['location-list-checked'] })) }),
                            ], children: (0, jsx_runtime_1.jsx)(antd_1.List.Item.Meta, { title: poi.detail }) }) }, poi.id));
                })
                : ((0, jsx_runtime_1.jsx)("div", { className: web_module_less_1.default['location-list-meta'], children: (0, jsx_runtime_1.jsx)(antd_1.Empty, { description: `没有${searchValue}相关的地名搜索结果`, image: antd_1.Empty.PRESENTED_IMAGE_SIMPLE }) }))) })) }));
    if (window.innerWidth > 480) {
        return ((0, jsx_runtime_1.jsxs)(antd_1.Row, { gutter: [16, 16], style: {
                width: '100%',
                minHeight: 600,
            }, children: [(0, jsx_runtime_1.jsx)(antd_1.Col, { xs: 24, sm: 14, children: (0, jsx_runtime_1.jsx)(map_1.default, { style: { height: '100%' }, id: "location-map", center: center, markers: center ? [center] : undefined }) }), (0, jsx_runtime_1.jsx)(antd_1.Col, { xs: 24, sm: 10, children: Locate })] }));
    }
    return ((0, jsx_runtime_1.jsxs)(antd_1.Col, { style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
        }, children: [(0, jsx_runtime_1.jsx)(antd_1.Row, { children: (0, jsx_runtime_1.jsx)(map_1.default, { style: { height: 400, width: '100%' }, id: "location-map", center: center, markers: center ? [center] : undefined }) }), (0, jsx_runtime_1.jsx)(antd_1.Row, { style: { flex: 1, marginLeft: 5, marginRight: 5 }, children: Locate })] }));
}
exports.default = Location;
