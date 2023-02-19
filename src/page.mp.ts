/// <reference path="../node_modules/@types/wechat-miniprogram/index.d.ts" />
import assert from 'assert';
import { CommonAspectDict } from 'oak-common-aspect';
import { Aspect, EntityDict } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { BasicFeatures } from './features';
import { Feature } from './types/Feature';
import {
    DataOption,
    PropertyOption,
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
            const dataResolved: Record<string, any> = {};
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
                            case Object:
                            case Array: {
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
            if (properties) {
                for (const key in properties) {
                    const type2 = typeof properties[key] === 'object' ?
                        (properties[key]! as WechatMiniprogram.Component.FullProperty<WechatMiniprogram.Component.ShortProperty>).type :
                        (properties[key] as WechatMiniprogram.Component.ShortProperty);
                    if (query[key]) {
                        assignProps(query, key, type2!);
                    } else if (this.data) {
                        assignProps(this.data, key, type2!);
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

            if (Object.keys(dataResolved).length > 0) {
                this.setState(dataResolved);
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
                action, data, filter,
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

        setFilters(filters, path) {
            const path2 = path ? `${this.state.oakFullpath}.${path}` : this.state.oakFullpath;
            this.features.runningTree.setNamedFilters(
                path2,
                filters
            );
        },

        getFilters(path) {
            if (this.state.oakFullpath) {
                const path2 = path ? `${this.state.oakFullpath}.${path}` : this.state.oakFullpath;
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
                const path2 = path ? `${this.state.oakFullpath}.${path}` : this.state.oakFullpath;
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
            const path2 = path ? `${this.state.oakFullpath}.${path}` : this.state.oakFullpath;
            this.features.runningTree.addNamedFilter(
                path2,
                namedFilter,
                refresh
            );
        },

        removeNamedFilter(namedFilter, refresh, path) {
            const path2 = path ? `${this.state.oakFullpath}.${path}` : this.state.oakFullpath;
            this.features.runningTree.removeNamedFilter(
                path2,
                namedFilter,
                refresh
            );
        },

        removeNamedFilterByName(name, refresh, path) {
            const path2 = path ? `${this.state.oakFullpath}.${path}` : this.state.oakFullpath;
            this.features.runningTree.removeNamedFilterByName(
                path2,
                name,
                refresh
            );
        },

        setNamedSorters(namedSorters, path) {
            const path2 = path ? `${this.state.oakFullpath}.${path}` : this.state.oakFullpath;
            this.features.runningTree.setNamedSorters(
                path2,
                namedSorters
            );
        },

        getSorters(path) {
            if (this.state.oakFullpath) {
                const path2 = path ? `${this.state.oakFullpath}.${path}` : this.state.oakFullpath;
                const namedSorters = this.features.runningTree.getNamedSorters(path2);
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
                const path2 = path ? `${this.state.oakFullpath}.${path}` : this.state.oakFullpath;
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
            const path2 = path ? `${this.state.oakFullpath}.${path}` : this.state.oakFullpath;
            this.features.runningTree.addNamedSorter(path2, namedSorter, refresh);
        },

        removeNamedSorter(namedSorter, refresh, path) {
            const path2 = path ? `${this.state.oakFullpath}.${path}` : this.state.oakFullpath;
            this.features.runningTree.removeNamedSorter(
                path2,
                namedSorter,
                refresh
            );
        },

        removeNamedSorterByName(name, refresh, path) {
            const path2 = path ? `${this.state.oakFullpath}.${path}` : this.state.oakFullpath;
            this.features.runningTree.removeNamedSorterByName(path2, name, refresh);
        },

        getPagination(path) {
            if (this.state.oakFullpath) {
                const path2 = path ? `${this.state.oakFullpath}.${path}` : this.state.oakFullpath;
                return this.features.runningTree.getPagination(path2);
            }
        },

        setPageSize(pageSize, path) {
            const path2 = path ? `${this.state.oakFullpath}.${path}` : this.state.oakFullpath;
            this.features.runningTree.setPageSize(
                path2,
                pageSize
            );
        },

        setCurrentPage(currentPage, path) {
            assert(currentPage !== 0);

            if (this.state.oakEntity && this.state.oakFullpath) {
                const path2 = path ? `${this.state.oakFullpath}.${path}` : this.state.oakFullpath;
                this.features.runningTree.setCurrentPage(
                    path2,
                    currentPage
                );
            }
        },
        addItem(data, beforeExecute, afterExecute, path) {
            const path2 = path ? `${this.state.oakFullpath}.${path}` : this.state.oakFullpath;
            return this.features.runningTree.addItem(
                path2,
                data,
                beforeExecute,
                afterExecute
            );
        },
        updateItem(data, id, action, beforeExecute, afterExecute, path) {
            const path2 = path ? `${this.state.oakFullpath}.${path}` : this.state.oakFullpath;
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
            const path2 = path ? `${this.state.oakFullpath}.${path}` : this.state.oakFullpath;
            return this.features.runningTree.removeItem(
                path2,
                id,
                beforeExecute,
                afterExecute
            );
        },
        recoverItem(id, path) {
            const path2 = path ? `${this.state.oakFullpath}.${path}` : this.state.oakFullpath;
            return this.features.runningTree.recoverItem(
                path2,
                id
            );
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

        isCreation(path?: string) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            return this.features.runningTree.isCreation(path2);
        },

        update(data, action, beforeExecute, afterExecute, path) {
            const path2 = path ? `${this.state.oakFullpath}.${path}` : this.state.oakFullpath;
            return this.features.runningTree.update(
                path2,
                data,
                action,
                beforeExecute,
                afterExecute
            );
        },
        remove(beforeExecute, afterExecute, path) {
            const path2 = path ? `${this.state.oakFullpath}.${path}` : this.state.oakFullpath;
            return this.features.runningTree.remove(
                path2,
                beforeExecute,
                afterExecute
            );
        },
        async aggregate(aggregation) {
            return await this.features.cache.aggregate(this.state.oakEntity, aggregation);
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
                    this.features.runningTree.setId(this.state.oakFullpath, data);
                }
            }
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
    TProperty extends PropertyOption = {},
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
    const { attached, show, hide, created, detached, ready, moved, error } = lifetimes || {};
    const { options, externalClasses } = wechatMp || {};

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
        data: typeof data !== 'function' ? Object.assign({}, data, {
            oakFullpath: '',
        }) : {
            oakFullpath: '',
        },
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