/// <reference path="../node_modules/@types/wechat-miniprogram/index.d.ts" />
import assert from 'assert';
import { CommonAspectDict } from 'oak-common-aspect';
import { Aspect, EntityDict } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { BasicFeatures } from './features';
import { Feature } from './types/Feature';
import {
    DataOption,
    MethodOption,
    ComponentProps,
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
import { CURRENT_LOCALE_DATA, CURRENT_LOCALE_KEY, getI18nInstanceWechatMp } from './platforms/wechatMp/i18n';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import { cloneDeep } from 'oak-domain/lib/utils/lodash';


const OakProperties = {
    oakId: '',
    oakPath: '',
    oakFilters: [],
    oakSorters: [],
    oakProjection: {},
    oakParentEntity: '',
    oakFrom: '',
    oakActions: '',
    oakAutoUnmount: false,
    oakDisablePulldownRefresh: false,
};

const OakPropertyTypes = {
    oakId: String,
    oakPath: String,
    // 这几个不能写成Array或Object，小程序会初始化成空对象和空数组
    oakFilters: null,
    oakSorters: null,
    oakProjection: null,
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
        },
    {
        prevState: Record<string, any>;
        state: Record<string, any>;
        props: {
            oakId?: string;
            oakPath?: string;
            oakFilters?: string;
            oakSorters?: string;
            oakProjection?: string;
            oakParentEntity?: string;
            oakFrom?: string;
            oakActions?: string;
            oakAutoUnmount?: boolean;
            oakDisablePulldownRefresh?: boolean;
        } & Record<string, any>;
        features: BasicFeatures<
            EDD,
            Cxt,
            FrontCxt,
            ADD & CommonAspectDict<EDD, Cxt>
        > &
            FDD;
        subscribed: Array<() => void>;
        oakOption: OakComponentOption<
            EDD,
            keyof EDD,
            Cxt,
            FrontCxt,
            ADD,
            FDD,
            Record<string, any>,
            boolean,
            Record<string, any>,
            Record<string, any>,
            Record<string, Function>
        >;
    }
>({
    methods: {
        setDisablePulldownRefresh(able) {
            this.setState({
                oakDisablePulldownRefresh: able,
            });
        },
        t(key: string, params?: object) {
            //  common: {
            //        GREETING: 'Hello {{name}}, nice to see you.',
            //   },
            // t('common:GREETING', {name: "John Doe" })
            const i18nInstance = getI18nInstanceWechatMp();
            if (!i18nInstance) {
                throw new Error(
                    '[i18n] ensure run initI18nWechatMp() in app.js before using I18n library'
                );
            }
            return i18nInstance.getString(key, params);
        },

        resolveInput(input: WechatMiniprogram.CustomEvent, keys) {
            const { currentTarget, detail } = input;
            const { dataset } = currentTarget;
            const { value } = detail;
            const result = {
                dataset,
                value,
            };
            if (keys) {
                keys.forEach((k) =>
                    Object.assign(result, {
                        [k]: detail[k],
                    })
                );
            }
            return result;
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
            const { properties, path } = this.oakOption;
            const dataResolved: Record<string, any> = {};
            const assignProps = (
                data: Record<string, any>,
                property: string,
                type: 'string' | 'boolean' | 'number' | 'object'
            ) => {
                if (data.hasOwnProperty(property)) {
                    let value = data[property];
                    if (typeof data[property] === 'string' && type !== 'string') {
                        switch (type) {
                            case 'boolean': {
                                value = new Boolean(data[property]);
                                break;
                            }
                            case 'number': {
                                value = new Number(data[property]);
                                break;
                            }
                            case 'object':{
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
                        assignProps(query, key, typeof properties[key] as 'string');
                    }
                }
            }
            for (const key in OakProperties) {
                if (query[key]) {
                    assignProps(
                        query,
                        key,
                        typeof OakProperties[key as keyof typeof OakProperties] as 'string'
                    );
                }
            }

            if (Object.keys(dataResolved).length > 0) {
                this.setState(dataResolved);
            }
            if (this.props.oakPath || (this.iAmThePage() && path)) {
                await onPathSet.call(this as any, this.oakOption as any);
            } else {
                this.reRender();
            }
        },

        sub(type: string, callback: Function) {
            this.features.eventBus.sub(type, callback);
        },

        unsub(type: string, callback: Function) {
            this.features.eventBus.unsub(type, callback);
        },

        pub(type: string, option?: any) {
            this.features.eventBus.pub(type, option);
        },

        unsubAll(type: string) {
            this.features.eventBus.unsubAll(type);
        },

        save(key: string, item: any) {
            this.features.localStorage.save(key, item);
        },

        load(key: string) {
            return this.features.localStorage.load(key);
        },

        clear() {
            this.features.localStorage.clear();
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

        execute(action, messageProps?: boolean | MessageProps) {
            return execute.call(this as any, action, undefined, messageProps);
        },

        getFreshValue(path?: string) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            return this.features.runningTree.getFreshValue(path2);
        },

        checkOperation(entity, action, data, filter, checkerTypes) {
            return this.features.cache.checkOperation(
                entity,
                action,
                data,
                filter,
                checkerTypes
            );
        },

        tryExecute(path?: string) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            return this.features.runningTree.tryExecute(path2);
        },

        getOperations<T extends keyof EDD>(path?: string) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            return this.features.runningTree.getOperations(path2);
        },

        refresh() {
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
            this.features.runningTree.setNamedSorters(path2, namedSorters, refresh);
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
                        return sorter.sorter();
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
        addItem(data, beforeExecute, afterExecute, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            return this.features.runningTree.addItem(
                path2,
                data,
                beforeExecute,
                afterExecute
            );
        },
        updateItem(data, id, action, beforeExecute, afterExecute, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            return this.features.runningTree.updateItem(
                path2,
                data,
                id,
                action,
                beforeExecute,
                afterExecute
            );
        },
        removeItem(id, beforeExecute, afterExecute, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            return this.features.runningTree.removeItem(
                path2,
                id,
                beforeExecute,
                afterExecute
            );
        },
        recoverItem(id, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            return this.features.runningTree.recoverItem(path2, id);
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

        update(data, action, beforeExecute, afterExecute, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            return this.features.runningTree.update(
                path2,
                data,
                action,
                beforeExecute,
                afterExecute
            );
        },

        create(data, beforeExecute, afterExecute, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            return this.features.runningTree.create(
                path2,
                data,
                beforeExecute,
                afterExecute
            );
        },

        remove(beforeExecute, afterExecute, path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            return this.features.runningTree.remove(
                path2,
                beforeExecute,
                afterExecute
            );
        },
        async aggregate(aggregation) {
            return await this.features.cache.aggregate(
                this.state.oakEntity,
                aggregation
            );
        },
    },
    observers: {
        oakPath(data) {
            if (data && data !== this.state.oakFullpath) {
                onPathSet.call(this as any, this.oakOption as any);
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
        /* oakFilters(data) {
            if (data !== this.props.oakFilters) {
                // 如果oakFilters被置空或重置，会完全重置当前结点上所有的nameFilter并重取数据。这个逻辑可能有问题，对oakFilters要慎用
                if (!data) {
                    this.setNamedFilters([], true);
                }
                else {
                    const namedFilters = JSON.parse(data);
                    this.setNamedFilters(namedFilters, true);
                }
            }
        },
        oakSorters(data) {
            if (data !== this.props.oakSorters) {
                // 如果oakSorters被置空或重置，会完全重置当前结点上所有的nameSorter并重取数据。这个逻辑可能有问题，对oakSorter要慎用
                if (!data) {
                    this.setNamedSorters([], true);
                }
                else {
                    const namedSorters = JSON.parse(data);
                    this.setNamedSorters(namedSorters, true);
                }
            }
        },
        oakProjection(data) {
            assert(data === this.props.oakProjection, 'oakProjection暂不支持变化');
        } */
    },
    pageLifetimes: {
        show() {
            const { show } = this.oakOption.lifetimes || {};
            this.reRender();
            show && show.call(this);
        },
        hide() {
            const { hide } = this.oakOption.lifetimes || {};
            hide && hide.call(this);
        },
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
                        // 小程序也支持传函数 https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/wxml-wxss.html
                        Object.assign(definitions, {
                            [prop]: Function,
                        });
                        break;
                    }
                    default: {
                        assert(false, 'properties只支持传string/number/object/array/boolean/function之一');
                    }
                }
            }
        );
    }
    return definitions;
}

export function createComponent<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends AsyncContext<ED>,
    FrontCxt extends SyncContext<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature>,
    FormedData extends Record<string, any>,
    IsList extends boolean,
    TData extends DataOption = {},
    TProperty extends DataOption = {},
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
            state: Record<string, any>;
            props: {
                oakId: string;
                oakPath: string;
                oakFilters: string;
                oakSorters: string;
                oakProjection?: string;
                oakParentEntity: string;
                oakFrom: string;
                oakActions: string;
                oakAutoUnmount: boolean;
                oakDisablePulldownRefresh: boolean;
            } & Record<string, any>;
            features: BasicFeatures<
                ED,
                Cxt,
                FrontCxt,
                AD & CommonAspectDict<ED, Cxt>
            > &
            FD;
            subscribed: Array<() => void>;
            oakOption: OakComponentOption<
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
            >;
        }
    >({
        externalClasses,
        // options,
        behaviors: [oakBehavior],
        data: typeof data !== 'function' ? Object.assign({}, data, {
            oakFullpath: '',
            oakLoading: !!option.entity && !!option.projection,
        }) : {
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
                    !this.state.oakDisablePulldownRefresh &&
                    !this.props.oakDisablePulldownRefresh
                ) {
                    await (onPullDownRefresh ? onPullDownRefresh.call(this) : this.refresh());
                }
                await wx.stopPullDownRefresh();
            },
    
            async onReachBottom() {
                if (
                    !this.state.oakLoadingMore &&
                    this.iAmThePage() &&
                    this.oakOption.isList
                ) {
                    await (onReachBottom ? onReachBottom.call(this) : this.loadMore());
                }
            },

            ...restMethods,
        },
        observers,
        pageLifetimes: {
            show() {
                // this.reRender();
                show && show.call(this);
            },
            hide() {
                hide && hide.call(this);
            },
        },
        lifetimes: {
            created() {
                this.oakOption = option;
                this.features = features;
                this.subscribed = [];
                created && created.call(this);
            },
            attached() {
                const i18nInstance = getI18nInstanceWechatMp();
                if (i18nInstance) {
                    (this as any).setState({
                        [CURRENT_LOCALE_KEY]: i18nInstance.currentLocale,
                        [CURRENT_LOCALE_DATA]: i18nInstance.translations,
                    });
                }
                if (option.entity) {
                    this.subscribed.push(
                        features.cache.subscribe(() => this.reRender())
                    );
                }
                if (option.features) {
                    option.features.forEach(
                        ele => this.subscribed.push(
                            features[ele].subscribe(
                                () => this.reRender()
                            )
                        )
                    );
                }
                attached && attached.call(this);
            },
            detached() {
                this.subscribed.forEach(
                    ele => ele()
                );
                this.state.oakFullpath &&
                    (this.iAmThePage() || this.props.oakAutoUnmount) &&
                    destroyNode.call(this as any);

                detached && detached.call(this);
            },
            ready() {
                if (typeof data === 'function') {
                    // ts的编译好像有问题，这里不硬写as过不去 
                    const data2 = (data as Function).call(this as any);
                    this.setData(data2);
                }
                ready && ready.call(this);
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