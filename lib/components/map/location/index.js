"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = tslib_1.__importStar(require("react"));
var antd_1 = require("antd");
var icons_1 = require("@ant-design/icons");
var map_1 = tslib_1.__importDefault(require("../map"));
var web_module_less_1 = tslib_1.__importDefault(require("./web.module.less"));
function Location(props) {
    var _a = tslib_1.__read((0, react_1.useState)('dragMap'), 2), mode = _a[0], setMode = _a[1];
    var _b = tslib_1.__read((0, react_1.useState)(''), 2), searchValue = _b[0], setSearchValue = _b[1];
    var _c = tslib_1.__read((0, react_1.useState)(false), 2), searchLoading = _c[0], setSearchLoading = _c[1];
    var _d = tslib_1.__read((0, react_1.useState)(), 2), pois = _d[0], setPois = _d[1];
    var _e = tslib_1.__read((0, react_1.useState)(), 2), currentPoi = _e[0], setCurrentPoi = _e[1];
    var searchRef = (0, react_1.useRef)();
    // 这里不能用useFeatures，因为无法引用lib里面的provider，引用src注入是不行的
    var featureGeo = global.features.geo;
    (0, react_1.useEffect)(function () {
        if ((searchValue === null || searchValue === void 0 ? void 0 : searchValue.length) > 1) {
            setSearchLoading(true);
            featureGeo.searchPoi(searchValue).then(function (_a) {
                var result = _a.result;
                setSearchLoading(false);
                setPois(result);
                // setCurrentPoi(pois[0]);
            }, function (error) {
                console.warn(error);
                setPois(undefined);
                setSearchLoading(false);
            });
        }
        else {
            setPois(undefined);
        }
    }, [searchValue]);
    var center = (currentPoi === null || currentPoi === void 0 ? void 0 : currentPoi.coordinate) || props.coordinate;
    var Locate = ((0, jsx_runtime_1.jsx)(antd_1.List, tslib_1.__assign({ className: web_module_less_1.default["location-list"], header: (0, jsx_runtime_1.jsx)(antd_1.Input, { ref: searchRef, placeholder: "\u8BF7\u8F93\u5165\u5B8C\u6574\u540D\u79F0\uFF08\u5982\u201C\u6D59\u6C5F\u5927\u5B66\u201D\uFF09\u800C\u975E\u7B80\u79F0\uFF08\u5982\u201C\u6D59\u5927\u201D\uFF09", value: searchValue, allowClear: true, onChange: function (e) {
                setSearchValue(e.target.value);
            }, prefix: (0, jsx_runtime_1.jsx)(icons_1.SearchOutlined, {}), onFocus: function () {
                setMode('searchPoi');
            }, onBlur: function () {
            } }) }, { children: mode === 'searchPoi' && ((0, jsx_runtime_1.jsx)(react_1.default.Fragment, { children: searchLoading ? ((0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ className: web_module_less_1.default['location-list-meta'] }, { children: (0, jsx_runtime_1.jsx)(antd_1.Spin, { delay: 0, spinning: true, size: "default" }) }))) : ((pois === null || pois === void 0 ? void 0 : pois.length)
                ? pois.map(function (poi, index) {
                    return ((0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ onClick: function () {
                            setCurrentPoi(poi);
                            props.onLocated({
                                poiName: poi.detail,
                                coordinate: poi.coordinate,
                                areaId: poi.areaId,
                            });
                        } }, { children: (0, jsx_runtime_1.jsx)(antd_1.List.Item, tslib_1.__assign({ actions: [
                                (0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ style: {
                                        width: 24,
                                    } }, { children: (currentPoi === null || currentPoi === void 0 ? void 0 : currentPoi.id) ===
                                        poi.id && ((0, jsx_runtime_1.jsx)(icons_1.CheckCircleFilled, { className: web_module_less_1.default['location-list-checked'] })) })),
                            ] }, { children: (0, jsx_runtime_1.jsx)(antd_1.List.Item.Meta, { title: poi.detail }) })) }), poi.id));
                })
                : ((0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ className: web_module_less_1.default['location-list-meta'] }, { children: (0, jsx_runtime_1.jsx)(antd_1.Empty, { description: "\u6CA1\u6709".concat(searchValue, "\u76F8\u5173\u7684\u5730\u540D\u641C\u7D22\u7ED3\u679C"), image: antd_1.Empty.PRESENTED_IMAGE_SIMPLE }) })))) })) })));
    if (window.innerWidth > 480) {
        return ((0, jsx_runtime_1.jsxs)(antd_1.Row, tslib_1.__assign({ gutter: [16, 16], style: {
                width: '100%',
                minHeight: 600,
            } }, { children: [(0, jsx_runtime_1.jsx)(antd_1.Col, tslib_1.__assign({ xs: 24, sm: 14 }, { children: (0, jsx_runtime_1.jsx)(map_1.default, { style: { height: '100%' }, id: "location-map", center: center, markers: center ? [center] : undefined }) })), (0, jsx_runtime_1.jsx)(antd_1.Col, tslib_1.__assign({ xs: 24, sm: 10 }, { children: Locate }))] })));
    }
    return ((0, jsx_runtime_1.jsxs)(antd_1.Col, tslib_1.__assign({ style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
        } }, { children: [(0, jsx_runtime_1.jsx)(antd_1.Row, { children: (0, jsx_runtime_1.jsx)(map_1.default, { style: { height: 400, width: '100%' }, id: "location-map", center: center, markers: center ? [center] : undefined }) }), (0, jsx_runtime_1.jsx)(antd_1.Row, tslib_1.__assign({ style: { flex: 1, marginLeft: 5, marginRight: 5 } }, { children: Locate }))] })));
}
exports.default = Location;
