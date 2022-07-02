import * as React from 'react';
import PullToRefresh from './platforms/web/PullToRefresh';
import Wrapper from './platforms/web/Wrapper';
import { assign, omit } from 'lodash';
import { CommonAspectDict } from 'oak-common-aspect';
import { Aspect, Context, EntityDict } from 'oak-domain/lib/types';
import { BasicFeatures } from './features';
import { ExceptionHandler } from './types/ExceptionRoute';
import { Feature } from './types/Feature';
import {
    OakCommonComponentMethods,
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
    ED extends EntityDict,
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
        resolveInput: (input: WechatMiniprogram.CustomEvent, keys) => {
            const { currentTarget, detail } = input;
            const { dataset } = currentTarget;
            const { value } = detail;
            const result = {
                dataset,
                value,
            };
            if (keys) {
                keys.forEach((k) =>
                    assign(result, {
                        [k]: detail[k],
                    })
                );
            }
            return result;
        },
        navigateBack: (option) => wx.navigateBack(option),
        navigateTo(options) {
            const { url, events, fail, complete, success, ...rest } = options;
            let url2 = url.includes('?')
                ? url.concat(`&oakFrom=${this.state.oakFullpath}`)
                : url.concat(`?oakFrom=${this.state.oakFullpath}`);

            for (const param in rest) {
                const param2 = param as unknown as keyof typeof rest;
                url2 += `&${param}=${
                    typeof rest[param2] === 'string'
                        ? rest[param2]
                        : JSON.stringify(rest[param2])
                }`;
            }
            assign(options, {
                url: url2,
            });
            return wx.navigateTo(options);
        },

        ...makeCommon(features, exceptionRouterDict, formData),
    };
}

function makePageMethods<
    ED extends EntityDict,
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
            if (!this.state.oakLoading) {
                await wx.stopPullDownRefresh();
            }
        },
        ...rest,
    };
}

const DEFAULT_REACH_BOTTOM_DISTANCE = 50;

export function createPage<
    ED extends EntityDict,
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
    exceptionRouterDict: Record<string, ExceptionHandler>,
    context: Cxt
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
    const listMethods = isList ? makeListComponentMethods(features) : {};
    const { onLoad, onPullDownRefresh, onReachBottom, ...restPageMethods } =
        makePageMethods(features, options);

    const { methods, lifetimes, pageLifetimes, data } = options;

    class OakPageWrapper extends React.PureComponent<
        ComponentProps<TProperty>,
        ComponentData<ED, T, FormedData, TData>
    > {
        constructor(props: any) {
            super(props);
            this.state = (data || {}) as any;
            /* for (const m in hiddenMethods) {
                assign(this, {
                    [m]: hiddenMethods[m as keyof typeof hiddenMethods]!.bind(this),
                });
            } */
            for (const m in commonMethods) {
                assign(this, {
                    [m]: commonMethods[m as keyof typeof commonMethods]!.bind(
                        this
                    ),
                });
            }
            for (const m in listMethods) {
                assign(this, {
                    [m]: (listMethods as Record<string, Function>)[
                        m as keyof typeof listMethods
                    ]!.bind(this),
                });
            }
            for (const m in restPageMethods) {
                assign(this, {
                    [m]: restPageMethods[
                        m as keyof typeof restPageMethods
                    ]!.bind(this),
                });
            }
            if (methods) {
                const {
                    onPullDownRefresh,
                    onReachBottom,
                    ...restMethods
                } = methods;
                for (const m in restMethods) {
                    assign(this, {
                        [m]: restMethods[m as keyof typeof restMethods]!.bind(
                            this
                        ),
                    });
                }
            }
            context.setScene(options.path);
            lifetimes?.created && lifetimes.created.call(this);
            hiddenMethods.subscribe.call(this);
            lifetimes?.attached && lifetimes.attached.call(this);
        }

        features = features;
        isReachBottom = false;

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
            const isCurrentReachBottom =
                document.body.scrollHeight -
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

        componentDidMount() {
            methods?.onLoad && methods.onLoad.call(this, this.props);
            methods?.onReady && methods.onReady.call(this);
            lifetimes?.ready && lifetimes.ready.call(this);
            pageLifetimes?.show && pageLifetimes.show.call(this);
        }

        componentWillUnmount() {
            hiddenMethods.unsubscribe.call(this);
            methods?.onUnload && methods.onUnload.call(this);
            lifetimes?.detached && lifetimes.detached.call(this);
        }

        render(): React.ReactNode {
            const Render = render.call(this);
            const { oakLoading } = this.state;

            return React.cloneElement(
                <PullToRefresh
                    onRefresh={() => {
                        onPullDownRefresh.call(this);
                        methods?.onPullDownRefresh &&
                            methods.onPullDownRefresh.call(this);
                    }}
                    refreshing={oakLoading}
                    distanceToRefresh={DEFAULT_REACH_BOTTOM_DISTANCE}
                    getScrollContainer={() => {
                        document.body;
                    }}
                />,
                {},
                Render
            );
        }
    }
    return () => <Wrapper PageWrapper={OakPageWrapper} />;
}



export function createComponent<
    ED extends EntityDict,
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
    context: Cxt
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
        actions,
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
    const listMethods = isList ? makeListComponentMethods(features) : {};

    class OakPageWrapper extends React.PureComponent<
        ComponentProps<TProperty>,
        ComponentData<ED, T, FormedData, TData>
    > {
        constructor(props: any) {
            super(props);
            this.state = (data || {}) as any;
            /* for (const m in hiddenMethods) {
                assign(this, {
                    [m]: hiddenMethods[m as keyof typeof hiddenMethods]!.bind(this),
                });
            } */
            for (const m in commonMethods) {
                assign(this, {
                    [m]: commonMethods[m as keyof typeof commonMethods]!.bind(
                        this
                    ),
                });
            }
            for (const m in listMethods) {
                assign(this, {
                    [m]: (listMethods as Record<string, Function>)[
                        m as keyof typeof listMethods
                    ]!.bind(this),
                });
            }
            if (methods) {
                for (const m in methods) {
                    assign(this, {
                        [m]: methods[m as keyof typeof methods]!.bind(this),
                    });
                }
            }
            lifetimes?.created && lifetimes.created.call(this);
            hiddenMethods.subscribe.call(this);
            lifetimes?.attached && lifetimes.attached.call(this);
        }

        features = features;
        isReachBottom = false;

        componentDidMount() {
            lifetimes?.ready && lifetimes.ready.call(this);
            pageLifetimes?.show && pageLifetimes.show.call(this);
        }

        componentWillUnmount() {
            hiddenMethods.unsubscribe.call(this);
            lifetimes?.detached && lifetimes.detached.call(this);
        }

        render(): React.ReactNode {
            const Render = render.call(this);
            return Render;
        }
    }
    return () => <Wrapper PageWrapper={OakPageWrapper} />;
}

export type MakeOakPage<
    ED extends EntityDict,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>
> = <
    T extends keyof ED,
    Proj extends ED[T]['Selection']['data'],
    FormedData extends WechatMiniprogram.Component.DataOption,
    IsList extends boolean,
    TData extends WechatMiniprogram.Component.DataOption,
    TProperty extends WechatMiniprogram.Component.PropertyOption,
    TMethod extends WechatMiniprogram.Component.MethodOption
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
    >
) => JSX.Element;

export type MakeOakComponent<
    ED extends EntityDict,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>
> = <
    T extends keyof ED,
    FormedData extends WechatMiniprogram.Component.DataOption,
    IsList extends boolean,
    TData extends WechatMiniprogram.Component.DataOption,
    TProperty extends WechatMiniprogram.Component.PropertyOption,
    TMethod extends WechatMiniprogram.Component.MethodOption
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
    >
) => JSX.Element;
