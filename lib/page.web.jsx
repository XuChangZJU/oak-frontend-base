"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComponent = exports.createPage = void 0;
const React = __importStar(require("react"));
const PullToRefresh_1 = __importDefault(require("./platforms/web/PullToRefresh"));
const router_1 = __importDefault(require("./platforms/web/router"));
const lodash_1 = require("lodash");
const page_common_1 = require("./page.common");
function makeCommonComponentMethods(features, exceptionRouterDict, formData) {
    return {
        t(key, params) {
            //  common: {
            //        GREETING: 'Hello {{name}}, nice to see you.',
            //   },
            // t('common:GREETING', {name: "John Doe" })
            return this.props.t(key, params);
        },
        resolveInput(input, keys) {
            const { currentTarget, target } = input;
            const { value } = Object.assign({}, currentTarget, target);
            const { dataset } = currentTarget;
            const result = {
                dataset,
                value,
            };
            if (keys) {
                keys.forEach((k) => (0, lodash_1.assign)(result, {
                    [k]: target[k],
                }));
            }
            return result;
        },
        navigateBack(option) {
            const { delta } = option || {};
            return new Promise((resolve, reject) => {
                try {
                    this.props.navigate(delta || -1);
                    resolve(undefined);
                }
                catch (err) {
                    reject(err);
                }
            });
        },
        navigateTo(options, state) {
            const { url, events, fail, complete, success, ...rest } = options;
            let url2 = url.includes('?')
                ? url.concat(`&oakFrom=${this.state.oakFullpath}`)
                : url.concat(`?oakFrom=${this.state.oakFullpath}`);
            for (const param in rest) {
                const param2 = param;
                url2 += `&${param}=${typeof rest[param2] === 'string'
                    ? rest[param2]
                    : JSON.stringify(rest[param2])}`;
            }
            return this.props.navigate(url2, { replace: false, state });
        },
        redirectTo(options, state) {
            const { url, events, fail, complete, success, ...rest } = options;
            let url2 = url.includes('?')
                ? url.concat(`&oakFrom=${this.state.oakFullpath}`)
                : url.concat(`?oakFrom=${this.state.oakFullpath}`);
            for (const param in rest) {
                const param2 = param;
                url2 += `&${param}=${typeof rest[param2] === 'string'
                    ? rest[param2]
                    : JSON.stringify(rest[param2])}`;
            }
            return this.props.navigate(url2, { replace: true, state });
        },
        ...(0, page_common_1.makeCommonComponentMethods)(features, exceptionRouterDict, formData),
    };
}
function makePageMethods(features, options, context) {
    const { onPullDownRefresh, ...rest } = (0, page_common_1.makePageMethods)(features, options, context);
    return {
        async onPullDownRefresh() {
            await onPullDownRefresh.call(this);
        },
        ...rest,
    };
}
function translateObservers(observers) {
    return {
        fn(prevProps, prevState) {
            const { state, props } = this;
            for (const obs in observers) {
                const keys = obs.split(',').map(ele => ele.trim());
                let changed = false;
                for (const k of keys) {
                    if (k.includes('*')) {
                        throw new Error('web模式下带*的observer通配符暂不支持');
                    }
                    if ((0, lodash_1.get)(props, k) !== (0, lodash_1.get)(prevProps, k) || (0, lodash_1.get)(state, k) !== (0, lodash_1.get)(prevState, k)) {
                        changed = true;
                        break;
                    }
                }
                const args = [];
                if (changed) {
                    for (const k of keys) {
                        args.push((0, lodash_1.get)(props, k) === undefined ? (0, lodash_1.get)(state, k) : (0, lodash_1.get)(props, k));
                    }
                    observers[obs].apply(this, args);
                }
            }
        }
    };
}
const DEFAULT_REACH_BOTTOM_DISTANCE = 50;
function createPage(options, features, exceptionRouterDict, context) {
    const { formData, isList, render } = options;
    const hiddenMethods = (0, page_common_1.makeHiddenComponentMethods)();
    const commonMethods = makeCommonComponentMethods(features, exceptionRouterDict, formData);
    const listMethods = isList ? (0, page_common_1.makeListComponentMethods)(features) : {};
    const { onLoad, onPullDownRefresh, onReachBottom, ...restPageMethods } = makePageMethods(features, options, context);
    const { methods, lifetimes, pageLifetimes, data, observers } = options;
    const { fn } = translateObservers(observers);
    class OakPageWrapper extends React.PureComponent {
        constructor(props) {
            super(props);
            this.state = (data || {});
            /* for (const m in hiddenMethods) {
                assign(this, {
                    [m]: hiddenMethods[m as keyof typeof hiddenMethods]!.bind(this),
                });
            } */
            for (const m in commonMethods) {
                (0, lodash_1.assign)(this, {
                    [m]: commonMethods[m].bind(this),
                });
            }
            for (const m in listMethods) {
                (0, lodash_1.assign)(this, {
                    [m]: listMethods[m].bind(this),
                });
            }
            for (const m in restPageMethods) {
                (0, lodash_1.assign)(this, {
                    [m]: restPageMethods[m].bind(this),
                });
            }
            if (methods) {
                const { onPullDownRefresh, onReachBottom, ...restMethods } = methods;
                for (const m in restMethods) {
                    (0, lodash_1.assign)(this, {
                        [m]: restMethods[m].bind(this),
                    });
                }
            }
            context.setScene(options.path);
            lifetimes?.created && lifetimes.created.call(this);
        }
        features = features;
        isReachBottom = false;
        componentDidUpdate = fn;
        scrollEvent = () => {
            this.checkReachBottom();
            const event = { scrollTop: window.scrollY };
        };
        registerPageScroll() {
            window.addEventListener('scroll', this.scrollEvent);
        }
        unregisterPageScroll() {
            window.removeEventListener('scroll', this.scrollEvent);
        }
        checkReachBottom() {
            const isCurrentReachBottom = document.body.scrollHeight -
                (window.innerHeight + window.scrollY) <=
                DEFAULT_REACH_BOTTOM_DISTANCE;
            if (!this.isReachBottom && isCurrentReachBottom) {
                this.isReachBottom = true;
                // 执行触底事件
                onReachBottom.call(this);
                methods?.onReachBottom && methods.onReachBottom.call(this);
                return;
            }
            this.isReachBottom = isCurrentReachBottom;
        }
        async componentDidMount() {
            hiddenMethods.subscribe.call(this);
            await onLoad.call(this, this.props);
            methods?.onLoad && methods.onLoad.call(this, this.props);
            methods?.onReady && methods.onReady.call(this);
            lifetimes?.attached && lifetimes.attached.call(this);
            lifetimes?.ready && lifetimes.ready.call(this);
            pageLifetimes?.show && pageLifetimes.show.call(this);
        }
        async componentWillUnmount() {
            features.runningTree.destroyNode(this.state.oakFullpath);
            hiddenMethods.unsubscribe.call(this);
            methods?.onUnload && methods.onUnload.call(this);
            lifetimes?.detached && lifetimes.detached.call(this);
        }
        render() {
            const Render = render.call(this);
            const { oakLoading } = this.state;
            return React.cloneElement(<PullToRefresh_1.default onRefresh={() => {
                    onPullDownRefresh.call(this);
                    methods?.onPullDownRefresh &&
                        methods.onPullDownRefresh.call(this);
                }} refreshing={oakLoading} distanceToRefresh={DEFAULT_REACH_BOTTOM_DISTANCE} getScrollContainer={() => {
                    document.body;
                }}/>, {}, Render);
        }
    }
    return (0, router_1.default)(OakPageWrapper);
}
exports.createPage = createPage;
function createComponent(options, features, exceptionRouterDict, context) {
    const { formData, isList, entity, methods, lifetimes, pageLifetimes, data, properties, observers, render, } = options;
    const hiddenMethods = (0, page_common_1.makeHiddenComponentMethods)();
    const commonMethods = makeCommonComponentMethods(features, exceptionRouterDict, formData);
    const listMethods = isList ? (0, page_common_1.makeListComponentMethods)(features) : {};
    const { fn } = translateObservers(observers);
    class OakPageWrapper extends React.PureComponent {
        constructor(props) {
            super(props);
            this.state = (data || {});
            /* for (const m in hiddenMethods) {
                assign(this, {
                    [m]: hiddenMethods[m as keyof typeof hiddenMethods]!.bind(this),
                });
            } */
            for (const m in commonMethods) {
                (0, lodash_1.assign)(this, {
                    [m]: commonMethods[m].bind(this),
                });
            }
            for (const m in listMethods) {
                (0, lodash_1.assign)(this, {
                    [m]: listMethods[m].bind(this),
                });
            }
            if (methods) {
                for (const m in methods) {
                    (0, lodash_1.assign)(this, {
                        [m]: methods[m].bind(this),
                    });
                }
            }
            lifetimes?.created && lifetimes.created.call(this);
        }
        features = features;
        isReachBottom = false;
        async componentDidMount() {
            hiddenMethods.subscribe.call(this);
            const { oakPath, oakParent } = this.props;
            if (oakParent && oakPath) {
                const oakFullpath = `${oakParent}.${oakPath}`;
                this.setState({
                    oakFullpath,
                    oakEntity: entity,
                }, () => {
                    commonMethods.reRender.call(this);
                });
            }
            lifetimes?.attached && lifetimes.attached.call(this);
            lifetimes?.ready && lifetimes.ready.call(this);
            pageLifetimes?.show && pageLifetimes.show.call(this);
        }
        async componentWillUnmount() {
            hiddenMethods.unsubscribe.call(this);
            lifetimes?.detached && lifetimes.detached.call(this);
        }
        componentDidUpdate = fn;
        render() {
            const Render = render.call(this);
            return Render;
        }
    }
    return (0, router_1.default)(OakPageWrapper);
}
exports.createComponent = createComponent;
