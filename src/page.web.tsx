import React from 'react';
import { withRouter, PullToRefresh } from './platforms/web';
import { get } from 'oak-domain/lib/utils/lodash';
import { CommonAspectDict } from 'oak-common-aspect';
import { Aspect, Context, EntityDict } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { BasicFeatures } from './features';
import { ExceptionHandler } from './types/ExceptionRoute';
import { Feature } from './types/Feature';
import {
    MiniprogramStyleMethods,
    OakCommonComponentMethods,
    OakComponentData,
    OakComponentOption,
    OakPageData,
    OakPageMethods,
    OakPageOption,
    OakPageProperties,
} from './types/Page';
import {
    ComponentThisType,
    makeHiddenComponentMethods,
    makeListComponentMethods,
    makeCommonComponentMethods as makeCommon,
    makePageMethods as makePage,
    ComponentData,
    ComponentProps,
} from './page.common';

function makeCommonComponentMethods<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>,
    FormedData extends WechatMiniprogram.Component.DataOption,
    Proj extends ED[T]['Selection']['data'],
    IsList extends boolean,
    TData extends WechatMiniprogram.Component.DataOption = {},
    TProperty extends WechatMiniprogram.Component.PropertyOption = {},
    TMethod extends WechatMiniprogram.Component.MethodOption = {}
>(
    features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD,
    exceptionRouterDict: Record<string, ExceptionHandler>,
    formData: OakPageOption<
        ED,
        T,
        Cxt,
        AD,
        FD,
        Proj,
        FormedData,
        IsList,
        TData,
        TProperty,
        TMethod
    >['formData']
): OakCommonComponentMethods<ED, T> &
    ComponentThisType<ED, T, FormedData, IsList, TData, TProperty, TMethod> {
    return {
        t(key: string, params?: object) {
            //  common: {
            //        GREETING: 'Hello {{name}}, nice to see you.',
            //   },
            // t('common:GREETING', {name: "John Doe" })
            return this.props.t(key, params);
        },
        resolveInput(input: React.BaseSyntheticEvent, keys) {
            const { currentTarget, target } = input;
            const { value } = Object.assign({}, currentTarget, target);
            const { dataset } = currentTarget;
            const result = {
                dataset,
                value,
            };
            if (keys) {
                keys.forEach((k) =>
                    Object.assign(result, {
                        [k]: target[k],
                    })
                );
            }
            return result;
        },
        navigateBack(option) {
            const { delta } = option || {};
            return new Promise((resolve, reject) => {
                try {
                    this.props.navigate(delta || -1);
                    resolve(undefined);
                } catch (err) {
                    reject(err);
                }
            });
        },
        navigateTo(options, state, disableNamespace) {
            const { url, events, fail, complete, success, ...rest } = options;
            let url2 = url.includes('?')
                ? url.concat(
                      this.state.oakFullpath
                          ? `&oakFrom=${this.state.oakFullpath}`
                          : ''
                  )
                : url.concat(
                      this.state.oakFullpath ? `?oakFrom=${this.state.oakFullpath}` : ''
                  );

            for (const param in rest) {
                const param2 = param as unknown as keyof typeof rest;
                if (rest[param2] !== undefined) {
                    url2 += `${url2.includes('?') ? '&' : '?'}${param}=${
                        typeof rest[param2] === 'string'
                            ? rest[param2]
                            : JSON.stringify(rest[param2])
                    }`;
                }
            }
            // 路由传入namespace
            if (!disableNamespace && this.props.namespace) {
                url2 =
                    (this.props.namespace.startsWith('/') ? '' : '/') +
                    (this.props.namespace === '/' ? '' : this.props.namespace) +
                    (url2.startsWith('/') ? '' : '/') +
                    url2;
            }
            return this.props.navigate(url2, { replace: false, state });
        },
        redirectTo(options, state, disableNamespace) {
            const { url, events, fail, complete, success, ...rest } = options;
            let url2 = url.includes('?')
                ? url.concat(
                      this.state.oakFullpath
                          ? `&oakFrom=${this.state.oakFullpath}`
                          : ''
                  )
                : url.concat(
                      this.state.oakFullpath
                          ? `?oakFrom=${this.state.oakFullpath}`
                          : ''
                  );

            for (const param in rest) {
                const param2 = param as unknown as keyof typeof rest;
                if (rest[param2] !== undefined) {
                    url2 += `${url2.includes('?') ? '&' : '?'}${param}=${
                        typeof rest[param2] === 'string'
                            ? rest[param2]
                            : JSON.stringify(rest[param2])
                    }`;
                }
            }
            // 路由传入namespace
            if (!disableNamespace && this.props.namespace) {
                url2 =
                    (this.props.namespace.startsWith('/') ? '' : '/') +
                    (this.props.namespace === '/' ? '' : this.props.namespace) +
                    (url2.startsWith('/') ? '' : '/') +
                    url2;
            }
            return this.props.navigate(url2, { replace: true, state });
        },

        ...makeCommon(features, exceptionRouterDict, formData),
    };
}

function makePageMethods<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>,
    FormedData extends WechatMiniprogram.Component.DataOption,
    Proj extends ED[T]['Selection']['data'],
    IsList extends boolean,
    TData extends WechatMiniprogram.Component.DataOption = {},
    TProperty extends WechatMiniprogram.Component.PropertyOption = {},
    TMethod extends WechatMiniprogram.Component.MethodOption = {}
>(
    features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD,
    options: OakPageOption<
        ED,
        T,
        Cxt,
        AD,
        FD,
        Proj,
        FormedData,
        IsList,
        TData,
        TProperty,
        TMethod
    >
): OakPageMethods &
    ComponentThisType<ED, T, FormedData, IsList, TData, TProperty, TMethod> {
    const { onPullDownRefresh, ...rest } = makePage(features, options);
    return {
        async onPullDownRefresh() {
            await onPullDownRefresh.call(this);
        },
        ...rest,
    };
}

function translateObservers(
    observers?: Record<string, (...args: any[]) => any>
): { fn: React.Component['componentDidUpdate'] } & ThisType<React.Component> {
    return {
        fn(prevProps, prevState) {
            const { state, props } = this;
            for (const obs in observers) {
                const keys = obs.split(',').map((ele) => ele.trim());
                let changed = false;
                for (const k of keys) {
                    if (k.includes('*')) {
                        throw new Error('web模式下带*的observer通配符暂不支持');
                    }
                    if (
                        get(props, k) !== get(prevProps, k) ||
                        get(state, k) !== get(prevState, k)
                    ) {
                        changed = true;
                        break;
                    }
                }

                const args = [];
                if (changed) {
                    for (const k of keys) {
                        args.push(
                            get(props, k) === undefined
                                ? get(state, k)
                                : get(props, k)
                        );
                    }
                    observers[obs].apply(this, args);
                }
            }
        },
    };
}

function makeMiniprogramCompatibleFunctions(): MiniprogramStyleMethods &
    ThisType<React.Component> {
    return {
        triggerEvent(name, detail, option) {
            throw new Error('method not implemented yet');
        },
        animate(selector, frames, duration, timeline) {
            throw new Error('method not implemented yet');
        },
        clearAnimation(selector, option, callback) {
            throw new Error('method not implemented yet');
        },
    };
}

const DEFAULT_REACH_BOTTOM_DISTANCE = 50;

export function createPage<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>,
    Proj extends ED[T]['Selection']['data'],
    FormedData extends WechatMiniprogram.Component.DataOption,
    IsList extends boolean,
    TData extends WechatMiniprogram.Component.DataOption = {},
    TProperty extends WechatMiniprogram.Component.PropertyOption = {},
    TMethod extends WechatMiniprogram.Component.MethodOption = {}
>(
    options: OakPageOption<
        ED,
        T,
        Cxt,
        AD,
        FD,
        Proj,
        FormedData,
        IsList,
        TData,
        TProperty,
        TMethod
    >,
    features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD,
    exceptionRouterDict: Record<string, ExceptionHandler>
) {
    const { formData, isList, render } = options as OakPageOption<
        ED,
        T,
        Cxt,
        AD,
        FD,
        Proj,
        FormedData,
        IsList,
        TData,
        TProperty,
        TMethod
    > & {
        render: () => React.ReactNode &
            ComponentThisType<
                ED,
                T,
                FormedData,
                IsList,
                TData,
                TProperty,
                TMethod
            >;
    };
    const hiddenMethods = makeHiddenComponentMethods();
    const commonMethods = makeCommonComponentMethods(
        features,
        exceptionRouterDict,
        formData
    );
    const listMethods = makeListComponentMethods(features);
    const { onLoad, onPullDownRefresh, onReachBottom, ...restPageMethods } =
        makePageMethods(features, options);

    const { methods, lifetimes, pageLifetimes, data, observers } = options;

    const { fn } = translateObservers(observers);
    class OakPageWrapper extends React.PureComponent<
        ComponentProps<TProperty>,
        ComponentData<ED, T, FormedData, TData>
    > {
        constructor(props: any) {
            super(props);
            this.state = (data || {}) as any;
            for (const m in commonMethods) {
                Object.assign(this, {
                    [m]: commonMethods[m as keyof typeof commonMethods]!.bind(
                        this
                    ),
                });
            }
            for (const m in listMethods) {
                Object.assign(this, {
                    [m]: listMethods[m as keyof typeof listMethods]!.bind(this),
                });
            }
            for (const m in restPageMethods) {
                Object.assign(this, {
                    [m]: restPageMethods[
                        m as keyof typeof restPageMethods
                    ]!.bind(this),
                });
            }
            if (methods) {
                const { onPullDownRefresh, onReachBottom, ...restMethods } =
                    methods;
                for (const m in restMethods) {
                    Object.assign(this, {
                        [m]: restMethods[m as keyof typeof restMethods]!.bind(
                            this
                        ),
                    });
                }
            }
            lifetimes?.created && lifetimes.created.call(this);
        }

        features = features;
        isReachBottom = false;
        componentDidUpdate = fn;

        scrollEvent = () => {
            this.checkReachBottom();
        };

        registerPageScroll() {
            window.addEventListener('scroll', this.scrollEvent);
        }

        unregisterPageScroll() {
            window.removeEventListener('scroll', this.scrollEvent);
        }

        checkReachBottom() {
            const isCurrentReachBottom =
                document.body.scrollHeight -
                    (window.innerHeight + window.scrollY) <=
                DEFAULT_REACH_BOTTOM_DISTANCE;

            if (!this.isReachBottom && isCurrentReachBottom) {
                this.isReachBottom = true;
                // 执行触底事件
                if (methods?.onReachBottom) {
                    methods.onReachBottom.call(this);
                    return;
                }
                if (this.props.width === 'xs') {
                    onReachBottom.call(this);
                }
                return;
            }

            this.isReachBottom = isCurrentReachBottom;
        }

        async componentDidMount() {
            this.registerPageScroll();
            if (typeof formData === 'function') {
                hiddenMethods.subscribe.call(this);
                commonMethods.reRender.call(this);
            }
            await onLoad.call(this, this.props);
            methods?.onReady && methods.onReady.call(this);
            lifetimes?.attached && lifetimes.attached.call(this);
            lifetimes?.ready && lifetimes.ready.call(this);
            pageLifetimes?.show && pageLifetimes.show.call(this);
        }

        async componentWillUnmount() {
            this.unregisterPageScroll();
            if (this.state.oakFullpath) {
                features.runningTree.destroyNode(this.state.oakFullpath);
            }
            if (typeof formData === 'function') {
                hiddenMethods.unsubscribe.call(this);
            }
            methods?.onUnload && methods.onUnload.call(this);
            lifetimes?.detached && lifetimes.detached.call(this);
        }

        render(): React.ReactNode {
            const Render = render.call(this);
            const { oakLoading } = this.state;
            const { enablePullDownRefresh } = this.props;

            if (enablePullDownRefresh && this.props.width === 'xs') {
                return React.cloneElement(
                    <PullToRefresh
                        onRefresh={() => {
                            if (methods?.onPullDownRefresh) {
                                methods.onPullDownRefresh.call(this);
                                return;
                            } else {
                                onPullDownRefresh.call(this);
                            }
                        }}
                        refreshing={oakLoading}
                        distanceToRefresh={DEFAULT_REACH_BOTTOM_DISTANCE}
                        indicator={{
                            activate: commonMethods.t.call(
                                this,
                                'common:ptrActivate'
                            ),
                            deactivate: commonMethods.t.call(
                                this,
                                'common:ptrDeactivate'
                            ),
                            release: commonMethods.t.call(
                                this,
                                'common:ptrRelease'
                            ),
                            finish: commonMethods.t.call(
                                this,
                                'common:ptrFinish'
                            ),
                        }}
                    />,
                    {},
                    Render
                );
            }
            return Render;
        }
    }

    // 可能有问题，by Xc
    Object.assign(OakPageWrapper, makeMiniprogramCompatibleFunctions());
    return withRouter(OakPageWrapper, false, options.path);
}

export function createComponent<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>,
    FormedData extends WechatMiniprogram.Component.DataOption,
    IsList extends boolean,
    TData extends WechatMiniprogram.Component.DataOption = {},
    TProperty extends WechatMiniprogram.Component.PropertyOption = {},
    TMethod extends WechatMiniprogram.Component.MethodOption = {}
>(
    options: OakComponentOption<
        ED,
        T,
        Cxt,
        AD,
        FD,
        FormedData,
        IsList,
        TData,
        TProperty,
        TMethod
    >,
    features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD,
    exceptionRouterDict: Record<string, ExceptionHandler>,
) {
    const {
        formData,
        isList,
        entity,
        methods,
        lifetimes,
        pageLifetimes,
        data,
        properties,
        observers,
        render,
    } = options as OakComponentOption<
        ED,
        T,
        Cxt,
        AD,
        FD,
        FormedData,
        IsList,
        TData,
        TProperty,
        TMethod
    > & {
        render: () => React.ReactNode &
            ComponentThisType<
                ED,
                T,
                FormedData,
                IsList,
                TData,
                TProperty,
                TMethod
            >;
    };
    const hiddenMethods = makeHiddenComponentMethods();
    const commonMethods = makeCommonComponentMethods(
        features,
        exceptionRouterDict,
        formData
    );
    const listMethods = makeListComponentMethods(features);

    const { fn } = translateObservers(observers);
    class OakComponentWrapper extends React.PureComponent<
        ComponentProps<TProperty>,
        OakComponentData<ED, T>
    > {
        constructor(props: any) {
            super(props);
            this.state = (data || {}) as any;
            for (const m in commonMethods) {
                Object.assign(this, {
                    [m]: commonMethods[m as keyof typeof commonMethods]!.bind(
                        this
                    ),
                });
            }
            for (const m in listMethods) {
                Object.assign(this, {
                    [m]: listMethods[m as keyof typeof listMethods]!.bind(this),
                });
            }
            if (methods) {
                for (const m in methods) {
                    Object.assign(this, {
                        [m]: methods[m as keyof typeof methods]!.bind(this),
                    });
                }
            }
            lifetimes?.created && lifetimes.created.call(this);
        }

        features = features;
        isReachBottom = false;

        async componentDidMount() {
            const { oakPath, oakParent } = this.props;
            if (oakParent || oakPath) {
                const oakFullpath = `${oakParent || ''}${oakParent && oakPath ? '.' : ''}${oakPath || ''}`;
                this.setState(
                    {
                        oakFullpath,
                        oakEntity: entity as any,
                    },
                    () => {
                        //commonMethods.reRender.call(this);
                    }
                );
            }
            if (typeof formData === 'function') {
                hiddenMethods.subscribe.call(this);
                commonMethods.reRender.call(this);
            }
            lifetimes?.attached && lifetimes.attached.call(this);
            lifetimes?.ready && lifetimes.ready.call(this);
            pageLifetimes?.show && pageLifetimes.show.call(this);
        }

        async componentWillUnmount() {
            if (typeof formData === 'function') {
                hiddenMethods.unsubscribe.call(this);
            }
            
            lifetimes?.detached && lifetimes.detached.call(this);
        }

        componentDidUpdate(
            prevProps: Readonly<ComponentProps<TProperty>>,
            prevState: Readonly<OakComponentData<ED, T>>
        ) {
            if (
                this.props.oakPath &&
                prevProps.oakPath !== this.props.oakPath
            ) {
                this.onPropsChanged({
                    path: this.props.oakPath,
                });
            }
            if (
                this.props.oakParent &&
                prevProps.oakParent !== this.props.oakParent
            ) {
                this.onPropsChanged({
                    parent: this.props.oakParent,
                });
            }
            fn?.call(this, prevProps, prevState);
        }

        async onPropsChanged(options: { path?: string; parent?: string }) {
            const path2 = options.hasOwnProperty('path')
                ? options.path!
                : this.props.oakPath;
            const parent2 = options.hasOwnProperty('parent')
                ? options.parent!
                : this.props.oakParent;
            const oakFullpath2 = `${parent2 || ''}${parent2 && path2 ? '.' : ''}${path2 || ''}`;

            if (oakFullpath2) {
                if (oakFullpath2 !== this.state.oakFullpath) {
                    this.setState({
                        oakFullpath: oakFullpath2,
                        oakEntity: entity as string,
                    });
                    //commonMethods.reRender.call(this);
                }
            }
        }

        render(): React.ReactNode {
            const Render = render.call(this);
            return Render;
        }

        triggerEvent<DetailType = any>(
            name: string,
            detail?: DetailType,
            options?: WechatMiniprogram.Component.TriggerEventOption
        ) {
            // 需要兼容
        }
    }

    // 可能有问题，by Xc
    Object.assign(OakComponentWrapper, makeMiniprogramCompatibleFunctions());
    return withRouter(OakComponentWrapper, true);
}
