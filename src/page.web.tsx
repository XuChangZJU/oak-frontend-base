/// <reference path="../node_modules/@types/wechat-miniprogram/index.d.ts" />
import assert from 'assert';
import React from 'react';
import { withRouter, PullToRefresh } from './platforms/web';
import { get } from 'oak-domain/lib/utils/lodash';
import { CommonAspectDict } from 'oak-common-aspect';
import { Action, Aspect, CheckerType, EntityDict } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { BasicFeatures } from './features';
import { NamedFilterItem, NamedSorterItem } from './types/NamedCondition';
import { Feature } from './types/Feature';
import {
    DataOption,
    MethodOption,
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
    TData extends DataOption,
    TProperty extends DataOption,
    TMethod extends MethodOption
    > extends React.PureComponent<
    ComponentProps<ED, T, IsList, TProperty>,
    ComponentData<ED, T, FormedData, TData>
    > {
    abstract features: FD &
        BasicFeatures<ED, Cxt, FrontCxt, AD & CommonAspectDict<ED, Cxt>>;
    abstract oakOption: OakComponentOption<
        IsList,
        ED,
        T,
        Cxt,
        FrontCxt,
        AD,
        FD,
        FormedData,
        TData,
        TProperty,
        TMethod
    >;

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
    ) { }

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

    navigateTo<T2 extends keyof ED>(
        options: { url: string } & OakNavigateToParameters<ED, T2>,
        state?: Record<string, any>,
        disableNamespace?: boolean
    ) {
        // 路由传入namespace
        return this.features.navigator.navigateTo(
            options,
            state,
            disableNamespace
        );
    }

    navigateBack(delta?: number) {
        return this.features.navigator.navigateBack(delta);
    }

    redirectTo<T2 extends keyof ED>(
        options: { url: string } & OakNavigateToParameters<ED, T2>,
        state?: Record<string, any>,
        disableNamespace?: boolean
    ) {
        return this.features.navigator.redirectTo(
            options,
            state,
            disableNamespace
        );
    }

    switchTab<T2 extends keyof ED>(
        options: { url: string } & OakNavigateToParameters<ED, T2>,
        state?: Record<string, any>,
        disableNamespace?: boolean
    ) {
        return this.features.navigator.switchTab(
            options,
            state,
            disableNamespace
        );
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

    addItem<T extends keyof ED>(
        data: Omit<ED[T]['CreateSingle']['data'], 'id'>,
        beforeExecute?: () => Promise<void>,
        afterExecute?: () => Promise<void>,
        path?: string
    ) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.addItem(
            this.state.oakFullpath,
            data,
            beforeExecute,
            afterExecute
        );
    }

    removeItem(
        id: string,
        beforeExecute?: () => Promise<void>,
        afterExecute?: () => Promise<void>,
        path?: string
    ) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.removeItem(
            path2,
            id,
            beforeExecute,
            afterExecute
        );
    }

    updateItem<T extends keyof ED>(
        data: ED[T]['Update']['data'],
        id: string,
        action?: ED[T]['Action'],
        beforeExecute?: () => Promise<void>,
        afterExecute?: () => Promise<void>,
        path?: string
    ) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.updateItem(
            path2,
            data,
            id,
            action,
            beforeExecute,
            afterExecute
        );
    }

    recoverItem(id: string, path?: string) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.recoverItem(path2, id);
    }

    resetItem(id: string, path?: string) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.resetItem(path2, id);
    }

    /* create<T extends keyof ED>(data: Omit<ED[T]['CreateSingle']['data'], 'id'>, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>) {
        this.features.runningTree.create(this.state.oakFullpath, data, beforeExecute, afterExecute);
    } */

    update<T extends keyof ED>(
        data: ED[T]['Update']['data'],
        action?: ED[T]['Action'],
        beforeExecute?: () => Promise<void>,
        afterExecute?: () => Promise<void>,
        path?: string
    ) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.update(
            path2,
            data,
            action,
            beforeExecute,
            afterExecute
        );
    }

    create<T extends keyof ED>(
        data: Omit<ED[T]['CreateSingle']['data'], 'id'>,
        beforeExecute?: () => Promise<void>,
        afterExecute?: () => Promise<void>,
        path?: string
    ) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.create(
            path2,
            data,
            beforeExecute,
            afterExecute
        );
    }

    remove(
        beforeExecute?: () => Promise<void>,
        afterExecute?: () => Promise<void>,
        path?: string
    ) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.remove(path2, beforeExecute, afterExecute);
    }

    isCreation(path?: string) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        return this.features.runningTree.isCreation(path2);
    }

    clean(path?: string) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.clean(path2);
    }

    t(key: string, params?: object) {
        return this.features.locales.t(key, params);
    }

    execute(action?: ED[T]['Action'], messageProps?: boolean | MessageProps, path?: string) {
        return execute.call(this as any, action, path, messageProps);
    }

    isDirty(path?: string) {
        return this.features.runningTree.isDirty(path || this.state.oakFullpath);
    }

    getFreshValue(path?: string) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        return this.features.runningTree.getFreshValue(path2);
    }

    checkOperation(
        entity: T,
        action: ED[T]['Action'],
        data?: ED[T]['Update']['data'],
        filter?: ED[T]['Update']['filter'],
        checkerTypes?: CheckerType[]
    ) {
        if (checkerTypes?.includes('relation')) {
            return this.features.relationAuth.checkRelation(
                entity,
                {
                    action,
                    data,
                    filter,
                } as Omit<ED[keyof ED]['Operation'], 'id'>
            ) && this.features.cache.checkOperation(
                entity,
                action,
                data,
                filter,
                checkerTypes
            )
        }
        return this.features.cache.checkOperation(
            entity,
            action,
            data,
            filter,
            checkerTypes
        );
    }

    tryExecute(path?: string) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        return this.features.runningTree.tryExecute(path2);
    }

    getOperations<T extends keyof ED>(path?: string) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
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

    getId(path?: string) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        return this.features.runningTree.getId(path2);
    }

    setFilters(filters: NamedFilterItem<ED, T>[], path?: string) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.setNamedFilters(path2, filters);
    }

    setNamedFilters(filters: NamedFilterItem<ED, T>[], refresh?: boolean, path?: string) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.setNamedFilters(path2, filters, refresh);
    }

    getFilters(path?: string) {
        if (this.state.oakFullpath) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            const namedFilters =
                this.features.runningTree.getNamedFilters(path2);
            const filters = namedFilters.map(({ filter }) => {
                if (typeof filter === 'function') {
                    return (filter as Function)();
                }
                return filter;
            });
            return filters;
        }
    }

    getFilterByName(name: string, path?: string) {
        if (this.state.oakFullpath) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            const filter = this.features.runningTree.getNamedFilterByName(
                path2,
                name
            );
            if (filter?.filter) {
                if (typeof filter.filter === 'function') {
                    return (filter.filter as Function)();
                }
                return filter.filter;
            }
        }
    }

    addNamedFilter(
        namedFilter: NamedFilterItem<ED, T>,
        refresh?: boolean,
        path?: string
    ) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.addNamedFilter(path2, namedFilter, refresh);
    }

    removeNamedFilter(
        namedFilter: NamedFilterItem<ED, T>,
        refresh?: boolean,
        path?: string
    ) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.removeNamedFilter(
            path2,
            namedFilter,
            refresh
        );
    }

    removeNamedFilterByName(name: string, refresh?: boolean, path?: string) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.removeNamedFilterByName(path2, name, refresh);
    }

    setNamedSorters(namedSorters: NamedSorterItem<ED, T>[], refresh?: boolean, path?: string) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.setNamedSorters(path2, namedSorters, refresh);
    }

    getSorters(path?: string) {
        if (this.state.oakFullpath) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            const namedSorters =
                this.features.runningTree.getNamedSorters(path2);
            const sorters = namedSorters
                .map(({ sorter }) => {
                    if (typeof sorter === 'function') {
                        return (sorter as Function)();
                    }
                    return sorter;
                })
                .filter((ele) => !!ele) as ED[T]['Selection']['sorter'][];
            return sorters;
        }
    }

    getSorterByName(name: string, path?: string) {
        if (this.state.oakFullpath) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            const sorter = this.features.runningTree.getNamedSorterByName(
                path2,
                name
            );
            if (sorter?.sorter) {
                if (typeof sorter.sorter === 'function') {
                    return (sorter.sorter as Function)();
                }
                return sorter.sorter;
            }
        }
    }

    addNamedSorter(
        namedSorter: NamedSorterItem<ED, T>,
        refresh?: boolean,
        path?: string
    ) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.addNamedSorter(path2, namedSorter, refresh);
    }

    removeNamedSorter(
        namedSorter: NamedSorterItem<ED, T>,
        refresh?: boolean,
        path?: string
    ) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.removeNamedSorter(
            path2,
            namedSorter,
            refresh
        );
    }

    removeNamedSorterByName(name: string, refresh?: boolean, path?: string) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.removeNamedSorterByName(path2, name, refresh);
    }

    getPagination(path?: string) {
        if (this.state.oakFullpath) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            return this.features.runningTree.getPagination(path2);
        }
    }

    setPageSize(pageSize: number, path?: string) {
        if (this.state.oakFullpath) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            this.features.runningTree.setPageSize(path2, pageSize);
        }
    }

    setCurrentPage(currentPage: number, path?: string) {
        assert(currentPage !== 0);

        if (this.state.oakEntity && this.state.oakFullpath) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            this.features.runningTree.setCurrentPage(path2, currentPage);
        }
    }
}

function translateListeners(listeners?: Record<string, (prev: Record<string, any>, next: Record<string, any>) => void>): { fn: React.Component['componentDidUpdate'] } & ThisType<React.Component> {
    return {
        fn(prevProps, prevState) {
            const { state, props } = this;
            for (const obs in listeners) {
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

                const prev = {} as Record<string, any>;
                const next = {} as Record<string, any>;
                if (changed) {
                    for (const k of keys) {
                        next[k] = get(props, k) === undefined
                            ? get(state, k)
                            : get(props, k)
                        prev[k] = get(prevProps, k) === undefined
                            ? get(prevState, k)
                            : get(prevProps, k);

                    }
                    listeners && listeners[obs] && listeners[obs].call(this, prev, next);
                }
            }
        },
    };
}

const DEFAULT_REACH_BOTTOM_DISTANCE = 50;

export function createComponent<
    IsList extends boolean,
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends AsyncContext<ED>,
    FrontCxt extends SyncContext<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature>,
    FormedData extends Record<string, any>,
    TData extends Record<string, any> = {},
    TProperty extends DataOption = {},
    TMethod extends Record<string, Function> = {}
>(
    option: OakComponentOption<
        IsList,
        ED,
        T,
        Cxt,
        FrontCxt,
        AD,
        FD,
        FormedData,
        TData,
        TProperty,
        TMethod
    >,
    features: BasicFeatures<ED, Cxt, FrontCxt, AD & CommonAspectDict<ED, Cxt>> & FD,
) {
    const {
        data, methods, lifetimes, getRender, path, listeners
    } = option as OakComponentOption<
        IsList,
        ED,
        T,
        Cxt,
        FrontCxt,
        AD,
        FD,
        FormedData,
        TData,
        TProperty,
        TMethod
    > & {
        getRender: () => React.ComponentType<any>;
    };

    const { fn } = translateListeners(listeners);
    class OakComponentWrapper extends OakComponentBase<ED, T, Cxt, FrontCxt, AD, FD, FormedData, IsList, TData, TProperty, TMethod> {
        features = features;
        oakOption = option;
        isReachBottom = false;
        subscribed: Array<() => void> = [];
        methodProps: Record<string, Function>;
        defaultProperties: Record<string, any>;

        constructor(props: ComponentProps<ED, T, IsList, TProperty>) {
            super(props);
            const methodProps: Record<WebComponentCommonMethodNames, Function> =
            {
                setDisablePulldownRefresh: (able: boolean) =>
                    this.setDisablePulldownRefresh(able),
                t: (key: string, params?: object) => this.t(key, params),
                execute: (
                    action?: ED[T]['Action'],
                    messageProps?: boolean | MessageProps,
                    path?: string
                ) => {
                    return this.execute(action, messageProps, path);
                },
                isDirty: (path?: string) => this.isDirty(path),
                aggregate: (aggregation: ED[T]['Aggregation']) => {
                    return this.features.cache.aggregate(this.state.oakEntity, aggregation);
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
                    options: { url: string } & OakNavigateToParameters<
                        ED,
                        T2
                    >,
                    state?: Record<string, any>,
                    disableNamespace?: boolean
                ) => {
                    return this.navigateTo(
                        options,
                        state,
                        disableNamespace
                    );
                },
                navigateBack: (delta?: number) => {
                    return this.navigateBack(delta);
                },
                redirectTo: <T2 extends keyof ED>(
                    options: Parameters<typeof wx.redirectTo>[0] &
                        OakNavigateToParameters<ED, T2>,
                    state?: Record<string, any>,
                    disableNamespace?: boolean
                ) => {
                    return this.redirectTo(
                        options,
                        state,
                        disableNamespace
                    );
                },
                clean: (path?: string) => {
                    return this.clean(path);
                },
                checkOperation: (entity: T, action: ED[T]['Action'], data?: ED[T]['Update']['data'], filter?: ED[T]['Update']['filter'], checkerTypes?: CheckerType[]) => {
                    return this.checkOperation(entity, action, data, filter, checkerTypes);
                }
            };
            Object.assign(methodProps, {
                addItem: (data: Omit<ED[T]['CreateSingle']['data'], 'id'>, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>, path?: string) => {
                    return this.addItem(data, beforeExecute, afterExecute, path);
                },
                removeItem: (id: string, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>, path?: string) => {
                    return this.removeItem(id, beforeExecute, afterExecute, path);
                },
                updateItem: (data: ED[T]['Update']['data'], id: string, action?: ED[T]['Action'], beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>, path?: string) => {
                    return this.updateItem(data, id, action, beforeExecute, afterExecute, path);
                },
                setFilters: (filters: NamedFilterItem<ED, T>[], path?: string) => {
                    return this.setFilters(filters, path);
                },
                setNamedFilters: (filters: NamedFilterItem<ED, T>[], refresh?: boolean, path?: string) => {
                    return this.setNamedFilters(filters, refresh, path);
                },
                addNamedFilter: (filter: NamedFilterItem<ED, T>, refresh?: boolean, path?: string) => {
                    return this.addNamedFilter(filter, refresh, path);
                },
                removeNamedFilter: (filter: NamedFilterItem<ED, T>, refresh?: boolean, path?: string) => {
                    return this.removeNamedFilter(filter, refresh, path);
                },
                removeNamedFilterByName: (name: string, refresh?: boolean, path?: string) => {
                    return this.removeNamedFilterByName(name, refresh, path);
                },
                setNamedSorters: (sorters: NamedSorterItem<ED, T>[], refresh?: boolean, path?: string) => {
                    return this.setNamedSorters(sorters, refresh, path);
                },
                addNamedSorter: (sorter: NamedSorterItem<ED, T>, refresh?: boolean, path?: string) => {
                    return this.addNamedSorter(sorter, refresh, path);
                },
                removeNamedSorter: (sorter: NamedSorterItem<ED, T>, refresh?: boolean, path?: string) => {
                    return this.removeNamedSorter(sorter, refresh, path);
                },
                removeNamedSorterByName: (name: string, refresh?: boolean, path?: string) => {
                    return this.removeNamedSorterByName(name, refresh, path);
                },
                setPageSize: (pageSize: number, path?: string) => {
                    return this.setPageSize(pageSize, path);
                },
                setCurrentPage: (current: number, path?: string) => {
                    return this.setCurrentPage(current, path);
                },
                loadMore: () => {
                    return this.loadMore();
                },
                recoverItem: (id: string, path?: string) => {
                    return this.recoverItem(id, path);
                },
                resetItem: (id: string, path?: string) => {
                    return this.resetItem(id, path);
                }
            } as Record<WebComponentListMethodNames, Function>);

            Object.assign(methodProps, {
                /* create: (data: Omit<ED[T]['CreateSingle']['data'], 'id'>, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>) => {
                    return this.create(data, beforeExecute, afterExecute);
                }, */
                update: (data: ED[T]['Update']['data'], action: ED[T]['Action'], beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>, path?: string) => {
                    return this.update(data, action, beforeExecute, afterExecute, path);
                },
                create: (data: Omit<ED[T]['CreateSingle']['data'], 'id'>,
                    beforeExecute?: () => Promise<void>,
                    afterExecute?: () => Promise<void>,
                    path?: string) => {
                    return this.create(data, beforeExecute, afterExecute, path);
                },
                remove: (beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>, path?: string) => {
                    return this.remove(beforeExecute, afterExecute, path);
                },
                isCreation: (path?: string) => {
                    return this.isCreation(path);
                }
            } as Record<WebComponentSingleMethodNames, Function>);

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

            const data2 = typeof data === 'function' ? (data as Function).call(this as any) : data;
            this.state = Object.assign({}, data2, {
                oakLoading: !!option.entity && !!option.projection,
                oakLoadingMore: false,
                oakPullDownRefreshLoading: false,
                oakExecuting: false,
                oakDirty: false,
            }) as any;
            this.methodProps = methodProps;

            // 处理默认的properties
            this.defaultProperties = {};
            const { properties } = option;
            if (properties) {
                for (const property in properties) {
                    this.defaultProperties[property] = properties[property];
                }
            }

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

        async componentDidMount() {
            this.registerPageScroll();
            this.subscribed.push(
                features.locales.subscribe(() => this.reRender())
            );
            if (option.entity) {
                this.subscribed.push(
                    features.cache.subscribe(() => this.reRender())
                );
            }
            lifetimes?.attached && lifetimes.attached.call(this);
            const { oakPath } = this.props;
            if (option.entity) {
                if (oakPath || this.iAmThePage() && path) {
                    await this.onPathSet();
                    lifetimes?.ready && lifetimes.ready.call(this);
                    lifetimes?.show && lifetimes.show.call(this);
                }
            }
            else {
                // 无entity的结点此时直接调ready生命周期
                if (oakPath || this.iAmThePage() && path) {
                    await this.onPathSet();
                }
                lifetimes?.ready && lifetimes.ready.call(this);
                lifetimes?.show && lifetimes.show.call(this);
                this.reRender();
            }
            if (option.features) {
                option.features.forEach(
                    ele => {
                        if (typeof ele === 'string') {
                            this.subscribed.push(
                                features[ele].subscribe(
                                    () => this.reRender()
                                )
                            );
                        }
                        else {
                            assert(typeof ele === 'object');
                            const { feature, behavior } = ele;
                            this.subscribed.push(
                                features[feature].subscribe(
                                    () => {
                                        switch (behavior) {
                                            case 'reRender': {
                                                this.reRender();
                                                return;
                                            }
                                            default: {
                                                assert(behavior === 'refresh');
                                                this.refresh();
                                                return;
                                            }
                                        }
                                    }
                                )
                            );
                        }
                    }
                );
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

        async componentDidUpdate(prevProps: Record<string, any>, prevState: Record<string, any>) {
            if (prevProps.oakPath !== this.props.oakPath) {
                // oakPath如果是用变量初始化，在这里再执行onPathSet，如果有entity的结点在此执行ready
                assert(this.props.oakPath);
                await this.onPathSet();
                if (option.entity) {
                    lifetimes?.ready && lifetimes.ready.call(this);
                    lifetimes?.show && lifetimes.show.call(this);
                }
            }
            if (this.props.oakId !== prevProps.oakId) {
                assert(this.props.oakId);       // 好像不可能把已有的id设空的界面需求吧
                this.setId(this.props.oakId!);
            }

            /*  这几个东西暂不支持变化，必须在初始化时确定
            // 如果上层将oakFilters和oakSorters作为props传入，这里会将当前的filters和sorters清空，所以使用这两个props时最好是静态不变的
            if (this.props.oakFilters !== prevProps.oakFilters) {
                if (this.props.oakFilters) {
                    const namedFilters = JSON.parse(this.props.oakFilters!);
                    this.setNamedFilters(namedFilters, true);
                }
                else {
                    this.setNamedFilters([], true);
                }
            }
            if (this.props.oakSorters !== prevProps.oakSorters) {
                if (this.props.oakSorters) {
                    const namedSorters = JSON.parse(this.props.oakSorters!);
                    this.setNamedSorters(namedSorters, true);
                }
                else {
                    this.setNamedSorters([], true);
                }
            }
            if (this.props.oakProjection !== prevProps.oakProjection) {
                assert(false, 'oakProjection参数暂不允许变动');
            } */

            fn && fn.call(this, prevProps, prevState);
        }

        render(): React.ReactNode {
            const { oakPullDownRefreshLoading } = this.state;
            const Render = getRender.call(this);

            if (this.supportPullDownRefresh()) {
                return (
                    <PullToRefresh
                        onRefresh={async () => {
                            (this as any).pullDownRefresh = true;
                            await this.refresh();
                            (this as any).pullDownRefresh = false;
                        }}
                        refreshing={oakPullDownRefreshLoading}
                        distanceToRefresh={DEFAULT_REACH_BOTTOM_DISTANCE}
                        indicator={{
                            activate: this.t('common::ptrActivate'),
                            deactivate: this.t('common::ptrDeactivate'),
                            release: this.t('common::ptrRelease'),
                            finish: this.t('common::ptrFinish'),
                        }}
                    >
                        <Render methods={this.methodProps} data={{
                            ...this.defaultProperties,
                            ...this.state,
                            ...this.props,
                        }} />
                    </PullToRefresh>
                );
            }
            return <Render methods={this.methodProps} data={{
                ...this.defaultProperties,
                ...this.state,
                ...this.props,
            }} />;
        }
    };
    return withRouter(OakComponentWrapper, option);
}