/// <reference path="../node_modules/@types/wechat-miniprogram/index.d.ts" />
import assert from 'assert';
import React from 'react';
import { withRouter, PullToRefresh } from './platforms/web';
import { get } from 'oak-domain/lib/utils/lodash';
import { CommonAspectDict } from 'oak-common-aspect';
import { Aspect, CheckerType, Context, DeduceSorterItem, EntityDict } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { BasicFeatures } from './features';
import { ExceptionHandler } from './types/ExceptionRoute';
import { NamedFilterItem, NamedSorterItem } from './types/NamedCondition';
import { Feature } from './types/Feature';
import {
    ComponentData,
    ComponentProps,
    OakComponentOption,
    OakNavigateToParameters,
} from './types/Page';

import {
    subscribe, unsubscribe, onPathSet, reRender, refresh,
    loadMore, execute, callPicker, setUpdateData, setMultiAttrUpdateData
} from './page.common';
import { MessageProps } from './types/Message';
import { NotificationProps } from './types/Notification';

abstract class OakComponentBase<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>,
    Proj extends ED[T]['Selection']['data'],
    FormedData extends Record<string, any>,
    IsList extends boolean,
    TData extends WechatMiniprogram.Component.DataOption,
    TProperty extends WechatMiniprogram.Component.PropertyOption,
    TMethod extends WechatMiniprogram.Component.MethodOption
    > extends React.PureComponent<ComponentProps<IsList, TProperty>, ComponentData<ED, T, FormedData, TData>> {
    abstract features: FD & BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>;
    abstract option: OakComponentOption<ED, T, Cxt, AD, FD, Proj, FormedData, IsList, TData, TProperty, TMethod>;

    subscribe() {
        subscribe.call(this as any);
    }

    unsubscribe() {
        unsubscribe.call(this as any);
    }

    onPathSet() {
        return onPathSet.call(this as any, this.option as any);
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
        this.features.message.setMessage(data);
    }

    consumeMessage() {
        return this.features.message.consumeMessage();
    }

    reRender(extra?: Record<string, any>) {
        return reRender.call(this as any, this.option as any, extra);
    }

    navigateTo(options: { url: string } & OakNavigateToParameters<ED, T>, state?: Record<string, any>, disableNamespace?: boolean) {
        const { url, ...rest } = options;
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
                url2 += `${url2.includes('?') ? '&' : '?'}${param}=${typeof rest[param2] === 'string'
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
    }

    navigateBack(option: { delta?: number }) {
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

    redirectTo(options: { url: string } & OakNavigateToParameters<ED, T>, state?: Record<string, any>, disableNamespace?: boolean) {
        const { url, ...rest } = options;
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
                url2 += `${url2.includes('?') ? '&' : '?'}${param}=${typeof rest[param2] === 'string'
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
    }

    setProps(props: Record<string, any>, usingState?: true) {
        const url = window.location.pathname;
        if (usingState) {
            return this.props.navigate(url, { replace: true, state: props });
        }
        else {
            // 这里nodejs的url用不了，先简单写一个
            let url2: string;
            const search = window.location.search;
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
    }

    addOperation(operation: Omit<ED[T]['Operation'], 'id'>, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>) {
        return this.features.runningTree.addOperation(this.state.oakFullpath, operation, beforeExecute, afterExecute);
    }

    cleanOperation() {
        return this.features.runningTree.clean(this.state.oakFullpath);
    }

    t(key: string, params?: object) {
        return this.props.t(key, params);
    }

    callPicker(attr: string, params: Record<string, any> = {}) {
        return callPicker.call(this as any, attr, params);
    }

    execute(operation?: ED[T]['Operation']) {
        return execute.call(this as any, operation);
    }

    getFreshValue(path?: string) {
        const path2 = path? `${this.state.oakFullpath}.${path}` : this.state.oakFullpath;
        return this.features.runningTree.getFreshValue(path2) as Promise<ED[keyof ED]['Schema'][] | ED[keyof ED]['Schema'] | undefined>;
    }

    checkOperation(entity: T, action: ED[T]['Action'], filter?: ED[T]['Update']['filter'], checkerTypes?: CheckerType[]) {
        return this.features.cache.checkOperation(entity, action, filter, checkerTypes);
    }

    tryExecute(path?: string) {
        const path2 = path ? `${this.state.oakFullpath}.${path}` : this.state.oakFullpath;
        return this.features.runningTree.tryExecute(path2);
    }

    refresh() {
        return refresh.call(this as any);
    }

    setUpdateData(attr: string, data: any) {
        return setUpdateData.call(this as any, attr, data);
    }

    setMultiAttrUpdateData(data: Record<string, any>) {
        return setMultiAttrUpdateData.call(this as any, data);
    }

    loadMore() {
        return loadMore.call(this as any);
    }

    protected setId(id: string) {
        return this.features.runningTree.setId(this.state.oakFullpath, id);
    }

    async setFilters(filters: NamedFilterItem<ED, T>[]) {
        await this.features.runningTree.setNamedFilters(
            this.state.oakFullpath,
            filters
        );
    }

    async getFilters() {
        if (this.state.oakFullpath) {
            const namedFilters = this.features.runningTree.getNamedFilters(
                this.state.oakFullpath
            );
            const filters = await Promise.all(
                namedFilters.map(({ filter }) => {
                    if (typeof filter === 'function') {
                        return filter();
                    }
                    return filter;
                })
            );
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

    async addNamedFilter(namedFilter: NamedFilterItem<ED, T>, refresh?: boolean) {
        await this.features.runningTree.addNamedFilter(
            this.state.oakFullpath,
            namedFilter,
            refresh
        );
    }

    async removeNamedFilter(namedFilter: NamedFilterItem<ED, T>, refresh?: boolean) {
        await this.features.runningTree.removeNamedFilter(
            this.state.oakFullpath,
            namedFilter,
            refresh
        );
    }

    async removeNamedFilterByName(name: string, refresh?: boolean) {
        await this.features.runningTree.removeNamedFilterByName(
            this.state.oakFullpath,
            name,
            refresh
        );
    }

    async setNamedSorters(namedSorters: NamedSorterItem<ED, T>[]) {
        await this.features.runningTree.setNamedSorters(
            this.state.oakFullpath,
            namedSorters
        );
    }

    async getSorters() {
        if (this.state.oakFullpath) {
            const namedSorters = this.features.runningTree.getNamedSorters(
                this.state.oakFullpath
            );
            const sorters = (
                await Promise.all(
                    namedSorters.map(({ sorter }) => {
                        if (typeof sorter === 'function') {
                            return sorter();
                        }
                        return sorter;
                    })
                )
            ).filter((ele) => !!ele) as DeduceSorterItem<ED[T]['Schema']>[];
            return sorters;
        }
    }

    async getSorterByName(name: string) {
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

    async addNamedSorter(namedSorter: NamedSorterItem<ED, T>, refresh?: boolean) {
        await this.features.runningTree.addNamedSorter(
            this.state.oakFullpath,
            namedSorter,
            refresh
        );
    }

    async removeNamedSorter(namedSorter: NamedSorterItem<ED, T>, refresh?: boolean) {
        await this.features.runningTree.removeNamedSorter(
            this.state.oakFullpath,
            namedSorter,
            refresh
        );
    }

    async removeNamedSorterByName(name: string, refresh?: boolean) {
        await this.features.runningTree.removeNamedSorterByName(
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
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>,
    Proj extends ED[T]['Selection']['data'],
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
) {
    const {
        data, projection, properties, entity, methods, lifetimes, observers, render, path
    } = option as OakComponentOption<
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
        render: () => React.ReactNode;
    };


    const { fn } = translateObservers(observers);
    class OakComponentWrapper extends OakComponentBase<ED, T, Cxt, AD, FD, Proj, FormedData, IsList, TData, TProperty, TMethod> {
        features = features;
        option = option;
        isReachBottom = false;

        constructor(props: ComponentProps<IsList, TProperty>) {
            super(props);
            if (methods) {
                for (const m in methods) {
                    Object.assign(this, {
                        [m]: methods[m as keyof typeof methods]!.bind(this),
                    });
                }
            }
            this.state = Object.assign({}, data, {
                oakLoading: false,
                oakLoadingMore: false,
                oakPullDownRefreshLoading: false,
                oakIsReady: false,
                oakExecuting: false,
                oakDirty: false,
            }) as any;

            lifetimes?.created && lifetimes.created.call(this);
        }

        // todo 这里还需要根据path和location来判断自己是不是page
        private iAmThePage() {
            return this.props.routeMatch;
        }


        private supportPullDownRefresh() {
            return this.props.width === 'xs' && this.iAmThePage();
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

        async componentDidMount() {
            this.registerPageScroll();
            this.subscribe();
            const { oakPath } = this.props;
            if (oakPath || this.iAmThePage() && path) {
                await this.onPathSet();
            }
            else {
                this.reRender();
            }

            lifetimes?.attached && lifetimes.attached.call(this);
            lifetimes?.ready && lifetimes.ready.call(this);
            lifetimes?.show && lifetimes.show.call(this);
        }

        componentWillUnmount() {
            this.state.oakFullpath && (this.iAmThePage() || this.props.oakAutoUnmount) && this.features.runningTree.destroyNode(this.state.oakFullpath);
            lifetimes?.detached && lifetimes.detached.call(this);
            this.unsubscribe();
            this.unregisterPageScroll();
        }

        async componentDidUpdate(prevProps: Record<string, any>, prevState: Record<string, any>) {
            if (!prevProps.oakPath && this.props.oakPath) {
                await this.onPathSet();
            }
            if (this.props.oakId !== prevProps.oakId) {
                await this.setId(this.props.oakId);
            }
            // todo 这里似乎还可能对oakProjection这些东西加以更新，等遇到再添加 by Xc

            fn && fn.call(this, prevProps, prevState);
        }

        render(): React.ReactNode {
            const Render = render.call(this);
            const { oakPullDownRefreshLoading } = this.state;
            const { enablePullDownRefresh = false } = this.props;

            if (this.supportPullDownRefresh() && enablePullDownRefresh) {
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
                    Render
                );
                return Child;
            }
            return Render;
        }
    };
    return withRouter(OakComponentWrapper, option);
}