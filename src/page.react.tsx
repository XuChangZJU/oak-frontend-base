import { assert } from 'oak-domain/lib/utils/assert';
import React from 'react';
import { get, pull } from 'oak-domain/lib/utils/lodash';
import { CommonAspectDict } from 'oak-common-aspect';
import { Action, Aspect, CheckerType, EntityDict, OpRecord, SubDataDef } from 'oak-domain/lib/types';
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
    ComponentProps<ED, T, TProperty>,
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
    featuresSubscribed: Array<{
        name: string;
        callback: (args?: any) => void;
        unsubHandler?: () => void;
    }> = []

    addFeatureSub(name: string, callback: (args?: any) => void) {
        const unsubHandler = this.features[name]!.subscribe(callback);
        this.featuresSubscribed.push({
            name,
            callback,
            unsubHandler,
        });
    }

    removeFeatureSub(name: string, callback: (args?: any) => void) {
        const f = this.featuresSubscribed.find(
            ele => ele.callback === callback && ele.name === name
        )!;
        pull(this.featuresSubscribed, f);
        f.unsubHandler && f.unsubHandler();
    }

    unsubscribeAll() {
        this.featuresSubscribed.forEach(
            ele => {
                if (ele.unsubHandler) {
                    ele.unsubHandler();
                    ele.unsubHandler = undefined;
                }
            }
        );
    }

    subscribeAll() {
        this.featuresSubscribed.forEach(
            ele => {
                if (!ele.unsubHandler) {
                    ele.unsubHandler = this.features[ele.name].subscribe(ele.callback);
                }
            }
        );
    }

    subEvent(type: string, callback: Function) {
        this.features.eventBus.sub(type, callback);
    }

    unsubEvent(type: string, callback: Function) {
        this.features.eventBus.unsub(type, callback);
    }

    pubEvent(type: string, options?: any) {
        this.features.eventBus.pub(type, options);
    }

    unsubAllEvents(type: string) {
        this.features.eventBus.unsubAll(type);
    }

    save(key: string, item: any) {
        return this.features.localStorage.save(key, item);
    }

    load(key: string) {
        return this.features.localStorage.load(key);
    }

    clear(key?: string) {
        if (key) {
            return this.features.localStorage.remove(key);
        }
        return this.features.localStorage.clear();
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

    addItem<T extends keyof ED>(
        data: Omit<ED[T]['CreateSingle']['data'], 'id'> & { id?: string },
        path?: string
    ) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        return this.features.runningTree.addItem(
            path2,
            data
        );
    }

    addItems<T extends keyof ED>(
        data: Array<Omit<ED[T]['CreateSingle']['data'], 'id'> & { id?: string }>,
        path?: string
    ) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        return this.features.runningTree.addItems(
            path2,
            data
        );
    }

    removeItem(id: string, path?: string) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.removeItem(
            path2,
            id
        );
    }

    removeItems(ids: string[], path?: string) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.removeItems(path2, ids);
    }

    updateItem<T extends keyof ED>(
        data: ED[T]['Update']['data'],
        id: string,
        action?: ED[T]['Action'],
        path?: string
    ) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.updateItem(
            path2,
            data,
            id,
            action
        );
    }

    recoverItem(id: string, path?: string) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.recoverItem(path2, id);
    }

    recoverItems(ids: string[], path?: string) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.recoverItems(path2, ids);
    }

    resetItem(id: string, path?: string) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.resetItem(path2, id);
    }

    update<T extends keyof ED>(
        data: ED[T]['Update']['data'],
        action?: ED[T]['Action'],
        path?: string
    ) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.update(
            path2,
            data,
            action
        );
    }

    create<T extends keyof ED>(
        data: Omit<ED[T]['CreateSingle']['data'], 'id'>,
        path?: string
    ) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.create(
            path2,
            data
        );
    }

    remove(path?: string) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.remove(path2);
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

    execute(action?: ED[T]['Action'], messageProps?: boolean | MessageProps, path?: string, opers?: Array<{
        entity: T,
        operation: ED[T]['Operation'],
    }>) {
        return execute.call(this as any, action, path, messageProps, opers as any);
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

    checkOperation<T2 extends keyof ED>(
        entity: T2,
        operation: Omit<ED[T2]['Operation'], 'id'>,
        checkerTypes?: (CheckerType | 'relation')[]
    ) {
        if (checkerTypes?.includes('relation')) {
            return this.features.relationAuth.checkRelation(
                entity,
                operation
            ) && this.features.cache.checkOperation(
                entity,
                operation,
                checkerTypes as CheckerType[]
            )
        }
        return this.features.cache.checkOperation(
            entity,
            operation,
            checkerTypes as CheckerType[]
        );
    }

    tryExecute(path?: string) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        const operations = this.features.runningTree.getOperations(path2);
        if (operations) {
            for (const oper of operations) {
                const { entity, operation } = oper;
                if (!this.checkOperation(entity, operation)) {
                    return false;
                }
            }
            return true;
        }
        return false;
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

    setId(id: string, path?: string) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        return this.features.runningTree.setId(path2, id);
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

    subDataEvents(events: string[], callback: (event: string, opRecords: OpRecord<ED>[]) => void) {
        return this.features.subscriber.sub(events, callback);
    }

    unsubDataEvents(events: string[]) {
        return this.features.subscriber.unsub(events);
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
        methodProps: Record<string, Function>;
        defaultProperties: Record<string, any>;
        unmounted: boolean = false;

        constructor(props: ComponentProps<ED, T, TProperty>) {
            super(props);
            const methodProps: Record<WebComponentCommonMethodNames, Function> =
            {
                t: (key: string, params?: object) => this.t(key, params),
                execute: (
                    action?: ED[T]['Action'],
                    messageProps?: boolean | MessageProps,
                    path?: string,
                    opers?: Array<{
                        entity: T,
                        operation: ED[T]['Operation'],
                    }>
                ) => {
                    return this.execute(action, messageProps, path, opers);
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
                checkOperation: <T2 extends keyof ED>(entity: T2, operation: ED[T2]['Operation'], checkerTypes?: CheckerType[]) => {
                    return this.checkOperation(entity, operation, checkerTypes);
                }
            };
            Object.assign(methodProps, {
                addItem: (data: Omit<ED[T]['CreateSingle']['data'], 'id'> & { id?: string }, path?: string) => {
                    return this.addItem(data, path);
                },
                addItems: (data: Array<Omit<ED[T]['CreateSingle']['data'], 'id'>> & { id?: string }, path?: string) => {
                    return this.addItems(data, path);
                },
                removeItem: (id: string, path?: string) => {
                    return this.removeItem(id, path);
                },
                removeItems: (ids: string[], path?: string) => {
                    return this.removeItems(ids, path);
                },
                updateItem: (data: ED[T]['Update']['data'], id: string, action?: ED[T]['Action'], path?: string) => {
                    return this.updateItem(data, id, action, path);
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
                recoverItems: (ids: string[], path?: string) => {
                    return this.recoverItems(ids, path);
                },
                resetItem: (id: string, path?: string) => {
                    return this.resetItem(id, path);
                },
                setId: (id: string) => {
                    return this.setId(id);
                },
                getId: (id: string) => {
                    return this.getId();
                },
                unsetId: () => {
                    return this.unsetId();
                }
            } as Record<WebComponentListMethodNames, Function>);

            Object.assign(methodProps, {
                update: (data: ED[T]['Update']['data'], action: ED[T]['Action'], path?: string) => {
                    return this.update(data, action, path);
                },
                create: (data: Omit<ED[T]['CreateSingle']['data'], 'id'>, path?: string) => {
                    return this.create(data, path);
                },
                remove: (path?: string) => {
                    return this.remove(path);
                },
                isCreation: (path?: string) => {
                    return this.isCreation(path);
                },
                getId: (path?: string) => this.getId(path),
                setId: (id: string, path?: string) => this.setId(id, path)
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
            for (const k in data2) {
                if (typeof data2[k] === 'function') {
                    data2[k] = data2[k].bind(this);
                }
            }
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

        // 编译器只会在page层注入path，component依赖父亲设置的oakPath
        iAmThePage() {
            return this.oakOption.path;
        }

        isMobile() {
            // 现按屏幕宽度判断是否为mobile
            return this.props.width === 'xs';
        }

        supportPullDownRefresh() {
            const { oakDisablePulldownRefresh = false } = this.props;
            return (
                this.isMobile() &&
                this.iAmThePage() &&
                !oakDisablePulldownRefresh
            );
        }


        async componentDidMount() {
            this.addFeatureSub('locales', () => this.reRender());
            if (option.entity) {
                this.addFeatureSub('cache', () => this.reRender());
            }
            lifetimes?.attached && lifetimes.attached.call(this);
            const { oakPath } = this.props;
            if (oakPath || path) {
                const pathState = onPathSet.call(this as any, this.oakOption as any);
                if (this.unmounted) {
                    return;
                }
                this.setState(pathState as any, () => {
                    lifetimes?.ready && lifetimes.ready.call(this);
                    lifetimes?.show && lifetimes.show.call(this);

                    const { oakFullpath } = this.state;
                    if (oakFullpath && !features.runningTree.checkIsModiNode(oakFullpath) && !features.runningTree.isListDescandent(oakFullpath)) {
                        this.refresh();
                    }
                    else {
                        this.reRender();
                    }
                });
            }
            else if (!this.oakOption.entity) {
                // 如果没有entity，也不需要onPathSet，直接走ready
                lifetimes?.ready && lifetimes.ready.call(this);
                lifetimes?.show && lifetimes.show.call(this);

                this.reRender();
            }
            if (option.features) {
                option.features.forEach(
                    ele => {
                        if (typeof ele === 'string') {
                            this.addFeatureSub(ele, () => this.reRender());
                        }
                        else {
                            assert(typeof ele === 'object');
                            const { feature, behavior, callback } = ele;
                            this.addFeatureSub(feature as string, () => {
                                if (behavior) {
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
                                else if (callback) {
                                    callback.call(this as any);
                                }
                                else {
                                    this.reRender();
                                }
                            });
                        }
                    }
                );
            }
        }

        componentWillUnmount() {
            this.unsubscribeAll();
            this.state.oakFullpath && (this.iAmThePage() || this.props.oakAutoUnmount) && destroyNode.call(this as any);
            lifetimes?.detached && lifetimes.detached.call(this);
            this.unmounted = true;
        }

        async componentDidUpdate(prevProps: Record<string, any>, prevState: Record<string, any>) {
            if (prevProps.oakPath !== this.props.oakPath) {
                // oakPath如果是用变量初始化，在这里再执行onPathSet，如果有entity的结点在此执行ready
                assert(this.props.oakPath && this.oakOption.entity);
                const pathState = onPathSet.call(this as any, this.oakOption as any);
                if (this.unmounted) {
                    return;
                }
                this.setState(pathState as any, async () => {
                    if (prevProps.oakPath === undefined) {
                        // 如果每个页面都在oakFullpath形成后再渲染子结点，这个if感觉是不应该命中的
                        console.warn('发生了结点先形成再配置oakPath的情况，请检查代码修正');
                        lifetimes?.ready && lifetimes.ready.call(this);
                        lifetimes?.show && lifetimes.show.call(this);
                    }
                    const { oakFullpath } = this.state;
                    if (oakFullpath && !features.runningTree.checkIsModiNode(oakFullpath) && !features.runningTree.isListDescandent(oakFullpath)) {
                        this.refresh();
                    }
                    else {
                        this.reRender();
                    }
                });
            }
            else if (this.props.oakId !== prevProps.oakId) {
                assert(this.props.oakId);       // 好像不可能把已有的id设空的界面需求吧
                this.setId(this.props.oakId!);
            }

            fn && fn.call(this, prevProps, prevState);
        }

        render(): React.ReactNode {
            const Render = getRender.call(this);
            // 传入oakPath或page入口页 需要等待oakFullpath初始化完成
            if ((this.props.oakPath || path) && !this.state.oakFullpath) {
                return null;
            }
            // option有entity，也需要等待oakFullpath初始化完成
            if (this.oakOption.entity && !this.state.oakFullpath) {
                return null;
            }

            return (
                <Render
                    methods={this.methodProps}
                    data={{
                        ...this.defaultProperties,
                        ...this.state,
                        ...this.props,
                    }}
                />
            );
        }
    };
    return OakComponentWrapper;
}