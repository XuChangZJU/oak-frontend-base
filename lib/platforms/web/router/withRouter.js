"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = tslib_1.__importDefault(require("react"));
// @ts-ignore
const react_router_dom_1 = require("react-router-dom");
const responsive_1 = require("./../responsive");
const url_1 = tslib_1.__importDefault(require("url"));
const assert_1 = require("oak-domain/lib/utils/assert");
function getParams(location, properties) {
    const { search, state } = location;
    const query = getQuery(search, properties);
    return Object.assign({}, query, state);
}
function getQuery(url, properties) {
    let query = {};
    if (!url) {
        return query;
    }
    const parseUrl = url_1.default.parse(url, true);
    if (parseUrl.query) {
        query = parseUrl.query;
    }
    const query2 = {};
    for (const k in query) {
        if (properties && properties[k]) {
            switch (typeof properties[k]) {
                case 'number': {
                    Object.assign(query2, {
                        [k]: Number(query[k]),
                    });
                    break;
                }
                case 'boolean': {
                    Object.assign(query2, {
                        [k]: Boolean(query[k]),
                    });
                    break;
                }
                case 'object': {
                    Object.assign(query2, {
                        [k]: JSON.parse(query[k]),
                    });
                    break;
                }
                default: {
                    (0, assert_1.assert)(typeof properties[k] === 'string', '传参只能是number/boolean/object/string四种类型');
                    Object.assign(query2, {
                        [k]: query[k],
                    });
                }
            }
        }
        else {
            switch (k) {
                case 'oakDisablePulldownRefresh': {
                    Object.assign(query2, {
                        [k]: Boolean(query[k]),
                    });
                    break;
                }
                case 'oakProjection':
                case 'oakSorters':
                case 'oakFilters': {
                    Object.assign(query2, {
                        [k]: JSON.parse(query[k]),
                    });
                    break;
                    break;
                }
                default: {
                    Object.assign(query2, {
                        [k]: query[k],
                    });
                }
            }
        }
    }
    return query2;
}
const withRouter = (Component, { path, properties }) => {
    const ComponentWithRouterProp = (props) => {
        const location = (0, react_router_dom_1.useLocation)();
        const routerParams = (0, react_router_dom_1.useParams)(); // 取路由 xx/:abbr 通过这个函数取到
        const width = (0, responsive_1.useWidth)();
        const { forwardedRef, ...rest } = props;
        let params = {};
        let routeMatch = false;
        /**
         * 由path来判定是否为Page。这里有个隐患，未来实现了keepAlive后，可能会影响到之前压栈的Page
         * 待测试。by Xc 20231102
         */
        if (path) {
            params = Object.assign(params, getParams(location, properties), routerParams);
            routeMatch = true;
        }
        return ((0, jsx_runtime_1.jsx)(Component, { ...rest, ...params, width: width, location: location, ref: forwardedRef, routeMatch: routeMatch }));
    };
    return react_1.default.forwardRef((props, ref) => (0, jsx_runtime_1.jsx)(ComponentWithRouterProp, { ...props, forwardedRef: ref }));
};
exports.default = withRouter;
