"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = tslib_1.__importDefault(require("react"));
var react_router_dom_1 = require("react-router-dom");
var react_i18next_1 = require("react-i18next");
var responsive_1 = require("./../responsive");
var url_1 = tslib_1.__importDefault(require("url"));
var console_1 = require("console");
function getParams(location, properties) {
    var search = location.search, state = location.state;
    var query = getQuery(search, properties);
    return Object.assign({}, query, state);
}
function getQuery(url, properties) {
    var _a, _b, _c, _d, _e, _f, _g;
    var query = {};
    if (!url) {
        return query;
    }
    var parseUrl = url_1.default.parse(url, true);
    if (parseUrl.query) {
        query = parseUrl.query;
    }
    var query2 = {};
    for (var k in query) {
        if (properties && properties[k]) {
            switch (typeof properties[k]) {
                case 'number': {
                    Object.assign(query2, (_a = {},
                        _a[k] = Number(query[k]),
                        _a));
                    break;
                }
                case 'boolean': {
                    Object.assign(query2, (_b = {},
                        _b[k] = Boolean(query[k]),
                        _b));
                    break;
                }
                case 'object': {
                    Object.assign(query2, (_c = {},
                        _c[k] = JSON.parse(query[k]),
                        _c));
                    break;
                }
                default: {
                    (0, console_1.assert)(typeof properties[k] === 'string', '传参只能是number/boolean/object/string四种类型');
                    Object.assign(query2, (_d = {},
                        _d[k] = query[k],
                        _d));
                }
            }
        }
        else {
            switch (k) {
                case 'oakDisablePulldownRefresh': {
                    Object.assign(query2, (_e = {},
                        _e[k] = Boolean(query[k]),
                        _e));
                    break;
                }
                case 'oakProjection':
                case 'oakSorters':
                case 'oakFilters': {
                    Object.assign(query2, (_f = {},
                        _f[k] = JSON.parse(query[k]),
                        _f));
                    break;
                    break;
                }
                default: {
                    Object.assign(query2, (_g = {},
                        _g[k] = query[k],
                        _g));
                }
            }
        }
    }
    return query2;
}
var withRouter = function (Component, _a) {
    var path = _a.path, properties = _a.properties;
    var ComponentWithRouterProp = function (props) {
        var location = (0, react_router_dom_1.useLocation)();
        var routerParams = (0, react_router_dom_1.useParams)(); // 取路由 xx/:abbr 通过这个函数取到
        var width = (0, responsive_1.useWidth)();
        var _a = (0, react_i18next_1.useTranslation)(), t = _a.t, i18n = _a.i18n;
        var forwardedRef = props.forwardedRef, rest = tslib_1.__rest(props, ["forwardedRef"]);
        var params = {};
        var routeMatch = false;
        if (path && (props.customRouter || location.pathname.toLowerCase().includes(path.toLowerCase()))) {
            params = Object.assign(params, getParams(location, properties), routerParams);
            routeMatch = true;
        }
        return ((0, jsx_runtime_1.jsx)(Component, tslib_1.__assign({}, rest, params, { t: t, i18n: i18n, width: width, location: location, ref: forwardedRef, routeMatch: routeMatch })));
    };
    return react_1.default.forwardRef(function (props, ref) { return (0, jsx_runtime_1.jsx)(ComponentWithRouterProp, tslib_1.__assign({}, props, { forwardedRef: ref })); });
};
exports.default = withRouter;
