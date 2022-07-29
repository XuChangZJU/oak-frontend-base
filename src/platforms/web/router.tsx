//react
import * as React from 'react';

import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWidth } from './responsive';

import URL from 'url';

type Location = { state: object; search: string };

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

const withRouter = (Component: React.ComponentType<any>) => {
    const ComponentWithRouterProp = (props: any) => {
        const navigate = useNavigate();
        const location = useLocation();
        const { t, i18n } = useTranslation();
        const width = useWidth();
        const params = getParams(location as Location);
        const { forwardedRef, ...rest } = props;

        return (
            <Component
                ref={forwardedRef}
                {...rest}
                {...params}
                navigate={navigate}
                location={location}
                t={t}
                i18n={i18n}
                width={width}
            />
        );
    };

    return React.forwardRef((props, ref) => {
        return <ComponentWithRouterProp {...props} forwardedRef={ref} />;
    });
};

export default withRouter;
