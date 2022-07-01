
//react
import * as React from 'react';

import {
    useNavigate,
    useSearchParams,
    useLocation,
} from 'react-router-dom';
import URL from 'url';

type Location = { state: object; search: string }

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

export function withRouter(PageWrapper: React.ComponentType<any>) {
    function ComponentWithRouter(props: any) {
        const navigate = useNavigate();
        const location = useLocation();
        const params = getParams(location as Location);
        return (
            <PageWrapper
                {...props}
                navigate={navigate}
                location={location}
                {...params}
            />
        );
    };

    return ComponentWithRouter;
}
