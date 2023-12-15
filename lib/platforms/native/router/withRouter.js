"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = tslib_1.__importDefault(require("react"));
const assert_1 = require("oak-domain/lib/utils/assert");
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
        if (properties && properties[k]) {
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
                    (0, assert_1.assert)(typeof properties[k] === 'string', '传参只能是number/boolean/object/string四种类型');
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
        const { forwardedRef, ...rest } = props;
        let params = {};
        /**
         * 由path来判定是否为Page。这里有个隐患，未来实现了keepAlive后，可能会影响到之前压栈的Page
         * 待测试。by Xc 20231102
         */
        if (path) {
            params = Object.assign(params, getParams(routeParams, properties));
        }
        return ((0, jsx_runtime_1.jsx)(Component, { ...rest, ...params,  width: "xs", ref: forwardedRef }));
    };
    return react_1.default.forwardRef((props, ref) => (0, jsx_runtime_1.jsx)(ComponentWithRouterProp, { ...props, forwardedRef: ref }));
};
exports.default = withRouter;
