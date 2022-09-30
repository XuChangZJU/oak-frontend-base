import React from 'react';

import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWidth } from './../responsive';

import URL from 'url';

type Location = { state: Record<string, any>; search: string };

function getParams(location: Location) {
    const { search, state } = location;
    const query = getQuery(search);

    return Object.assign({}, query, state);
}

function getQuery(url: string) {
    let query = {};
    if (!url) {
        return query;
    }
    const parseUrl = URL.parse(url, true);
    if (parseUrl.query) {
        query = parseUrl.query;
    }
    return query;
}

const withRouter = (Component: React.ComponentType<any>, isComponent?: boolean, path?: string) => {
    const ComponentWithRouterProp = (props: any) => {
        const navigate = useNavigate();
        const location = useLocation();
        const width = useWidth();
        const { t, i18n } = useTranslation();
        const { forwardedRef, ...rest } = props;

        let params = {};
        if (!isComponent && location.pathname.includes(path)) {
            params = getParams(location as Location);
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
            />
        );
    };
    return React.forwardRef((props, ref) => <ComponentWithRouterProp {...props} forwardedRef={ref} />);
};

export default withRouter;
