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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("react/jsx-runtime");
//react
var React = __importStar(require("react"));
var react_router_dom_1 = require("react-router-dom");
var react_i18next_1 = require("react-i18next");
var responsive_1 = require("./responsive");
var url_1 = __importDefault(require("url"));
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
var withRouter = function (Component) {
    var ComponentWithRouterProp = function (props) {
        var navigate = (0, react_router_dom_1.useNavigate)();
        var location = (0, react_router_dom_1.useLocation)();
        var _a = (0, react_i18next_1.useTranslation)(), t = _a.t, i18n = _a.i18n;
        var width = (0, responsive_1.useWidth)();
        var params = getParams(location);
        var forwardedRef = props.forwardedRef, rest = __rest(props, ["forwardedRef"]);
        return ((0, jsx_runtime_1.jsx)(Component, __assign({ ref: forwardedRef }, rest, params, { navigate: navigate, location: location, t: t, i18n: i18n, width: width })));
    };
    return React.forwardRef(function (props, ref) {
        return (0, jsx_runtime_1.jsx)(ComponentWithRouterProp, __assign({}, props, { forwardedRef: ref }));
    });
};
exports.default = withRouter;
