import React from 'react';

import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWidth } from './../responsive';

import URL from 'url';

type Location = { state: Record<string, any>; search: string };

function getParams(location: Location, properties?: Record<string, FunctionConstructor | WechatMiniprogram.Component.AllProperty>) {
    const { search, state } = location;
    const query = getQuery(search, properties);

    return Object.assign({}, query, state);
}

function getQuery(url: string, properties?: Record<string, FunctionConstructor | WechatMiniprogram.Component.AllProperty>) {
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
            const type = typeof properties[k] === 'function' ? properties[k] : (properties[k] as any).type;
            switch (type) {
                case Number: {
                    Object.assign(query2, {
                        [k]: Number(query[k]),
                    });
                    break;
                }
                case Boolean: {
                    Object.assign(query2, {
                        [k]: Boolean(query[k]),
                    });
                    break;
                }
                case Array:
                case Object: {
                    Object.assign(query2, {
                        [k]: JSON.parse(query[k]),
                    });
                    break;
                }
                default: {
                    Object.assign(query2, {
                        [k]: query[k],
                    })
                }
            }
        }
        else {
            switch (k) {
                case 'oakIsPicker':
                case 'oakDisablePulldownRefresh': {
                    Object.assign(query2, {
                        [k]: Boolean(query[k]),
                    });
                    break;
                }
                case 'oakFilters':
                case 'oakSorters': {
                    Object.assign(query2, {
                        [k]: JSON.parse(query[k]),
                    });
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

const withRouter = (Component: React.ComponentType<any>, { path, properties }: {path?: string, properties?: Record<string, FunctionConstructor | WechatMiniprogram.Component.AllProperty> }) => {
    const ComponentWithRouterProp = (props: any) => {
        const navigate = useNavigate();
        const location = useLocation();
        const width = useWidth();
        const { t, i18n } = useTranslation();
        const { forwardedRef, ...rest } = props;

        let params = {};
        let routeMatch = false;
        if (path && location.pathname.toLowerCase().includes(path.toLowerCase())) {
            params = getParams(location as Location, properties);
            routeMatch = true;
        }

        return (
            <Component
                {...rest}
                {...params}
                t={t}
                i18n={i18n}
                width={width}
                navigate={navigate}
                location={location}
                ref={forwardedRef}
                routeMatch={routeMatch}
            />
        );
    };
    return React.forwardRef((props, ref) => <ComponentWithRouterProp {...props} forwardedRef={ref} />);
};

export default withRouter;
