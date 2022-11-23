/// <reference path="../node_modules/@types/wechat-miniprogram/index.d.ts" />
import assert from 'assert';
import React from 'react';
import { withRouter, PullToRefresh } from './platforms/web';
import { get } from 'oak-domain/lib/utils/lodash';
import { CommonAspectDict } from 'oak-common-aspect';
import { Action, Aspect, CheckerType, DeduceSorterItem, EntityDict } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { BasicFeatures } from './features';
import { NamedFilterItem, NamedSorterItem } from './types/NamedCondition';
import { Feature } from './types/Feature';
import {
    ComponentData,
    ComponentProps,
    OakComponentOption,
    OakNavigateToParameters,
    WebComponentCommonMethodNames,
    WebComponentListMethodNames,
    WebComponentSingleMethodNames,
} from './types/Page';

import {
    onPathSet, reRender, refresh,
    loadMore, execute,
    destroyNode,
} from './page.common';
import { MessageProps } from './types/Message';
import { NotificationProps } from './types/Notification';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';

abstract class OakComponentBase<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends AsyncContext<ED>,
    FrontCxt extends SyncContext<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature>,
    FormedData extends Record<string, any>,
    IsList extends boolean,
    TData extends WechatMiniprogram.Component.DataOption,
    TProperty extends WechatMiniprogram.Component.PropertyOption,
    TMethod extends WechatMiniprogram.Component.MethodOption
    > extends React.PureComponent<ComponentProps<IsList, TProperty>, ComponentData<ED, T, FormedData, TData>> {
    abstract features: FD & BasicFeatures<ED, Cxt, FrontCxt, AD & CommonAspectDict<ED, Cxt>>;
    abstract oakOption: OakComponentOption<ED, T, Cxt, FrontCxt, AD, FD, FormedData, IsList, TData, TProperty, TMethod>;

    setDisablePulldownRefresh(able: boolean) {
        this.setState({
            oakDisablePulldownRefresh: able,
        } as any);
    }

    onPathSet() {
        return onPathSet.call(this as any, this.oakOption as any);
    }

    triggerEvent<DetailType = any>(
        name: string,
        detail?: DetailType,
        options?: WechatMiniprogram.Component.TriggerEventOption
    ) {

    }

    sub(type: string, callback: Function) {
        this.features.eventBus.sub(type, callback);
    }

    unsub(type: string, callback: Function) {
        this.features.eventBus.unsub(type, callback);
    }

    pub(type: string, options?: any) {
        this.features.eventBus.pub(type, options);
    }

    unsubAll(type: string) {
        this.features.eventBus.unsubAll(type);
    }

    save(key: string, item: any) {
        this.features.localStorage.save(key, item);
    }

    load(key: string) {
        return this.features.localStorage.load(key);
    }

    clear() {
        this.features.localStorage.clear();
    }

    resolveInput(input: React.BaseSyntheticEvent, keys?: string[]) {
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
    }

    setNotification(data: NotificationProps) {
        this.features.notification.setNotification(data);
    }

    consumeNotification() {
        return this.features.notification.consumeNotification();
    }

    setMessage(data: MessageProps) {
        return this.features.message.setMessage(data);
    }

    consumeMessage() {
        return this.features.message.consumeMessage();
    }

    reRender(extra?: Record<string, any>) {
        return reRender.call(this as any, this.oakOption as any, extra);
    }

    navigateTo<T2 extends keyof ED>(options: { url: string } & OakNavigateToParameters<ED, T2>, state?: Record<string, any>, disableNamespace?: boolean) {
        const { url, ...rest } = options;
        let url2 = url;

        for (const param in rest) {
            const param2 = param as unknown as keyof typeof rest;
            if (rest[param2] !== undefined) {
                url2 += `${url2.includes('?') ? '&' : '?'}${param}=${typeof rest[param2] === 'string'
                    ? rest[param2]
                    : JSON.stringify(rest[param2])
                    }`;
            }
        }
        // 路由传入namespace
        return this.features.navigator.navigateTo(url2, state, disableNamespace);
    }

    navigateBack(option?: { delta?: number }) {
        const { delta } = option || {};
        return new Promise((resolve, reject) => {
            try {
                this.props.navigate(delta || -1);
                resolve(undefined);
            } catch (err) {
                reject(err);
            }
        });
    }

    redirectTo<T2 extends keyof ED>(options: { url: string } & OakNavigateToParameters<ED, T2>, state?: Record<string, any>, disableNamespace?: boolean) {
        const { url, ...rest } = options;
        let url2 = url;

        for (const param in rest) {
            const param2 = param as unknown as keyof typeof rest;
            if (rest[param2] !== undefined) {
                url2 += `${url2.includes('?') ? '&' : '?'}${param}=${typeof rest[param2] === 'string'
                    ? rest[param2]
                    : JSON.stringify(rest[param2])
                    }`;
            }
        }
        return this.features.navigator.redirectTo(url2, state, disableNamespace);
    }

    /* setProps(props: Record<string, any>, usingState?: true) {
        const url = window.location.pathname;
        const search = window.location.search;
        if (usingState) {
            return this.props.navigate(`${url}${search}`, { replace: true, state: props });
        }
        else {
            // 这里nodejs的url用不了，先简单写一个
            let url2: string;
            if (!search) {
                let search = '';
                for (const k in props) {
                    if (search) {
                        search + '&';
                    }
                    if (props[k] !== undefined) {
                        search += `${k}=${typeof props[k] === 'string' ? props[k] : JSON.stringify(props[k])}`;
                    }
                }
                url2 = `${url}?${search}`;
            }
            else {
                assert(search.startsWith('?'));
                const searchParams = search.slice(1).split('&');
                for (const k in props) {
                    const origin = searchParams.find(ele => ele.startsWith(`${k}=`));
                    if (origin) {
                        const idx = searchParams.indexOf(origin);
                        searchParams.splice(idx, 1);
                        searchParams.push(`${k}=${typeof props[k] === 'string' ? props[k] : JSON.stringify(props[k])}`);
                    }
                    else {
                        searchParams.push(`${k}=${typeof props[k] === 'string' ? props[k] : JSON.stringify(props[k])}`);
                    }
                }
                url2 = `${url}?${searchParams.join('&')}`;
            }
            return this.props.navigate(url2, { replace: true });
        }
    } */

    addItem<T extends keyof ED>(data: Omit<ED[T]['CreateSingle']['data'], 'id'>, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>) {
        this.features.runningTree.addItem(this.state.oakFullpath, data, beforeExecute, afterExecute);
    }

    removeItem(id: string, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>) {
        this.features.runningTree.removeItem(this.state.oakFullpath, id, beforeExecute, afterExecute);
    }

    updateItem<T extends keyof ED>(data: ED[T]['Update']['data'], id: string, action?: ED[T]['Action'], beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>) {
        this.features.runningTree.updateItem(this.state.oakFullpath, data, id, action, beforeExecute, afterExecute);
    }

    recoverItem(id: string) {
        this.features.runningTree.recoverItem(this.state.oakFullpath, id);
    }

    /* create<T extends keyof ED>(data: Omit<ED[T]['CreateSingle']['data'], 'id'>, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>) {
        this.features.runningTree.create(this.state.oakFullpath, data, beforeExecute, afterExecute);
    } */

    update<T extends keyof ED>(data: ED[T]['Update']['data'], action?: ED[T]['Action'], beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>) {
        this.features.runningTree.update(this.state.oakFullpath, data, action, beforeExecute, afterExecute);
    }

    remove(beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>) {
        this.features.runningTree.remove(this.state.oakFullpath, beforeExecute, afterExecute);
    }

    clean(path?: string) {
        const path2 = path ? `${this.state.oakFullpath}.${path}` : this.state.oakFullpath;
        this.features.runningTree.clean(path2);
    }

    t(key: string, params?: object) {
        return this.props.t(key, params);
    }

    execute(action?: ED[T]['Action']) {
        return execute.call(this as any, action);
    }

    getFreshValue(path?: string) {
        const path2 = path ? `${this.state.oakFullpath}.${path}` : this.state.oakFullpath;
        return this.features.runningTree.getFreshValue(path2);
    }

    checkOperation(entity: T, action: ED[T]['Action'], filter?: ED[T]['Update']['filter'], checkerTypes?: CheckerType[]) {
        return this.features.cache.checkOperation(entity, action, filter, checkerTypes);
    }

    tryExecute(path?: string) {
        const path2 = path ? `${this.state.oakFullpath}.${path}` : this.state.oakFullpath;
        return this.features.runningTree.tryExecute(path2);
    }

    getOperations<T extends keyof ED>(path?: string) {
        const path2 = path ? `${this.state.oakFullpath}.${path}` : this.state.oakFullpath;
        return this.features.runningTree.getOperations(path2);
    }

    refresh() {
        return refresh.call(this as any);
    }

    loadMore() {
        return loadMore.call(this as any);
    }

    setId(id: string) {
        return this.features.runningTree.setId(this.state.oakFullpath, id);
    }

    unsetId() {
        return this.features.runningTree.unsetId(this.state.oakFullpath);
    }

    getId() {
        return this.features.runningTree.getId(this.state.oakFullpath);
    }

    setFilters(filters: NamedFilterItem<ED, T>[]) {
        this.features.runningTree.setNamedFilters(
            this.state.oakFullpath,
            filters
        );
    }

    getFilters() {
        if (this.state.oakFullpath) {
            const namedFilters = this.features.runningTree.getNamedFilters(
                this.state.oakFullpath
            );
            const filters = namedFilters.map(({ filter }) => {
                if (typeof filter === 'function') {
                    return filter();
                }
                return filter;
            });
            return filters;
        }
    }

    getFilterByName(name: string) {
        if (this.state.oakFullpath) {
            const filter = this.features.runningTree.getNamedFilterByName(
                this.state.oakFullpath,
                name
            );
            if (filter?.filter) {
                if (typeof filter.filter === 'function') {
                    return filter.filter();
                }
                return filter.filter;
            }
        }
    }

    addNamedFilter(namedFilter: NamedFilterItem<ED, T>, refresh?: boolean) {
        this.features.runningTree.addNamedFilter(
            this.state.oakFullpath,
            namedFilter,
            refresh
        );
    }

    removeNamedFilter(namedFilter: NamedFilterItem<ED, T>, refresh?: boolean) {
        this.features.runningTree.removeNamedFilter(
            this.state.oakFullpath,
            namedFilter,
            refresh
        );
    }

    removeNamedFilterByName(name: string, refresh?: boolean) {
        this.features.runningTree.removeNamedFilterByName(
            this.state.oakFullpath,
            name,
            refresh
        );
    }

    setNamedSorters(namedSorters: NamedSorterItem<ED, T>[]) {
        this.features.runningTree.setNamedSorters(
            this.state.oakFullpath,
            namedSorters
        );
    }

    getSorters() {
        if (this.state.oakFullpath) {
            const namedSorters = this.features.runningTree.getNamedSorters(
                this.state.oakFullpath
            );
            const sorters = namedSorters.map(({ sorter }) => {
                if (typeof sorter === 'function') {
                    return sorter();
                }
                return sorter;
            }).filter((ele) => !!ele) as DeduceSorterItem<ED[T]['Schema']>[];
            return sorters;
        }
    }

    getSorterByName(name: string) {
        if (this.state.oakFullpath) {
            const sorter = this.features.runningTree.getNamedSorterByName(
                this.state.oakFullpath,
                name
            );
            if (sorter?.sorter) {
                if (typeof sorter.sorter === 'function') {
                    return sorter.sorter();
                }
                return sorter.sorter;
            }
        }
    }

    addNamedSorter(namedSorter: NamedSorterItem<ED, T>, refresh?: boolean) {
        this.features.runningTree.addNamedSorter(
            this.state.oakFullpath,
            namedSorter,
            refresh
        );
    }

    removeNamedSorter(namedSorter: NamedSorterItem<ED, T>, refresh?: boolean) {
        this.features.runningTree.removeNamedSorter(
            this.state.oakFullpath,
            namedSorter,
            refresh
        );
    }

    removeNamedSorterByName(name: string, refresh?: boolean) {
        this.features.runningTree.removeNamedSorterByName(
            this.state.oakFullpath,
            name,
            refresh
        );
    }

    getPagination() {
        if (this.state.oakFullpath) {
            return this.features.runningTree.getPagination(this.state.oakFullpath);
        }
    }

    setPageSize(pageSize: number) {
        this.features.runningTree.setPageSize(
            this.state.oakFullpath,
            pageSize
        );
    }

    setCurrentPage(currentPage: number) {
        assert(currentPage !== 0);

        if (this.state.oakEntity && this.state.oakFullpath) {
            this.features.runningTree.setCurrentPage(
                this.state.oakFullpath,
                currentPage
            );
        }
    }
}

function translateObservers(observers?: Record<string, (...args: any[]) => any>): { fn: React.Component['componentDidUpdate'] } & ThisType<React.Component> {
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

                const args = [] as any[];
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

const DEFAULT_REACH_BOTTOM_DISTANCE = 50;

export function createComponent<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends AsyncContext<ED>,
    FrontCxt extends SyncContext<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature>,
    FormedData extends Record<string, any>,
    IsList extends boolean,
    TData extends Record<string, any> = {},
    TProperty extends WechatMiniprogram.Component.PropertyOption = {},
    TMethod extends Record<string, Function> = {}
>(
    option: OakComponentOption<
        ED,
        T,
        Cxt,
        FrontCxt,
        AD,
        FD,
        FormedData,
        IsList,
        TData,
        TProperty,
        TMethod
    >,
    features: BasicFeatures<ED, Cxt, FrontCxt, AD & CommonAspectDict<ED, Cxt>> & FD,
) {
    const {
        data, methods, lifetimes, observers, getRender, path
    } = option as OakComponentOption<
        ED,
        T,
        Cxt,
        FrontCxt,
        AD,
        FD,
        FormedData,
        IsList,
        TData,
        TProperty,
        TMethod
    > & {
        getRender: () => React.ComponentType<any>;
    };


    const { fn } = translateObservers(observers);
    class OakComponentWrapper extends OakComponentBase<ED, T, Cxt, FrontCxt, AD, FD, FormedData, IsList, TData, TProperty, TMethod> {
        features = features;
        oakOption = option;
        isReachBottom = false;
        subscribed: Array<() => void> = [];
        methodProps: Record<string, Function>;

        constructor(props: ComponentProps<IsList, TProperty>) {
            super(props);
            const methodProps: Record<WebComponentCommonMethodNames, Function> = {
                setDisablePulldownRefresh: (able: boolean) => this.setDisablePulldownRefresh(able),
                t: (key: string, params?: object) => this.t(key, params),
                execute: (action?: ED[T]['Action']) => {
                    return this.execute(action);
                },
                refresh: () => {
                    return this.refresh();
                },
                setNotification: (data: NotificationProps) => {
                    return this.setNotification(data);
                },
                setMessage: (data: MessageProps) => {
                    return this.setMessage(data);
                },
                navigateTo: <T2 extends keyof ED>(
                    options: { url: string } & OakNavigateToParameters<ED, T2>,
                    state?: Record<string, any>,
                    disableNamespace?: boolean
                ) => {
                    return this.navigateTo(options, state, disableNamespace);
                },
                navigateBack: (options?: { delta: number }) => {
                    return this.navigateBack(options);
                },
                redirectTo: <T2 extends keyof ED>(
                    options: Parameters<typeof wx.redirectTo>[0] &
                        OakNavigateToParameters<ED, T2>,
                    state?: Record<string, any>,
                    disableNamespace?: boolean
                ) => {
                    return this.redirectTo(options, state, disableNamespace);
                },
                clean: (path?: string) => {
                    return this.clean(path);
                }
            };
            if (option.isList) {
                Object.assign(methodProps, {
                    addItem: (data: Omit<ED[T]['CreateSingle']['data'], 'id'>, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>) => {
                        return this.addItem(data, beforeExecute, afterExecute);
                    },
                    removeItem: (id: string, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>) => {
                        return this.removeItem(id, beforeExecute, afterExecute);
                    },
                    updateItem: (data: ED[T]['Update']['data'], id: string, action?: ED[T]['Action'], beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>) => {
                        return this.updateItem(data, id, action, beforeExecute, afterExecute);
                    },
                    setFilters: (filters: NamedFilterItem<ED, T>[]) => {
                        return this.setFilters(filters);
                    },
                    addNamedFilter: (filter: NamedFilterItem<ED, T>, refresh?: boolean) => {
                        return this.addNamedFilter(filter, refresh);
                    },
                    removeNamedFilter: (
                        filter: NamedFilterItem<ED, T>,
                        refresh?: boolean
                    ) => {
                        return this.removeNamedFilter(filter, refresh);
                    },
                    removeNamedFilterByName: (name: string, refresh?: boolean) => {
                        return this.removeNamedFilterByName(name, refresh);
                    },
                    setNamedSorters: (sorters: NamedSorterItem<ED, T>[]) => {
                        return this.setNamedSorters(sorters);
                    },
                    addNamedSorter: (sorter: NamedSorterItem<ED, T>, refresh?: boolean) => {
                        return this.addNamedSorter(sorter, refresh);
                    },
                    removeNamedSorter: (
                        sorter: NamedSorterItem<ED, T>,
                        refresh?: boolean
                    ) => {
                        return this.removeNamedSorter(sorter, refresh);
                    },
                    removeNamedSorterByName: (name: string, refresh?: boolean) => {
                        return this.removeNamedSorterByName(name, refresh);
                    },
                    setPageSize: (pageSize: number) => {
                        return this.setPageSize(pageSize);
                    },
                    setCurrentPage: (current: number) => {
                        return this.setCurrentPage(current);
                    },
                    loadMore: () => {
                        return this.loadMore();
                    }
                } as Record<WebComponentListMethodNames, Function>);
            }
            else {
                Object.assign(methodProps, {
                    /* create: (data: Omit<ED[T]['CreateSingle']['data'], 'id'>, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>) => {
                        return this.create(data, beforeExecute, afterExecute);
                    }, */
                    update: (data: ED[T]['Update']['data'], action: ED[T]['Action'], beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>) => {
                        return this.update(data, action, beforeExecute, afterExecute);
                    },
                    remove: (beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>) => {
                        return this.remove(beforeExecute, afterExecute);
                    },
                } as Record<WebComponentSingleMethodNames, Function>);
            }

            if (methods) {
                for (const m in methods) {
                    Object.assign(this, {
                        [m]: (...args: any) => methods[m].call(this, ...args),
                    });
                    Object.assign(methodProps, {
                        [m]: (...args: any) => methods[m].call(this, ...args),
                    });
                }
            }
            this.state = Object.assign({}, data, {
                oakLoading: false,
                oakLoadingMore: false,
                oakPullDownRefreshLoading: false,
                oakExecuting: false,
                oakDirty: false,
            }) as any;
            this.methodProps = methodProps;

            lifetimes?.created && lifetimes.created.call(this);
        }

        // todo 这里还需要根据path和location来判断自己是不是page
        private iAmThePage() {
            return this.props.routeMatch;
        }

        private supportPullDownRefresh() {
            const { oakDisablePulldownRefresh = false } = this.props;
            const { oakDisablePulldownRefresh: disable2 } = this.state;
            return this.props.width === 'xs' && this.iAmThePage() && !oakDisablePulldownRefresh && !disable2;
        }

        private scrollEvent = () => {
            this.checkReachBottom();
        };

        private registerPageScroll() {
            window.addEventListener('scroll', this.scrollEvent);
        }

        private unregisterPageScroll() {
            window.removeEventListener('scroll', this.scrollEvent);
        }

        private checkReachBottom() {
            if (!this.supportPullDownRefresh()) {
                return;
            }
            const isCurrentReachBottom =
                document.body.scrollHeight -
                (window.innerHeight + window.scrollY) <=
                DEFAULT_REACH_BOTTOM_DISTANCE;

            if (!this.isReachBottom && isCurrentReachBottom && option.isList) {
                this.isReachBottom = true;
                // 执行触底事件
                this.loadMore();
                return;
            }

            this.isReachBottom = isCurrentReachBottom;
        }

        componentDidMount() {
            this.registerPageScroll();
            if (option.entity) {
                this.subscribed.push(
                    features.cache.subscribe(() => this.reRender())
                );
            }
            lifetimes?.attached && lifetimes.attached.call(this);
            const { oakPath } = this.props;
            if (oakPath || this.iAmThePage() && path) {
                this.onPathSet();
                lifetimes?.ready && lifetimes.ready.call(this);
                lifetimes?.show && lifetimes.show.call(this);
            }
            else {
                if (!option.entity) {
                    lifetimes?.ready && lifetimes.ready.call(this);
                    lifetimes?.show && lifetimes.show.call(this);
                }
                this.reRender();
            }

        }

        componentWillUnmount() {
            this.subscribed.forEach(
                ele => ele()
            );
            this.unregisterPageScroll();
            this.state.oakFullpath && (this.iAmThePage() || this.props.oakAutoUnmount) && destroyNode.call(this as any);
            lifetimes?.detached && lifetimes.detached.call(this);
        }

        componentDidUpdate(prevProps: Record<string, any>, prevState: Record<string, any>) {
            if (prevProps.oakPath !== this.props.oakPath) {
                assert(this.props.oakPath);
                this.onPathSet();
                lifetimes?.ready && lifetimes.ready.call(this);
                // lifetimes?.show && lifetimes.show.call(this);
            }
            if (this.props.oakId !== prevProps.oakId) {
                this.setId(this.props.oakId);
            }
            // todo 这里似乎还可能对oakProjection这些东西加以更新，等遇到再添加 by Xc

            fn && fn.call(this, prevProps, prevState);
        }

        render(): React.ReactNode {
            const { oakPullDownRefreshLoading } = this.state;
            const Render = getRender.call(this);

            if (this.supportPullDownRefresh()) {
                const Child = React.cloneElement(
                    <PullToRefresh
                        onRefresh={async () => {
                            (this as any).pullDownRefresh = true;
                            await this.refresh();
                            (this as any).pullDownRefresh = true;
                        }}
                        refreshing={oakPullDownRefreshLoading}
                        distanceToRefresh={DEFAULT_REACH_BOTTOM_DISTANCE}
                        indicator={{
                            activate: this.t('common:ptrActivate'),
                            deactivate: this.t('common:ptrDeactivate'),
                            release: this.t('common:ptrRelease'),
                            finish: this.t('common:ptrFinish'),
                        }}
                    />,
                    {
                        getScrollContainer: () => document.body,
                    },
                    <Render methods={this.methodProps} data={{
                        ...this.state,
                        ...this.props,
                    }} />
                );
                return Child;
            }
            return <Render methods={this.methodProps} data={{
                ...this.state,
                ...this.props,
            }} />;
        }
    };
    return withRouter(OakComponentWrapper, option);
}