/// <reference path="../node_modules/@types/wechat-miniprogram/index.d.ts" />
import { assert } from 'oak-domain/lib/utils/assert';
import { CommonAspectDict } from 'oak-common-aspect';
import { Aspect, CheckerType, EntityDict } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { BasicFeatures } from './features';
import { Feature } from './types/Feature';
import {
    DataOption,
    MethodOption,
    OakCommonComponentMethods,
    OakComponentOption,
    OakListComponentMethods,
    OakSingleComponentMethods,
} from './types/Page';

import {
    onPathSet, reRender, refresh,
    loadMore, execute,
    destroyNode,
} from './page.common';
import { MessageProps } from './types/Message';
import { NotificationProps } from './types/Notification';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import { cloneDeep, pull } from 'oak-domain/lib/utils/lodash';


const OakProperties = {
    oakId: '',
    oakPath: '',
    oakParentEntity: '',
    oakFrom: '',
    oakActions: '',
    oakAutoUnmount: false,
    oakDisablePulldownRefresh: false,
};

const OakPropertyTypes = {
    oakId: String,
    oakPath: String,
    oakParentEntity: String,
    oakFrom: String,
    oakActions: String,
    oakAutoUnmount: Boolean,
    oakDisablePulldownRefresh: Boolean,
}

type EDD = EntityDict & BaseEntityDict;
type Cxt = AsyncContext<EntityDict & BaseEntityDict>;
type ADD = Record<string, Aspect<EDD, Cxt>>;
type FDD = Record<string, Feature>;
type FrontCxt = SyncContext<EntityDict & BaseEntityDict>;
const oakBehavior = Behavior<
    DataOption,
    WechatMiniprogram.Component.PropertyOption,
    OakCommonComponentMethods<EDD, keyof EDD> &
    OakListComponentMethods<EDD, keyof EDD> &
    OakSingleComponentMethods<EDD, keyof EDD> & {
        iAmThePage: () => boolean;
        setState: (
            data: Record<string, any>,
            callback?: () => void
        ) => void;
        onLoad: (query: Record<string, any>) => Promise<void>;
        loadMissedLocales: (key: string) => void;
    },
    {
        unmounted: false;
        prevState: Record<string, any>;
        state: Record<string, any>;
        props: {
            oakId?: string;
            oakPath?: string;
            oakParentEntity?: string;
            oakFrom?: string;
            oakActions?: string;
            oakAutoUnmount?: boolean;
            oakDisablePulldownRefresh?: boolean;
        } & Record<string, any>;
        featuresSubscribed: Array<{
            name: string;
            callback: () => void;
            unsubHandler?: () => void;
        }>;
        features: BasicFeatures<
            EDD,
            Cxt,
            FrontCxt,
            ADD & CommonAspectDict<EDD, Cxt>
        > &
        FDD;
        oakOption: OakComponentOption<
            boolean,
            EDD,
            keyof EDD,
            Cxt,
            FrontCxt,
            ADD,
            FDD,
            Record<string, any>,
            Record<string, any>,
            Record<string, any>,
            Record<string, Function>
        >;
    }
>({
    methods: {
        t(key: string, params?: object) {
            return this.features.locales.t(key, params);
        },

        addFeatureSub(name: string, callback: (args?: any) => void) {
            const unsubHandler = this.features[name]!.subscribe(callback);
            this.featuresSubscribed.push({
                name,
                callback,
                unsubHandler,
            });
        },

        removeFeatureSub(name: string, callback: (args?: any) => void) {
            const f = this.featuresSubscribed.find(
                (ele) => ele.callback === callback && ele.name === name
            )!;
            pull(this.featuresSubscribed, f);
            f.unsubHandler && f.unsubHandler();
        },

        unsubscribeAll() {
            this.featuresSubscribed.forEach((ele) => {
                if (ele.unsubHandler) {
                    ele.unsubHandler();
                    ele.unsubHandler = undefined;
                }
            });
        },

        subscribeAll() {
            this.featuresSubscribed.forEach((ele) => {
                if (!ele.unsubHandler) {
                    ele.unsubHandler = this.features[ele.name].subscribe(
                        ele.callback
                    );
                }
            });
        },

        iAmThePage() {
            const pages = getCurrentPages();
            if (pages[pages.length - 1] === (this as any)) {
                return true;
            }
            return false;
        },

        setState(data: Record<string, any>, callback?: () => void) {
            this.setData(data, () => {
                this.state = this.data;
                callback && callback.call(this);
            });
        },

        reRender() {
            return reRender.call(this as any, this.oakOption as any);
        },

        async onLoad(query: Record<string, any>) {
            /**
             * 小程序以props传递数据，和以页面间参数传递数据的处理不一样，都在这里处理
             * 目前处理的还不是很完善，在实际处理中再做
             */
            const { properties } = this.oakOption;
            const dataResolved: Record<string, any> = {};
            const assignProps = (
                data: Record<string, any>,
                property: string,
                type: 'string' | 'boolean' | 'number' | 'object'
            ) => {
                if (data.hasOwnProperty(property)) {
                    let value = data[property];
                    if (
                        typeof data[property] === 'string' &&
                        type !== 'string'
                    ) {
                        switch (type) {
                            case 'boolean': {
                                value = new Boolean(data[property]);
                                break;
                            }
                            case 'number': {
                                value = new Number(data[property]);
                                break;
                            }
                            case 'object': {
                                value = JSON.parse(data[property]);
                                break;
                            }
                            default: {
                                assert(false);
                            }
                        }
                    }
                    Object.assign(dataResolved, {
                        [property]: value,
                    });
                }
            };
            /**
             * query是跳页面时从queryString里传值
             * this.data是properties中有定义的时候在会自动赋值，这里没必要再处理一遍
             */
            if (properties) {
                for (const key in properties) {
                    if (query[key]) {
                        assignProps(
                            query,
                            key,
                            typeof properties[key] as 'string'
                        );
                    }
                }
            }
            for (const key in OakProperties) {
                if (query[key]) {
                    assignProps(
                        query,
                        key,
                        typeof OakProperties[
                        key as keyof typeof OakProperties
                        ] as 'string'
                    );
                }
            }

            if (Object.keys(dataResolved).length > 0) {
                this.setState(dataResolved);
            }
        },

        subEvent(type: string, callback: Function) {
            this.features.eventBus.sub(type, callback);
        },

        unsubEvent(type: string, callback: Function) {
            this.features.eventBus.unsub(type, callback);
        },

        pubEvent(type: string, option?: any) {
            this.features.eventBus.pub(type, option);
        },

        unsubAllEvents(type: string) {
            this.features.eventBus.unsubAll(type);
        },

        save(key: string, item: any) {
            return this.features.localStorage.save(key, item);
        },

        load(key: string) {
            return this.features.localStorage.load(key);
        },

        clear(key?: string) {
            if (key) {
                return this.features.localStorage.remove(key);
            }
            return this.features.localStorage.clear();
        },

        setNotification(data: NotificationProps) {
            this.features.notification.setNotification(data);
        },

        consumeNotification() {
            return this.features.notification.consumeNotification();
        },

        setMessage(data: MessageProps) {
            return this.features.message.setMessage(data);
        },

        consumeMessage() {
            return this.features.message.consumeMessage();
        },

        navigateBack(delta?: number) {
            return this.features.navigator.navigateBack(delta);
        },

        navigateTo(option, state) {
            return this.features.navigator.navigateTo(option, state);
        },

        redirectTo(option, state) {
            return this.features.navigator.redirectTo(option, state);
        },

        switchTab(option, state) {
            return this.features.navigator.switchTab(option, state);
        },

        clean(path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            return this.features.runningTree.clean(path2);
        },

        isDirty(path) {
            return this.features.runningTree.isDirty(
                path || this.state.oakFullpath
            );
        },

        execute(action, messageProps, path, opers) {
            return execute.call(this as any, action, path, messageProps, opers);
        },

        getFreshValue(path?: string) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            this.features.runningTree.redoBranchOperations(path2);
            const value = this.features.runningTree.getFreshValue(path2);
            this.features.runningTree.rollbackRedoBranchOperations();
            return value;
        },

        checkOperation(entity, { action, data, filter }, checkerTypes) {
            if (checkerTypes?.includes('relation')) {
                return (
                    this.features.relationAuth.checkRelation(entity, {
                        action,
                        data,
                        filter,
                    } as Omit<EDD[keyof EDD]['Operation'], 'id'>) &&
                    this.features.cache.checkOperation(
                        entity,
                        {
                            action,
                            data,
                            filter,
                        },
                        checkerTypes as CheckerType[]
                    )
                );
            }
            return this.features.cache.checkOperation(
                entity,
                {
                    action,
                    data,
                    filter,
                },
                checkerTypes as CheckerType[]
            );
        },

        tryExecute(path?: string) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            const operations = this.features.runningTree.getOperations(path2);
            if (operations) {
                for (const oper of operations) {
                    const { entity, operation } = oper;
                    const result = this.checkOperation(entity, operation);
                    if (result !== true) {
                        return result;
                    }
                }
                return true;
            }
            return false;
        },

        getOperations<T extends keyof EDD>(path?: string) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            return this.features.runningTree.getOperations(path2);
        },

        async refresh() {
            return refresh.call(this as any);
        },

        loadMore() {
            return loadMore.call(this as any);
        },

        getId() {
            return this.features.runningTree.getId(this.state.oakFullpath);
        },

        setNamedFilters(filters, refresh, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            this.features.runningTree.setNamedFilters(path2, filters, refresh);
        },

        setFilters(filters, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            this.features.runningTree.setNamedFilters(path2, filters);
        },

        getFilters(path) {
            if (this.state.oakFullpath) {
                const path2 = path
                    ? `${this.state.oakFullpath}.${path}`
                    : this.state.oakFullpath;
                const namedFilters = this.features.runningTree.getNamedFilters(
                    this.state.oakFullpath
                );
                return namedFilters.map(({ filter }) => {
                    if (typeof filter === 'function') {
                        return filter();
                    }
                    return filter;
                });
            }
        },

        getFilterByName(name, path) {
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
                        return filter.filter();
                    }
                    return filter.filter;
                }
            }
        },

        addNamedFilter(namedFilter, refresh, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            this.features.runningTree.addNamedFilter(
                path2,
                namedFilter,
                refresh
            );
        },

        removeNamedFilter(namedFilter, refresh, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            this.features.runningTree.removeNamedFilter(
                path2,
                namedFilter,
                refresh
            );
        },

        removeNamedFilterByName(name, refresh, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            this.features.runningTree.removeNamedFilterByName(
                path2,
                name,
                refresh
            );
        },

        setNamedSorters(namedSorters, refresh, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            this.features.runningTree.setNamedSorters(
                path2,
                namedSorters,
                refresh
            );
        },

        getSorters(path) {
            if (this.state.oakFullpath) {
                const path2 = path
                    ? `${this.state.oakFullpath}.${path}`
                    : this.state.oakFullpath;
                const namedSorters =
                    this.features.runningTree.getNamedSorters(path2);
                const sorters = namedSorters
                    .map(({ sorter }) => {
                        if (typeof sorter === 'function') {
                            return sorter();
                        }
                        return sorter;
                    })
                    .filter((ele) => !!ele);
                return sorters as EDD[keyof EDD]['Selection']['sorter'];
            }
        },

        getSorterByName(name, path) {
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
                        const sortItem = sorter.sorter();
                        // 要支持自定义sorter函数返回完整的sorter，但这种sorter应当确保是无名的不被查找
                        assert(
                            !(sortItem instanceof Array),
                            '不应该有非item的sorter被查找'
                        );
                        return sortItem;
                    }
                    return sorter.sorter;
                }
            }
        },

        addNamedSorter(namedSorter, refresh, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            this.features.runningTree.addNamedSorter(
                path2,
                namedSorter,
                refresh
            );
        },

        removeNamedSorter(namedSorter, refresh, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            this.features.runningTree.removeNamedSorter(
                path2,
                namedSorter,
                refresh
            );
        },

        removeNamedSorterByName(name, refresh, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            this.features.runningTree.removeNamedSorterByName(
                path2,
                name,
                refresh
            );
        },

        getPagination(path) {
            if (this.state.oakFullpath) {
                const path2 = path
                    ? `${this.state.oakFullpath}.${path}`
                    : this.state.oakFullpath;
                return this.features.runningTree.getPagination(path2);
            }
        },

        setPageSize(pageSize, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            this.features.runningTree.setPageSize(path2, pageSize);
        },

        setCurrentPage(currentPage, path) {
            assert(currentPage !== 0);

            if (this.state.oakEntity && this.state.oakFullpath) {
                const path2 = path
                    ? `${this.state.oakFullpath}.${path}`
                    : this.state.oakFullpath;
                this.features.runningTree.setCurrentPage(path2, currentPage);
            }
        },
        addItem(data, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            return this.features.runningTree.addItem(path2, data);
        },
        addItems(data, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            return this.features.runningTree.addItems(path2, data);
        },
        updateItem(data, id, action, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            return this.features.runningTree.updateItem(
                path2,
                data,
                id,
                action
            );
        },
        removeItem(id, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            return this.features.runningTree.removeItem(path2, id);
        },
        removeItems(ids, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            return this.features.runningTree.removeItems(path2, ids);
        },
        recoverItem(id, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            return this.features.runningTree.recoverItem(path2, id);
        },
        recoverItems(ids, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            return this.features.runningTree.recoverItems(path2, ids);
        },
        resetItem(id: string, path?: string) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            this.features.runningTree.resetItem(path2, id);
        },
        setId(id) {
            return this.features.runningTree.setId(this.state.oakFullpath, id);
        },
        unsetId() {
            return this.features.runningTree.unsetId(this.state.oakFullpath);
        },

        update(data, action, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            return this.features.runningTree.update(path2, data, action);
        },

        create(data, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            return this.features.runningTree.create(path2, data);
        },

        remove(path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            return this.features.runningTree.remove(path2);
        },

        isCreation(path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            this.features.runningTree.redoBranchOperations(path2);
            const value = this.features.runningTree.getFreshValue(path2);
            this.features.runningTree.rollbackRedoBranchOperations();
            assert(!(value instanceof Array));
            return value?.$$createAt$$ === 1;
        },

        async aggregate(aggregation) {
            return await this.features.cache.aggregate(
                this.state.oakEntity,
                aggregation
            );
        },

        loadMissedLocales(key: string) {
            this.features.locales.loadMissedLocale(key);
        },

        subDataEvents(events, callback) {
            return this.features.subscriber.sub(events, callback);
        },

        unsubDataEvents(events) {
            return this.features.subscriber.unsub(events);
        },
    },
    observers: {
        oakPath(data) {
            if (data && data !== this.state.oakFullpath) {
                const pathState = onPathSet.call(
                    this as any,
                    this.oakOption as any
                );
                if (this.unmounted) {
                    return;
                }
                this.setState(pathState as any, () => {
                    if (data === undefined) {
                        // 如果每个页面都在oakFullpath形成后再渲染子结点，这个if感觉是不应该命中的
                        console.warn(
                            '发生了结点先形成再配置oakPath的情况，请检查代码修正'
                        );
                        this.oakOption.lifetimes?.ready &&
                            this.oakOption.lifetimes?.ready.call(this);

                        const { oakFullpath } = this.state;
                        if (
                            oakFullpath &&
                            !this.features.runningTree.checkIsModiNode(
                                oakFullpath
                            ) &&
                            !this.features.runningTree.isListDescandent(
                                oakFullpath
                            )
                        ) {
                            this.refresh();
                        } else {
                            this.reRender();
                        }
                    }
                });
            }
        },
        oakId(data) {
            if (data !== this.props.oakId) {
                if (this.state.oakFullpath) {
                    this.features.runningTree.setId(
                        this.state.oakFullpath,
                        data
                    );
                }
            }
        },
    },
});

function translateListeners(listeners?: Record<string, (prev: Record<string, any>, next: Record<string, any>) => void>): undefined | Record<string, (this: { state: Record<string, any> }, ...args: any[]) => any> {
    if (listeners) {
        const result = {} as Record<string, (...args: any[]) => any>;
        for (const ln in listeners) {
            result[ln] = function (this: { state: Record<string, any>, prevState: Record<string, any> }, ...args) {
                // 实测中小程序也是在update之后再调用observer，此时state上的值已经变成后项，因此增加prevState来缓存之
                const propNames = ln.split(',');

                const prev: Record<string, any> = {};
                const next: Record<string, any> = {};
                let dirty = false;
                propNames.forEach(
                    (pn, idx) => {
                        prev[pn] = this.prevState[pn];
                        next[pn] = args[idx];
                        if (prev[pn] !== next[pn]) {
                            dirty = true;
                        }
                    }
                );
                if (dirty) {
                    listeners[ln].call(this, prev, next);
                }
            }
        }

        return result;
    }
}

function translatePropertiesToPropertyDefinitions(properties?: DataOption) {
    const definitions = {} as WechatMiniprogram.Component.PropertyOption;
    if (properties) {
        Object.keys(properties).forEach(
            (prop) => {
                switch (typeof properties[prop]) {
                    case 'string': {
                        if (properties[prop]) {
                            definitions[prop] = {
                                type: String,
                                value: properties[prop],
                            };
                        }
                        else {
                            definitions[prop] = String;
                        }
                        break;
                    }
                    case 'boolean': {
                        definitions[prop] = {
                            type: Boolean,
                            value: properties[prop],
                        };
                        break;
                    }
                    case 'number': {
                        definitions[prop] = {
                            type: Number,
                            value: properties[prop],
                        };
                        break;
                    }
                    case 'object': {
                        if (properties[prop] instanceof Array) {
                            if (properties[prop].length > 0) {
                                definitions[prop] = {
                                    type: Array,
                                    value: properties[prop],
                                };
                            }
                            else {
                                definitions[prop] = Array;
                            }
                        }
                        else {
                            if (Object.keys(properties[prop]).length > 0) {
                                definitions[prop] = {
                                    type: Object,
                                    value: properties[prop],
                                };
                            }
                            else {
                                definitions[prop] = Object;
                            }
                        }
                        break;
                    }
                    case 'function': {
                        Object.assign(definitions, {
                            [prop]: Function,
                        });
                    }
                    default: {
                        // 小程序也支持传函数 https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/wxml-wxss.html
                        // 其它什么类型都写null，小程序能识别出来
                        Object.assign(definitions, {
                            [prop]: null,
                        });
                        break;
                    }
                }
            }
        );
    }
    return definitions;
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
    TData extends DataOption = {},
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
        entity,
        data,
        properties,
        methods,
        wechatMp,
        lifetimes,
        listeners,
    } = option;
    const { attached, show, hide, created, detached, ready, moved, error } = lifetimes || {};
    const { options, externalClasses } = wechatMp || {};
    const { onPullDownRefresh, onReachBottom, ...restMethods } = (methods || {}) as Record<string, Function>;

    const observers = translateListeners(listeners);
    return Component<
        DataOption,
        WechatMiniprogram.Component.PropertyOption,
        MethodOption,
        {
            umounted: Boolean;
            prevState: Record<string, any>;
            state: Record<string, any>;
            featuresSubscribed: Array<{
                name: string;
                callback: () => void;
                unsubHandler?: () => void;
            }>;
            props: {
                oakId?: string;
                oakPath?: string;
                oakParentEntity?: string;
                oakFrom?: string;
                oakActions?: string;
                oakAutoUnmount?: boolean;
                oakDisablePulldownRefresh?: boolean;
            } & Record<string, any>;
            features: BasicFeatures<
                ED,
                Cxt,
                FrontCxt,
                AD & CommonAspectDict<ED, Cxt>
            > &
            FD;
            oakOption: OakComponentOption<
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
        }
    >({
        externalClasses,
        behaviors: [oakBehavior],
        data:
            typeof data !== 'function'
                ? Object.assign({}, data, {
                    oakFullpath: '',
                    oakLoading: !!option.entity && !!option.projection,
                })
                : {
                    oakFullpath: '',
                    oakLoading: !!option.entity && !!option.projection,
                },
        properties: Object.assign(
            {},
            translatePropertiesToPropertyDefinitions(properties),
            OakPropertyTypes
        ) as WechatMiniprogram.Component.PropertyOption,
        methods: {
            async onPullDownRefresh() {
                if (
                    !this.state.oakLoading &&
                    this.iAmThePage() &&
                    !this.props.oakDisablePulldownRefresh &&
                    !this.state.oakPullDownRefreshLoading
                ) {
                    try {
                        this.setState({
                            oakPullDownRefreshLoading: true as any,
                        });
                        await (
                            onPullDownRefresh
                                ? onPullDownRefresh.call(this)
                                : this.refresh()
                        );
                        this.setState({
                            oakPullDownRefreshLoading: false as any,
                        });
                        await wx.stopPullDownRefresh();
                    } catch (err) {
                        this.setState({
                            oakPullDownRefreshLoading: false as any,
                        });
                        await wx.stopPullDownRefresh();
                        throw err;
                    }
                } else {
                    await wx.stopPullDownRefresh();
                }
            },

            async onReachBottom() {
                if (
                    !this.state.oakLoadingMore &&
                    this.iAmThePage() &&
                    this.oakOption.isList
                ) {
                    await (onReachBottom
                        ? onReachBottom.call(this)
                        : this.loadMore());
                }
            },

            ...restMethods,
        },
        observers,
        pageLifetimes: {
            show() {
                const { show } = this.oakOption.lifetimes || {};
                show && show.call(this);
                this.reRender();
                this.subscribeAll();
            },
            hide() {
                const { hide } = this.oakOption.lifetimes || {};
                hide && hide.call(this);
                this.unsubscribeAll();
            },
            resize(size: WechatMiniprogram.Page.IResizeOption) {
                const { resize } = this.oakOption.lifetimes || {};
                resize && resize.call(this, size);
            }
        },
        lifetimes: {
            created() {
                const { setData } = this;
                this.state = this.data;
                this.props = this.data;
                this.prevState = {};
                this.setData = (data, callback) => {
                    this.prevState = cloneDeep(this.data);
                    setData.call(this, data, () => {
                        this.state = this.data;
                        this.props = this.data;
                        callback && callback.call(this);
                    });
                };
                this.oakOption = option;
                this.features = features;
                this.featuresSubscribed = [];
                created && created.call(this);
            },
            attached() {
                if (typeof data === 'function') {
                    // ts的编译好像有问题，这里不硬写as过不去
                    const data2 = (data as Function).call(this as any);
                    this.setData(data2, () => {
                        const fnData = {} as Partial<WechatMiniprogram.Component.DataOption>;
                        for (const k in this.data) {
                            if (typeof this.data[k] === 'function') {
                                fnData[k] = this.data[k].bind(this);
                            }
                        }
                        if (Object.keys(fnData).length > 0) {
                            this.setData(fnData);
                        }
                    });
                } else {
                    const fnData = {} as Partial<WechatMiniprogram.Component.DataOption>;
                    for (const k in this.data) {
                        if (typeof this.data[k] === 'function') {
                            fnData[k] = this.data[k].bind(this);
                        }
                    }
                    if (Object.keys(fnData).length > 0) {
                        this.setData(fnData);
                    }
                }
                this.umounted = false;
                this.addFeatureSub('locales', () => this.reRender());

                if (option.entity) {
                    this.addFeatureSub('cache', () => this.reRender());
                }
                if (option.features) {
                    option.features.forEach((ele) => {
                        if (typeof ele === 'string') {
                            this.addFeatureSub(ele, () => this.reRender());
                        } else {
                            assert(typeof ele === 'object');
                            const { feature, behavior, callback } = ele;
                            if (behavior) {
                                this.addFeatureSub(feature, () => {
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
                                });
                            }
                            else if (callback) {
                                callback.call(this as any);
                            }
                            else {
                                this.reRender();
                            }
                        }
                    });
                }

                if (this.props.oakPath ||
                    (this.iAmThePage() && this.oakOption.path)) {
                    const pathState = onPathSet.call(
                        this as any,
                        this.oakOption as any
                    );
                    if (this.unmounted) {
                        return;
                    }
                    this.setState(pathState as any, () => {
                        const { oakFullpath } = this.state;
                        if (oakFullpath && !features.runningTree.checkIsModiNode(oakFullpath) && !features.runningTree.isListDescandent(oakFullpath)) {
                            this.refresh();
                        } else {
                            this.reRender();
                        }
                    });
                } else if (!this.oakOption.entity) {
                    this.reRender();
                }

                attached && attached.call(this);
            },
            detached() {
                this.unsubscribeAll();
                this.state.oakFullpath &&
                    (this.iAmThePage() || this.props.oakAutoUnmount) &&
                    destroyNode.call(this as any);

                detached && detached.call(this);
                this.umounted = true;
            },
            ready() {
                // 等oakFullpath构建完成后再ready
                if (this.state.oakFullpath) {
                    ready && ready.call(this);
                }
                else if (!this.oakOption.entity) {
                    ready && ready.call(this);
                }
            },
            moved() {
                moved && moved.call(this);
            },
            error(err: Error) {
                error && error.call(this, err);
            },
        },
    });
}