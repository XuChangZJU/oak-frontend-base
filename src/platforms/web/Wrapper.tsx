
//react
import * as React from 'react';
import {
    useNavigate,
    NavigateFunction,
    useSearchParams,
    useLocation,
} from 'react-router-dom';
import URL from 'url';

function getParams(location: { state: object; search: string }) {
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

export default function Wrapper(props: { PageWrapper: any }) {
    const { PageWrapper } = props;
    // const navigate = useNavigate();
    // const location = useLocation();
    // const params = getParams(location);
    const navigate = {};
    const location = {};
    const params = {}

    return <PageWrapper navigate={navigate} location={location} {...params} />;
}
