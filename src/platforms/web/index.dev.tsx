import {
    Aspect,
    Checker,
    Context,
    EntityDict,
    RowStore,
    StorageSchema,
    Trigger,
    ActionDictOfEntityDict,
    Watcher,
    AspectWrapper,
} from 'oak-domain/lib/types';
import { AspectDict } from 'oak-common-aspect/src/aspectDict';
import { Feature } from '../../types/Feature';
import { initialize as init } from '../../initialize.dev';
import { BasicFeatures } from '../../features';
import { assign } from 'lodash';
import { ExceptionHandler, ExceptionRouters } from '../../types/ExceptionRoute';
import {
    createComponentOptions,
    createPageOptions,
    OakComponentOption,
    OakPageData,
    OakPageInstanceProperties,
    OakPageMethods,
    OakPageOption,
    OakWebOptions,
    DataOption,
    MethodOption,
    IAnyObject,
} from './index';

//react
import React, { Component } from 'react';
import PullToRefresh from './PullToRefresh';
import Wrapper from './Wrapper';

const DEFAULT_REACH_BOTTOM_DISTANCE = 50;

export function initialize<
    ED extends EntityDict,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD & AspectDict<ED, Cxt>>>
>(
    storageSchema: StorageSchema<ED>,
    createFeatures: (
        aspectWrapper: AspectWrapper<ED, Cxt, AD>,
        basicFeatures: BasicFeatures<ED, Cxt, AD & AspectDict<ED, Cxt>>,
        context: Cxt
    ) => FD,
    contextBuilder: (cxtString?: string) => (store: RowStore<ED, Cxt>) => Cxt,
    contextCreator: (store: RowStore<ED, Cxt>) => Cxt,
    aspectDict: AD,
    exceptionRouters: ExceptionRouters = [],
    triggers?: Array<Trigger<ED, keyof ED, Cxt>>,
    checkers?: Array<Checker<ED, keyof ED, Cxt>>,
    watchers?: Array<Watcher<ED, keyof ED, Cxt>>,
    initialData?: {
        [T in keyof ED]?: Array<ED[T]['OpSchema']>;
    },
    actionDict?: ActionDictOfEntityDict<ED>
) {
    const { subscribe, features } = init<ED, Cxt, AD, FD>(
        storageSchema,
        createFeatures,
        contextBuilder,
        contextCreator,
        aspectDict,
        triggers,
        checkers,
        watchers,
        initialData,
        actionDict
    );

    const exceptionRouterDict: Record<string, ExceptionHandler> = {};
    for (const router of exceptionRouters) {
        assign(exceptionRouterDict, {
            [router[0].name]: router[1],
        });
    }

    return {
        OakPage: <
            T extends keyof ED,
            P extends DataOption,
            D extends DataOption,
            M extends MethodOption,
            IsList extends boolean,
            Proj extends ED[T]['Selection']['data'],
            IS extends IAnyObject = {},
            FormedData extends React.ComponentState = {}
        >(
            options: OakPageOption<
                ED,
                T,
                Cxt,
                AD,
                FD,
                Proj,
                FormedData,
                IsList
            >,
            componentOptions: OakWebOptions<
                P,
                D,
                M,
                OakPageMethods<ED, T>,
                OakPageData,
                OakPageInstanceProperties<ED, Cxt, AD, FD>,
                IS,
                true
            > = {}
        ) => {
            const oakOptions = createPageOptions(
                options,
                subscribe,
                features,
                exceptionRouterDict
            );
            const { render, methods } = oakOptions;
            const { methods: methods2, data = {} } = componentOptions || {};

            class PageWrapper extends Component {
                constructor(props: P) {
                    super(props);
                    this.state = {
                        ...data,
                    };

                    const methods3 = Object.assign({}, methods2, methods);
                    Object.keys(methods3).map((ele) => {
                        (this as any)[ele as keyof typeof methods3] = (
                            ...args: any[]
                        ) => {
                            return methods3[ele as keyof typeof methods3].apply(
                                this,
                                args
                            );
                        };
                    });
                }

                features = features;
                isReady = false;

                async componentDidMount() {
                    this.attached();
                    this.ready();
                    this.subscribe();
                    this.registerPageScroll();
                }

                async componentWillUnmount() {
                    this.detached();
                    this.unsubscribe();
                    this.unregisterPageScroll();
                }

                isPullDownRefreshEnabled = () => {
                    return true;
                };

                getReachBottomDistance = () => {
                    return DEFAULT_REACH_BOTTOM_DISTANCE;
                };

                isReachBottom = false;

                scrollEvent = () => {
                    this.checkReachBottom();

                    const event = { scrollTop: window.scrollY };
                };

                registerPageScroll = () => {
                    window.addEventListener('scroll', this.scrollEvent);
                };

                unregisterPageScroll = () => {
                    window.removeEventListener('scroll', this.scrollEvent);
                };

                checkReachBottom = () => {
                    const isCurrentReachBottom =
                        document.body.scrollHeight -
                            (window.innerHeight + window.scrollY) <=
                        this.getReachBottomDistance();

                    if (!this.isReachBottom && isCurrentReachBottom) {
                        this.isReachBottom = true;
                        // 执行触底事件
                        this.onReachBottom();
                        return;
                    }

                    this.isReachBottom = isCurrentReachBottom;
                };

                render() {
                    const Render = render.call(this);
                    if (this.isPullDownRefreshEnabled()) {
                        return React.cloneElement(
                            <PullToRefresh
                                onRefresh={this.onPullDownRefresh}
                                refreshing={this.state.oakLoading}
                                distanceToRefresh={50}
                                getScrollContainer={() => {
                                    document.body;
                                }}
                            />,
                            {},
                            Render
                        );
                    }

                    return Render;
                }
            }
            return () => <Wrapper PageWrapper={PageWrapper} />;
        },
        OakComponent: <
            T extends keyof ED,
            D extends DataOption,
            P extends DataOption,
            M extends MethodOption,
            IsList extends boolean,
            IS extends IAnyObject = {},
            FormedData extends React.ComponentState = {}
        >(
            options: OakComponentOption<ED, T, Cxt, AD, FD, FormedData, IsList>,
            componentOptions: OakWebOptions<
                P,
                D,
                M,
                OakPageMethods<ED, T>,
                OakPageData,
                OakPageInstanceProperties<ED, Cxt, AD, FD>,
                IS,
                true
            > = {}
        ) => {
            const oakOptions = createComponentOptions(
                options,
                subscribe,
                features,
                exceptionRouterDict
            );
            const { render, methods } = oakOptions;
            const { methods: methods2, data = {} } = componentOptions || {};

            class ComponentWrapper extends Component {
                constructor(props: any) {
                    super(props);
                    this.state = {
                        ...data,
                    };
                    const methods3 = Object.assign({}, methods2, methods);
                    Object.keys(methods3).map((ele) => {
                        (this as any)[ele as keyof typeof methods3] = (
                            ...args: any[]
                        ) => {
                            return methods3[ele as keyof typeof methods3].apply(
                                this,
                                args
                            );
                        };
                    });
                }
                features = features;

                async componentDidMount() {
                    this.attached();
                    this.ready();
                    this.subscribe();
                }

                async componentWillUnmount() {
                    this.detached();
                    this.unsubscribe();
                }

                render() {
                    const Render = render.call(this);
                    return Render;
                }
            }
            return ComponentWrapper;
        },
        features,
    };
}
