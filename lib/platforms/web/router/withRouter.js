"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = tslib_1.__importDefault(require("react"));
var react_router_dom_1 = require("react-router-dom");
var react_i18next_1 = require("react-i18next");
var responsive_1 = require("./../responsive");
var url_1 = tslib_1.__importDefault(require("url"));
function getParams(location) {
    var search = location.search, state = location.state;
    var query = getQuery(search);
    return Object.assign({}, query, state);
}
function getQuery(url) {
    var query = {};
    if (!url) {
        return query;
    }
    var parseUrl = url_1.default.parse(url, true);
    if (parseUrl.query) {
        query = parseUrl.query;
    }
    return query;
}
var withRouter = function (Component, isComponent) {
    var ComponentWithRouterProp = function (props) {
        var navigate = (0, react_router_dom_1.useNavigate)();
        var _a = (0, react_i18next_1.useTranslation)(), t = _a.t, i18n = _a.i18n;
        var width = (0, responsive_1.useWidth)();
        var forwardedRef = props.forwardedRef, rest = tslib_1.__rest(props, ["forwardedRef"]);
        if (isComponent) {
            return ((0, jsx_runtime_1.jsx)(Component, tslib_1.__assign({}, rest, { t: t, i18n: i18n, width: width, navigate: navigate, ref: forwardedRef })));
        }
        var location = (0, react_router_dom_1.useLocation)();
        var params = getParams(location);
        return ((0, jsx_runtime_1.jsx)(Component, tslib_1.__assign({}, rest, params, { t: t, i18n: i18n, width: width, navigate: navigate, location: location, ref: forwardedRef })));
    };
    return react_1.default.forwardRef(function (props, ref) { return (0, jsx_runtime_1.jsx)(ComponentWithRouterProp, tslib_1.__assign({}, props, { forwardedRef: ref })); });
};
exports.default = withRouter;
