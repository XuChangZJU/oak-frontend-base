import React from 'react';
// @ts-ignore
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useWidth } from './../responsive';

import URL from 'url';
import assert from 'assert';

type Location = { state: Record<string, any>; search: string };

function getParams(location: Location, properties?: Record<string, any>) {
    const { search, state } = location;
    const query = getQuery(search, properties);

    return Object.assign({}, query, state);
}

function getQuery(url: string, properties?: Record<string, any>) {
    let query: Record<string, any> = {};
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
                    })
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
                    })
                }
            }
        }
    }
    return query2;
}

const withRouter = (Component: React.ComponentType<any>, { path, properties }: { path?: string, properties?: Record<string, any> }) => {
    const ComponentWithRouterProp = (props: any) => {
        const location = useLocation();
        const routerParams = useParams(); // 取路由 xx/:abbr 通过这个函数取到
        const width = useWidth();
        const { forwardedRef, ...rest } = props;

        let params = {};
        let routeMatch = false;
        if (path && (props.customRouter || location.pathname.toLowerCase().includes(path.toLowerCase()))) {
            params = Object.assign(
                params,
                getParams(location as Location, properties),
                routerParams
            );
            routeMatch = true;
        }

        return (
            <Component
                {...rest}
                {...params}
                width={width}
                location={location}
                ref={forwardedRef}
                routeMatch={routeMatch}
            />
        );
    };
    return React.forwardRef((props, ref) => <ComponentWithRouterProp {...props} forwardedRef={ref} />);
};

export default withRouter;
