import React from 'react';
// @ts-ignore
import { useLocation, useParams } from 'react-router-dom';
import { useWidth } from './../responsive';
import { assert } from 'oak-domain/lib/utils/assert';
function getParams(location, properties) {
    const { search, state } = location;
    const props = getProps(search, properties);
    return Object.assign({}, props, state);
}
function getProps(search, properties) {
    if (!search) {
        return;
    }
    const searchParams = new URLSearchParams(search || '');
    const props = {};
    for (const k of searchParams.keys()) {
        if (properties && properties[k]) {
            switch (typeof properties[k]) {
                case 'number': {
                    Object.assign(props, {
                        [k]: Number(searchParams.get(k)),
                    });
                    break;
                }
                case 'boolean': {
                    Object.assign(props, {
                        [k]: Boolean(searchParams.get(k)),
                    });
                    break;
                }
                case 'object': {
                    Object.assign(props, {
                        [k]: JSON.parse(searchParams.get(k)),
                    });
                    break;
                }
                default: {
                    assert(typeof properties[k] === 'string', '传参只能是number/boolean/object/string四种类型');
                    Object.assign(props, {
                        [k]: searchParams.get(k),
                    });
                }
            }
        }
        else {
            switch (k) {
                case 'oakDisablePulldownRefresh': {
                    Object.assign(props, {
                        [k]: Boolean(searchParams.get(k)),
                    });
                    break;
                }
                default: {
                    Object.assign(props, {
                        [k]: searchParams.get(k),
                    });
                }
            }
        }
    }
    return props;
}
const withRouter = (Component, { path, properties }) => {
    const ComponentWithRouterProp = (props) => {
        const location = useLocation();
        const routerParams = useParams(); // 取路由 xx/:abbr 通过这个函数取到
        const width = useWidth();
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
        return (<Component {...rest} {...params} width={width} ref={forwardedRef} routeMatch={routeMatch}/>);
    };
    return React.forwardRef((props, ref) => <ComponentWithRouterProp {...props} forwardedRef={ref}/>);
};
export default withRouter;
