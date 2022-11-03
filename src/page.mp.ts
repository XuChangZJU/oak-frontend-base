/// <reference path="../node_modules/@types/wechat-miniprogram/index.d.ts" />
import assert from 'assert';
import { CommonAspectDict } from 'oak-common-aspect';
import { Aspect, Context, DeduceSorterItem, EntityDict } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { BasicFeatures } from './features';
import { Feature, subscribe as FeactureSubscribe } from './types/Feature';
import {
    OakCommonComponentMethods,
    OakComponentOption,
    OakListComponentMethods,
    OakHiddenComponentMethods,
} from './types/Page';

import {
    onPathSet, reRender, refresh,
    loadMore, execute, callPicker, setUpdateData, setMultiAttrUpdateData,
    destroyNode,
} from './page.common';
import { MessageProps } from './types/Message';
import { NotificationProps } from './types/Notification';
import { CURRENT_LOCALE_DATA, CURRENT_LOCALE_KEY, getI18nInstanceWechatMp } from './platforms/wechatMp/i18n';


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
type Cxt = Context<EntityDict & BaseEntityDict>;
type ADD = Record<string, Aspect<EDD, Cxt>>;
type FDD = Record<string, Feature>;
const oakBehavior = Behavior<
    WechatMiniprogram.Component.DataOption,
    WechatMiniprogram.Component.PropertyOption,
    OakCommonComponentMethods<EDD, keyof EDD> & OakListComponentMethods<EDD, keyof EDD> & OakHiddenComponentMethods &{
        iAmThePage: () => boolean;
        setState: (data: Record<string, any>, callback: () => void) => void;
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
        features: BasicFeatures<EDD, Cxt, ADD & CommonAspectDict<EDD, Cxt>> & FDD;
        subscribed: (() => void) | undefined;
        option: OakComponentOption<
            EDD,
            keyof EDD,
            Cxt,
            ADD,
            FDD,
            EDD[keyof EDD]['Selection']['data'],
            Record<string, any>,
            boolean,
            Record<string, any>,
            Record<string, any>,
            Record<string, Function>
        >
    }>({
        methods: {
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
                if (pages[pages.length - 1] === this as any) {
                    return true;
                }
                return false;
            },

            subscribe() {
                if (!this.subscribed) {
                    this.subscribed = FeactureSubscribe(() => this.reRender());
                }
            },

            unsubscribe() {
                if (this.subscribed) {
                    this.subscribed();
                    this.subscribed = undefined;
                }
            },

            setState(data: Record<string, any>, callback: () => void) {
                this.setData(data, () => {
                    this.state = this.data;
                    callback && callback.call(this);
                });
            },

            reRender() {
                return reRender.call(this as any, this.option as any);
            },

            async onLoad(query: Record<string, any>) {
                /**
                 * 小程序以props传递数据，和以页面间参数传递数据的处理不一样，都在这里处理
                 * 目前处理的还不是很完善，在实际处理中再做
                 */
                const { properties, path } = this.option;
                const assignProps = (data: Record<string, any>, property: string, type: String | Boolean | Number | Object) => {
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
                        }
                        else if (this.data) {
                            assignProps(this.data, key, properties[key]!);
                        }
                    }
                }
                for (const key in OakProperties) {
                    if (query[key]) {
                        assignProps(query, key, OakProperties[key as keyof typeof OakProperties]!);
                    }
                    else if (this.data) {
                        assignProps(this.data, key, OakProperties[key as keyof typeof OakProperties]!);
                    }
                }
                if (this.props.oakPath || (this.iAmThePage() && path)) {
                    await onPathSet.call(this as any, this.option as any);
                }
                else {
                    this.reRender();
                }
            },

            async onPullDownRefresh() {
                if (!this.state.oakLoading && this.iAmThePage()) {
                    await this.refresh();
                }
                await wx.stopPullDownRefresh();
            },

            async onReachBottom() {
                if (!this.state.oakLoadingMore && this.iAmThePage() && this.option.isList) {
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

            navigateBack(option) {
                return this.features.navigator.navigateBack(option?.delta);
            },

            navigateTo(option, state) {
                const { url, ...rest } = option;

                return this.features.navigator.navigateTo(url, {
                    ...state,
                    ...rest,
                });
            },

            redirectTo(option, state) {
                const { url, ...rest } = option;

                return this.features.navigator.redirectTo(url, {
                    ...state,
                    ...rest,
                });
            },

            addOperation(operation, beforeExecute, afterExecute, path) {
                const path2 = path ? `${this.state.oakFullpath}.${path}` : this.state.oakFullpath;
                return this.features.runningTree.addOperation(path2, operation, beforeExecute, afterExecute);
            },
        
            cleanOperation(path) {
                const path2 = path ? `${this.state.oakFullpath}.${path}` : this.state.oakFullpath;
                return this.features.runningTree.clean(path2);
            },

            callPicker(attr: string, params: Record<string, any> = {}) {
                return callPicker.call(this as any, attr, params);
            },
        
            execute(operation) {
                return execute.call(this as any, operation);
            },
        
            getFreshValue(path?: string) {
                const path2 = path? `${this.state.oakFullpath}.${path}` : this.state.oakFullpath;
                return this.features.runningTree.getFreshValue(path2) as Promise<EDD[keyof EDD]['Schema'][] | EDD[keyof EDD]['Schema'] | undefined>;
            },
        
            checkOperation(entity, action, filter, checkerTypes) {
                return this.features.cache.checkOperation(entity, action, filter, checkerTypes);
            },
        
            tryExecute(path?: string) {
                const path2 = path ? `${this.state.oakFullpath}.${path}` : this.state.oakFullpath;
                return this.features.runningTree.tryExecute(path2);
            },
        
            getOperations<T extends keyof EDD>(path?: string): Promise<EDD[T]['Operation'][] | undefined> {
                const path2 = path ? `${this.state.oakFullpath}.${path}` : this.state.oakFullpath;
                return this.features.runningTree.getOperations(path2);
            },
        
            refresh() {
                return refresh.call(this as any);
            },
        
            setUpdateData(attr: string, data: any) {
                return setUpdateData.call(this as any, attr, data);
            },
        
            setMultiAttrUpdateData(data: Record<string, any>) {
                return setMultiAttrUpdateData.call(this as any, data);
            },
        
            loadMore() {
                return loadMore.call(this as any);
            },
        
            setId(id: string) {
                return this.features.runningTree.setId(this.state.oakFullpath, id);
            },
        
            unsetId() {
                return this.features.runningTree.unsetId(this.state.oakFullpath);
            },
        
            getId() {
                return this.features.runningTree.getId(this.state.oakFullpath);
            },
        
            async setFilters(filters) {
                await this.features.runningTree.setNamedFilters(
                    this.state.oakFullpath,
                    filters
                );
            },
        
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
            },
        
            async getFilterByName(name: string) {
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
        
            async addNamedFilter(namedFilter, refresh) {
                await this.features.runningTree.addNamedFilter(
                    this.state.oakFullpath,
                    namedFilter,
                    refresh
                );
            },
        
            async removeNamedFilter(namedFilter, refresh) {
                await this.features.runningTree.removeNamedFilter(
                    this.state.oakFullpath,
                    namedFilter,
                    refresh
                );
            },
        
            async removeNamedFilterByName(name, refresh) {
                await this.features.runningTree.removeNamedFilterByName(
                    this.state.oakFullpath,
                    name,
                    refresh
                );
            },
        
            async setNamedSorters(namedSorters) {
                await this.features.runningTree.setNamedSorters(
                    this.state.oakFullpath,
                    namedSorters
                );
            },
        
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
                    ).filter((ele) => !!ele) as DeduceSorterItem<EDD[keyof EDD]['Schema']>[];
                    return sorters;
                }
            },
        
            async getSorterByName(name) {
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
        
            async addNamedSorter(namedSorter, refresh) {
                await this.features.runningTree.addNamedSorter(
                    this.state.oakFullpath,
                    namedSorter,
                    refresh
                );
            },
        
            async removeNamedSorter(namedSorter, refresh) {
                await this.features.runningTree.removeNamedSorter(
                    this.state.oakFullpath,
                    namedSorter,
                    refresh
                );
            },
        
            async removeNamedSorterByName(name, refresh) {
                await this.features.runningTree.removeNamedSorterByName(
                    this.state.oakFullpath,
                    name,
                    refresh
                );
            },
        
            getPagination() {
                if (this.state.oakFullpath) {
                    return this.features.runningTree.getPagination(this.state.oakFullpath);
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
        },
        observers: {
            async oakPath(data) {
                if (data) {
                    await onPathSet.call(this as any, this.option as any);
                }
            },
            async oakId(data) {
                await this.setId(data);
            }
        },
        pageLifetimes: {
            show() {
                const { show } = this.option.lifetimes || {};
                this.subscribe();
                this.reRender();
                show && show.call(this);
            },
            hide() {
                const { hide } = this.option.lifetimes || {};
                this.unsubscribe();
                hide && hide.call(this);
            }
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
            attached() {
                const { attached } = this.option.lifetimes || {};
                const i18nInstance = getI18nInstanceWechatMp();
                if (i18nInstance) {
                    (this as any).setState({
                        [CURRENT_LOCALE_KEY]: i18nInstance.currentLocale,
                        [CURRENT_LOCALE_DATA]: i18nInstance.translations,
                    });
                }
                attached && attached.call(this);
            },
            detached() {
                this.unsubscribe();
                this.state.oakFullpath && (this.iAmThePage() || this.props.oakAutoUnmount) && destroyNode.call(this as any);
                const { detached } = this.option.lifetimes || {};
                detached && detached.call(this);
            },
            ready() {
                const { ready } = this.option.lifetimes || {};
                ready && ready.call(this);
            },
            moved() {
                const { moved } = this.option.lifetimes || {};
                moved && moved.call(this);
            },
            error(err: Error) {
                const { error } = this.option.lifetimes || {};
                error && error.call(this, err);
            }
        },
    })

export function createComponent<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature>,
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
) {
    const {
        data,
        properties,
        methods,
        wechatMp,
        lifetimes,
        observers,
    } = option;
    const { attached, show, hide, created, detached, ...restLifetimes } = lifetimes || {};
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
            features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD;
            subscribed: (() => void) | undefined;
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
            >;
        }>({
            externalClasses,
            options,
            behaviors: [oakBehavior],
            data: Object.assign({}, data, {
                oakFullpath: '',
            }),
            properties: Object.assign({}, properties, OakProperties),
            methods: {
                ...methods,
            },
            observers: {
                ...observers,
            },
            pageLifetimes: {
                show() {
                    this.subscribe();
                    this.reRender();
                    show && show.call(this);
                },
                hide() {
                    this.unsubscribe();
                    hide && hide.call(this);
                }
            },
            lifetimes: {
                created() {
                    this.option = option;
                    this.features = features;
                    created && created.call(this);
                },
            },
        });
}