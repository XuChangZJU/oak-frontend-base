import React from 'react';
import { assert } from 'oak-domain/lib/utils/assert';
function getParams(params, properties) {
    const props = getProps(params, properties);
    return Object.assign({}, props);
}
function getProps(params, properties) {
    let query = params;
    if (!params || Object.keys(params).length === 0) {
        return;
    }
    const props = {};
    for (const k in query) {
        if (properties && properties.hasOwnProperty(k)) {
            switch (typeof properties[k]) {
                case 'number': {
                    Object.assign(props, {
                        [k]: Number(query[k]),
                    });
                    break;
                }
                case 'boolean': {
                    Object.assign(props, {
                        [k]: Boolean(query[k]),
                    });
                    break;
                }
                case 'object': {
                    Object.assign(props, {
                        [k]: JSON.parse(query[k]),
                    });
                    break;
                }
                default: {
                    assert(typeof properties[k] === 'string', '传参只能是number/boolean/object/string四种类型');
                    Object.assign(props, {
                        [k]: query[k],
                    });
                }
            }
        }
        else {
            switch (k) {
                case 'oakDisablePulldownRefresh': {
                    Object.assign(props, {
                        [k]: Boolean(query[k]),
                    });
                    break;
                }
                default: {
                    Object.assign(props, {
                        [k]: query[k],
                    });
                }
            }
        }
    }
    return props;
}
const withRouter = (Component, { path, properties }) => {
    const ComponentWithRouterProp = (props) => {
        const navigation = props.navigation;
        const route = props.route;
        const { params: routeParams } = route || {};
        let params = {};
        if (path) {
            params = Object.assign(params, getParams(routeParams, properties));
        }
        return <Component {...props} {...params} ref={props.ref} width="xs"/>;
    };
    return ComponentWithRouterProp;
};
export default withRouter;
