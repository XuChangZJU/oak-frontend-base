import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
// @ts-ignore
import { useLocation, useParams } from 'react-router-dom';
import { useWidth } from './../responsive';
import URL from 'url';
import { assert } from 'oak-domain/lib/utils/assert';
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
    const parseUrl = URL.parse(url, true);
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
                    assert(typeof properties[k] === 'string', '传参只能是number/boolean/object/string四种类型');
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
        const location = useLocation();
        const routerParams = useParams(); // 取路由 xx/:abbr 通过这个函数取到
        const width = useWidth();
        const { forwardedRef, ...rest } = props;
        let params = {};
        let routeMatch = false;
        if (path && (props.customRouter || location.pathname.toLowerCase().includes(path.toLowerCase()))) {
            params = Object.assign(params, getParams(location, properties), routerParams);
            routeMatch = true;
        }
        return (_jsx(Component, { ...rest, ...params, width: width, location: location, ref: forwardedRef, routeMatch: routeMatch }));
    };
    return React.forwardRef((props, ref) => _jsx(ComponentWithRouterProp, { ...props, forwardedRef: ref }));
};
export default withRouter;
