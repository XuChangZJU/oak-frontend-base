/// <reference path="../node_modules/@types/wechat-miniprogram/index.d.ts" />
import assert from 'assert';
import { CommonAspectDict } from 'oak-common-aspect';
import { Aspect, Context, DeduceSorterItem, EntityDict } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { BasicFeatures } from './features';
import { Feature } from './types/Feature';
import {
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


const OakProperties = {
    oakId: String,
    oakPath: String,
    oakFilters: String,
    oakSorters: String,
    oakIsPicker: Boolean,
    oakParentEntity: String,
    oakFrom: String,
    oakActions: String,
    oakAutoUnmount: Boolean,
    oakDisablePulldownRefresh: Boolean,
};

type EDD = EntityDict & BaseEntityDict;
type Cxt = AsyncContext<EntityDict & BaseEntityDict>;
type ADD = Record<string, Aspect<EDD, Cxt>>;
type FDD = Record<string, Feature>;
type FrontCxt = SyncContext<EntityDict & BaseEntityDict>;
const oakBehavior = Behavior<
    WechatMiniprogram.Component.DataOption,
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
            onPullDownRefresh: () => Promise<void>;
            onReachBottom: () => Promise<void>;
        },
    {
        state: Record<string, any>;
        props: {
            oakId?: string;
            oakPath?: string;
            oakFilters?: string;
            oakSorters?: string;
            oakIsPicker?: boolean;
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
            const assignProps = (
                data: Record<string, any>,
                property: string,
                type: String | Boolean | Number | Object
            ) => {
                if (data[property]) {
                    let value = data[property];
                    if (typeof data[property] === 'string' && type !== String) {
                        switch (type) {
                            case Boolean: {
                                value = new Boolean(data[property]);
                                break;
                            }
                            case Number: {
                                value = new Number(data[property]);
                                break;
                            }
                            case Object: {
                                value = JSON.parse(data[property]);
                                break;
                            }
                            default: {
                                assert(false);
                            }
                        }
                    }
                    Object.assign(this.props, {
                        [property]: value,
                    });
                }
            };
            if (properties) {
                for (const key in properties) {
                    if (query[key]) {
                        assignProps(query, key, properties[key]!);
                    } else if (this.data) {
                        assignProps(this.data, key, properties[key]!);
                    }
                }
            }
            for (const key in OakProperties) {
                if (query[key]) {
                    assignProps(
                        query,
                        key,
                        OakProperties[key as keyof typeof OakProperties]!
                    );
                } else if (this.data) {
                    assignProps(
                        this.data,
                        key,
                        OakProperties[key as keyof typeof OakProperties]!
                    );
                }
            }
            if (this.props.oakPath || (this.iAmThePage() && path)) {
                await onPathSet.call(this as any, this.oakOption as any);
            } else {
                this.reRender();
            }
        },

        async onPullDownRefresh() {
            if (
                !this.state.oakLoading &&
                this.iAmThePage() &&
                !this.state.oakDisablePulldownRefresh &&
                !this.props.oakDisablePulldownRefresh
            ) {
                await this.refresh();
            }
            await wx.stopPullDownRefresh();
        },

        async onReachBottom() {
            if (
                !this.state.oakLoadingMore &&
                this.iAmThePage() &&
                this.oakOption.isList
            ) {
                await this.loadMore();
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

        clean(path) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            return this.features.runningTree.clean(path2);
        },

        execute(action, path) {
            return execute.call(this as any, action, path);
        },

        getFreshValue(path?: string) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            return this.features.runningTree.getFreshValue(path2);
        },

        checkOperation(entity, action, filter, checkerTypes) {
            return this.features.cache.checkOperation(
                entity,
                action,
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

        setFilters(filters) {
            this.features.runningTree.setNamedFilters(
                this.state.oakFullpath,
                filters
            );
        },

        getFilters() {
            if (this.state.oakFullpath) {
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
        },

        addNamedFilter(namedFilter, refresh) {
            this.features.runningTree.addNamedFilter(
                this.state.oakFullpath,
                namedFilter,
                refresh
            );
        },

        removeNamedFilter(namedFilter, refresh) {
            this.features.runningTree.removeNamedFilter(
                this.state.oakFullpath,
                namedFilter,
                refresh
            );
        },

        removeNamedFilterByName(name, refresh) {
            this.features.runningTree.removeNamedFilterByName(
                this.state.oakFullpath,
                name,
                refresh
            );
        },

        setNamedSorters(namedSorters) {
            this.features.runningTree.setNamedSorters(
                this.state.oakFullpath,
                namedSorters
            );
        },

        getSorters() {
            if (this.state.oakFullpath) {
                const namedSorters = this.features.runningTree.getNamedSorters(
                    this.state.oakFullpath
                );
                const sorters = namedSorters
                    .map(({ sorter }) => {
                        if (typeof sorter === 'function') {
                            return sorter();
                        }
                        return sorter;
                    })
                    .filter((ele) => !!ele) as DeduceSorterItem<
                    EDD[keyof EDD]['Schema']
                >[];
                return sorters;
            }
        },

        getSorterByName(name) {
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
        },

        addNamedSorter(namedSorter, refresh) {
            this.features.runningTree.addNamedSorter(
                this.state.oakFullpath,
                namedSorter,
                refresh
            );
        },

        removeNamedSorter(namedSorter, refresh) {
            this.features.runningTree.removeNamedSorter(
                this.state.oakFullpath,
                namedSorter,
                refresh
            );
        },

        removeNamedSorterByName(name, refresh) {
            this.features.runningTree.removeNamedSorterByName(
                this.state.oakFullpath,
                name,
                refresh
            );
        },

        getPagination() {
            if (this.state.oakFullpath) {
                return this.features.runningTree.getPagination(
                    this.state.oakFullpath
                );
            }
        },

        setPageSize(pageSize) {
            this.features.runningTree.setPageSize(
                this.state.oakFullpath,
                pageSize
            );
        },

        setCurrentPage(currentPage) {
            assert(currentPage !== 0);

            if (this.state.oakEntity && this.state.oakFullpath) {
                this.features.runningTree.setCurrentPage(
                    this.state.oakFullpath,
                    currentPage
                );
            }
        },
        addItem(data, beforeExecute, afterExecute) {
            return this.features.runningTree.addItem(
                this.state.oakFullpath,
                data,
                beforeExecute,
                afterExecute
            );
        },
        updateItem(data, id, action, beforeExecute, afterExecute) {
            return this.features.runningTree.updateItem(
                this.state.oakFullpath,
                data,
                id,
                action,
                beforeExecute,
                afterExecute
            );
        },
        removeItem(id, beforeExecute, afterExecute) {
            return this.features.runningTree.removeItem(
                this.state.oakFullpath,
                id,
                beforeExecute,
                afterExecute
            );
        },
        recoverItem(id) {
            return this.features.runningTree.recoverItem(
                this.state.oakFullpath,
                id
            );
        },
        setId(id) {
            return this.features.runningTree.setId(this.state.oakFullpath, id);
        },
        unsetId() {
            return this.features.runningTree.unsetId(this.state.oakFullpath);
        },
        update(data, action, beforeExecute, afterExecute) {
            return this.features.runningTree.update(
                this.state.oakFullpath,
                data,
                action,
                beforeExecute,
                afterExecute
            );
        },
        remove(beforeExecute, afterExecute) {
            return this.features.runningTree.remove(
                this.state.oakFullpath,
                beforeExecute,
                afterExecute
            );
        },
    },
    observers: {
        oakPath(data) {
            if (data) {
                onPathSet.call(this as any, this.oakOption as any);
            }
        },
        oakId(data) {
            this.features.runningTree.setId(this.state.oakFullpath, data);
        },
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
            this.setData = (data, callback) => {
                setData.call(this, data, () => {
                    this.state = this.data;
                    this.props = this.data;
                    callback && callback.call(this);
                });
            };
        },
    },
});

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
        data,
        properties,
        methods,
        wechatMp,
        lifetimes,
        observers,
    } = option;
    const { attached, show, hide, created, detached, ready,  moved, error } = lifetimes || {};
    const { options, externalClasses } = wechatMp || {};

    return Component<
        WechatMiniprogram.Component.DataOption,
        WechatMiniprogram.Component.PropertyOption,
        WechatMiniprogram.Component.MethodOption,
        {
            state: Record<string, any>;
            props: {
                oakId: string;
                oakPath: string;
                oakFilters: string;
                oakSorters: string;
                oakIsPicker: boolean;
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
        data: Object.assign({}, data, {
            oakFullpath: '',
        }),
        properties: Object.assign(
            {},
            properties,
            OakProperties
        ) as WechatMiniprogram.Component.PropertyOption,
        methods: {
            ...methods,
        },
        observers: {
            ...observers,
        },
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