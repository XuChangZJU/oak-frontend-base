import { jsx as _jsx } from "react/jsx-runtime";
/// <reference path="../node_modules/@types/wechat-miniprogram/index.d.ts" />
import { assert } from 'oak-domain/lib/utils/assert';
import React from 'react';
import { withRouter, PullToRefresh } from './platforms/web';
import { get } from 'oak-domain/lib/utils/lodash';
import { onPathSet, reRender, refresh, loadMore, execute, destroyNode, } from './page.common';
class OakComponentBase extends React.PureComponent {
    setDisablePulldownRefresh(able) {
        this.setState({
            oakDisablePulldownRefresh: able,
        });
    }
    triggerEvent(name, detail, options) { }
    subEvent(type, callback) {
        this.features.eventBus.sub(type, callback);
    }
    unsubEvent(type, callback) {
        this.features.eventBus.unsub(type, callback);
    }
    pubEvent(type, options) {
        this.features.eventBus.pub(type, options);
    }
    unsubAllEvents(type) {
        this.features.eventBus.unsubAll(type);
    }
    save(key, item) {
        this.features.localStorage.save(key, item);
    }
    load(key) {
        return this.features.localStorage.load(key);
    }
    clear() {
        this.features.localStorage.clear();
    }
    resolveInput(input, keys) {
        const { currentTarget, target } = input;
        const { value } = Object.assign({}, currentTarget, target);
        const { dataset } = currentTarget;
        const result = {
            dataset,
            value,
        };
        if (keys) {
            keys.forEach((k) => Object.assign(result, {
                [k]: target[k],
            }));
        }
        return result;
    }
    setNotification(data) {
        this.features.notification.setNotification(data);
    }
    consumeNotification() {
        return this.features.notification.consumeNotification();
    }
    setMessage(data) {
        return this.features.message.setMessage(data);
    }
    consumeMessage() {
        return this.features.message.consumeMessage();
    }
    reRender(extra) {
        return reRender.call(this, this.oakOption, extra);
    }
    navigateTo(options, state, disableNamespace) {
        // 路由传入namespace
        return this.features.navigator.navigateTo(options, state, disableNamespace);
    }
    navigateBack(delta) {
        return this.features.navigator.navigateBack(delta);
    }
    redirectTo(options, state, disableNamespace) {
        return this.features.navigator.redirectTo(options, state, disableNamespace);
    }
    switchTab(options, state, disableNamespace) {
        return this.features.navigator.switchTab(options, state, disableNamespace);
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
    addItem(data, path) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        return this.features.runningTree.addItem(path2, data);
    }
    removeItem(id, path) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.removeItem(path2, id);
    }
    updateItem(data, id, action, path) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.updateItem(path2, data, id, action);
    }
    recoverItem(id, path) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.recoverItem(path2, id);
    }
    resetItem(id, path) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.resetItem(path2, id);
    }
    /* create<T extends keyof ED>(data: Omit<ED[T]['CreateSingle']['data'], 'id'>, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>) {
        this.features.runningTree.create(this.state.oakFullpath, data, beforeExecute, afterExecute);
    } */
    update(data, action, path) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.update(path2, data, action);
    }
    create(data, path) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.create(path2, data);
    }
    remove(path) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.remove(path2);
    }
    isCreation(path) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        return this.features.runningTree.isCreation(path2);
    }
    clean(path) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.clean(path2);
    }
    t(key, params) {
        return this.features.locales.t(key, params);
    }
    execute(action, messageProps, path) {
        return execute.call(this, action, path, messageProps);
    }
    isDirty(path) {
        return this.features.runningTree.isDirty(path || this.state.oakFullpath);
    }
    getFreshValue(path) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        return this.features.runningTree.getFreshValue(path2);
    }
    checkOperation(entity, action, data, filter, checkerTypes) {
        if (checkerTypes?.includes('relation')) {
            return this.features.relationAuth.checkRelation(entity, {
                action,
                data,
                filter,
            }) && this.features.cache.checkOperation(entity, action, data, filter, checkerTypes);
        }
        return this.features.cache.checkOperation(entity, action, data, filter, checkerTypes);
    }
    tryExecute(path) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        return this.features.runningTree.tryExecute(path2);
    }
    getOperations(path) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        return this.features.runningTree.getOperations(path2);
    }
    refresh() {
        return refresh.call(this);
    }
    loadMore() {
        return loadMore.call(this);
    }
    setId(id) {
        return this.features.runningTree.setId(this.state.oakFullpath, id);
    }
    unsetId() {
        return this.features.runningTree.unsetId(this.state.oakFullpath);
    }
    getId(path) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        return this.features.runningTree.getId(path2);
    }
    setFilters(filters, path) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.setNamedFilters(path2, filters);
    }
    setNamedFilters(filters, refresh, path) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.setNamedFilters(path2, filters, refresh);
    }
    getFilters(path) {
        if (this.state.oakFullpath) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            const namedFilters = this.features.runningTree.getNamedFilters(path2);
            const filters = namedFilters.map(({ filter }) => {
                if (typeof filter === 'function') {
                    return filter();
                }
                return filter;
            });
            return filters;
        }
    }
    getFilterByName(name, path) {
        if (this.state.oakFullpath) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            const filter = this.features.runningTree.getNamedFilterByName(path2, name);
            if (filter?.filter) {
                if (typeof filter.filter === 'function') {
                    return filter.filter();
                }
                return filter.filter;
            }
        }
    }
    addNamedFilter(namedFilter, refresh, path) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.addNamedFilter(path2, namedFilter, refresh);
    }
    removeNamedFilter(namedFilter, refresh, path) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.removeNamedFilter(path2, namedFilter, refresh);
    }
    removeNamedFilterByName(name, refresh, path) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.removeNamedFilterByName(path2, name, refresh);
    }
    setNamedSorters(namedSorters, refresh, path) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.setNamedSorters(path2, namedSorters, refresh);
    }
    getSorters(path) {
        if (this.state.oakFullpath) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            const namedSorters = this.features.runningTree.getNamedSorters(path2);
            const sorters = namedSorters
                .map(({ sorter }) => {
                if (typeof sorter === 'function') {
                    return sorter();
                }
                return sorter;
            })
                .filter((ele) => !!ele);
            return sorters;
        }
    }
    getSorterByName(name, path) {
        if (this.state.oakFullpath) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            const sorter = this.features.runningTree.getNamedSorterByName(path2, name);
            if (sorter?.sorter) {
                if (typeof sorter.sorter === 'function') {
                    return sorter.sorter();
                }
                return sorter.sorter;
            }
        }
    }
    addNamedSorter(namedSorter, refresh, path) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.addNamedSorter(path2, namedSorter, refresh);
    }
    removeNamedSorter(namedSorter, refresh, path) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.removeNamedSorter(path2, namedSorter, refresh);
    }
    removeNamedSorterByName(name, refresh, path) {
        const path2 = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        this.features.runningTree.removeNamedSorterByName(path2, name, refresh);
    }
    getPagination(path) {
        if (this.state.oakFullpath) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            return this.features.runningTree.getPagination(path2);
        }
    }
    setPageSize(pageSize, path) {
        if (this.state.oakFullpath) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            this.features.runningTree.setPageSize(path2, pageSize);
        }
    }
    setCurrentPage(currentPage, path) {
        assert(currentPage !== 0);
        if (this.state.oakEntity && this.state.oakFullpath) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            this.features.runningTree.setCurrentPage(path2, currentPage);
        }
    }
    subData(data, callback) {
        return this.features.subscriber.sub(data, callback);
    }
    unSubData(ids) {
        return this.features.subscriber.unsub(ids);
    }
}
function translateListeners(listeners) {
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
                    if (get(props, k) !== get(prevProps, k) ||
                        get(state, k) !== get(prevState, k)) {
                        changed = true;
                        break;
                    }
                }
                const prev = {};
                const next = {};
                if (changed) {
                    for (const k of keys) {
                        next[k] = get(props, k) === undefined
                            ? get(state, k)
                            : get(props, k);
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
export function createComponent(option, features) {
    const { data, methods, lifetimes, getRender, path, listeners } = option;
    const { fn } = translateListeners(listeners);
    class OakComponentWrapper extends OakComponentBase {
        features = features;
        oakOption = option;
        isReachBottom = false;
        subscribed = [];
        methodProps;
        defaultProperties;
        unmounted = false;
        constructor(props) {
            super(props);
            const methodProps = {
                setDisablePulldownRefresh: (able) => this.setDisablePulldownRefresh(able),
                t: (key, params) => this.t(key, params),
                execute: (action, messageProps, path) => {
                    return this.execute(action, messageProps, path);
                },
                isDirty: (path) => this.isDirty(path),
                aggregate: (aggregation) => {
                    return this.features.cache.aggregate(this.state.oakEntity, aggregation);
                },
                refresh: () => {
                    return this.refresh();
                },
                setNotification: (data) => {
                    return this.setNotification(data);
                },
                setMessage: (data) => {
                    return this.setMessage(data);
                },
                navigateTo: (options, state, disableNamespace) => {
                    return this.navigateTo(options, state, disableNamespace);
                },
                navigateBack: (delta) => {
                    return this.navigateBack(delta);
                },
                redirectTo: (options, state, disableNamespace) => {
                    return this.redirectTo(options, state, disableNamespace);
                },
                clean: (path) => {
                    return this.clean(path);
                },
                checkOperation: (entity, action, data, filter, checkerTypes) => {
                    return this.checkOperation(entity, action, data, filter, checkerTypes);
                }
            };
            Object.assign(methodProps, {
                addItem: (data, path) => {
                    return this.addItem(data, path);
                },
                removeItem: (id, path) => {
                    return this.removeItem(id, path);
                },
                updateItem: (data, id, action, path) => {
                    return this.updateItem(data, id, action, path);
                },
                setFilters: (filters, path) => {
                    return this.setFilters(filters, path);
                },
                setNamedFilters: (filters, refresh, path) => {
                    return this.setNamedFilters(filters, refresh, path);
                },
                addNamedFilter: (filter, refresh, path) => {
                    return this.addNamedFilter(filter, refresh, path);
                },
                removeNamedFilter: (filter, refresh, path) => {
                    return this.removeNamedFilter(filter, refresh, path);
                },
                removeNamedFilterByName: (name, refresh, path) => {
                    return this.removeNamedFilterByName(name, refresh, path);
                },
                setNamedSorters: (sorters, refresh, path) => {
                    return this.setNamedSorters(sorters, refresh, path);
                },
                addNamedSorter: (sorter, refresh, path) => {
                    return this.addNamedSorter(sorter, refresh, path);
                },
                removeNamedSorter: (sorter, refresh, path) => {
                    return this.removeNamedSorter(sorter, refresh, path);
                },
                removeNamedSorterByName: (name, refresh, path) => {
                    return this.removeNamedSorterByName(name, refresh, path);
                },
                setPageSize: (pageSize, path) => {
                    return this.setPageSize(pageSize, path);
                },
                setCurrentPage: (current, path) => {
                    return this.setCurrentPage(current, path);
                },
                loadMore: () => {
                    return this.loadMore();
                },
                recoverItem: (id, path) => {
                    return this.recoverItem(id, path);
                },
                resetItem: (id, path) => {
                    return this.resetItem(id, path);
                },
                setId: (id) => {
                    return this.setId(id);
                },
                unsetId: () => {
                    return this.unsetId();
                }
            });
            Object.assign(methodProps, {
                update: (data, action, path) => {
                    return this.update(data, action, path);
                },
                create: (data, path) => {
                    return this.create(data, path);
                },
                remove: (path) => {
                    return this.remove(path);
                },
                isCreation: (path) => {
                    return this.isCreation(path);
                }
            });
            if (methods) {
                for (const m in methods) {
                    Object.assign(this, {
                        [m]: (...args) => methods[m].call(this, ...args),
                    });
                    Object.assign(methodProps, {
                        [m]: (...args) => methods[m].call(this, ...args),
                    });
                }
            }
            const data2 = typeof data === 'function' ? data.call(this) : data;
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
            });
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
            // 现按屏幕宽度判断是否为mobile， 未来需要根据浏览器的内核判断吗？ by wkj
            return this.props.width === 'xs';
        }
        supportPullDownRefresh() {
            const { oakDisablePulldownRefresh = false } = this.props;
            const { oakDisablePulldownRefresh: disable2 } = this.state;
            return (this.isMobile() &&
                this.iAmThePage() &&
                !oakDisablePulldownRefresh &&
                !disable2);
        }
        scrollEvent = () => {
            this.checkReachBottom();
        };
        registerPageScroll() {
            window.addEventListener('scroll', this.scrollEvent);
        }
        unregisterPageScroll() {
            window.removeEventListener('scroll', this.scrollEvent);
        }
        checkReachBottom() {
            if (!this.supportPullDownRefresh()) {
                return;
            }
            const isCurrentReachBottom = document.body.scrollHeight -
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
            this.subscribed.push(features.locales.subscribe(() => this.reRender()));
            if (option.entity) {
                this.subscribed.push(features.cache.subscribe(() => this.reRender()));
            }
            lifetimes?.attached && lifetimes.attached.call(this);
            const { oakPath } = this.props;
            if (oakPath || path) {
                const pathState = onPathSet.call(this, this.oakOption);
                if (this.unmounted) {
                    return;
                }
                this.setState(pathState, () => {
                    lifetimes?.ready && lifetimes.ready.call(this);
                    lifetimes?.show && lifetimes.show.call(this);
                    const { oakFullpath } = this.state;
                    if (oakFullpath && !features.runningTree.checkIsModiNode(oakFullpath)) {
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
            /* if (option.entity) {
                if (oakPath || this.iAmThePage() && path) {
                    const pathState = onPathSet.call(this as any, this.oakOption as any);
                    if (this.unmounted) {
                        return;
                    }
                    this.setState(pathState as any, () => {
                        lifetimes?.ready && lifetimes.ready.call(this);
                        lifetimes?.show && lifetimes.show.call(this);

                        const { oakFullpath } = this.state;
                        if (oakFullpath && !features.runningTree.checkIsModiNode(oakFullpath)) {
                            this.refresh();
                        }
                        else {
                            this.reRender();
                        }
                    });
                }
            }
            else {
                // 无entity的结点此时直接调ready生命周期
                // 这是原来的代码逻辑，看不懂这里为什么要区分，如果oakPath没有设置可以渲染吗？  by Xc 20231013
                if (oakPath || this.iAmThePage() && path) {
                    const pathState = onPathSet.call(this as any, this.oakOption as any);
                    if (this.unmounted) {
                        return;
                    }

                    this.setState(pathState as any, () => {
                        lifetimes?.ready && lifetimes.ready.call(this);
                        lifetimes?.show && lifetimes.show.call(this);

                        const { oakFullpath } = this.state;
                        if (oakFullpath && !features.runningTree.checkIsModiNode(oakFullpath)) {
                            this.refresh();
                        }
                        else {
                            this.reRender();
                        }
                    });
                }
                else {
                    lifetimes?.ready && lifetimes.ready.call(this);
                    lifetimes?.show && lifetimes.show.call(this);
                    this.reRender();
                }
            } */
            if (option.features) {
                option.features.forEach(ele => {
                    if (typeof ele === 'string') {
                        this.subscribed.push(features[ele].subscribe(() => this.reRender()));
                    }
                    else {
                        assert(typeof ele === 'object');
                        const { feature, behavior } = ele;
                        this.subscribed.push(features[feature].subscribe(() => {
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
                        }));
                    }
                });
            }
        }
        componentWillUnmount() {
            this.subscribed.forEach(ele => ele());
            this.unregisterPageScroll();
            this.state.oakFullpath && (this.iAmThePage() || this.props.oakAutoUnmount) && destroyNode.call(this);
            lifetimes?.detached && lifetimes.detached.call(this);
            this.unmounted = true;
        }
        async componentDidUpdate(prevProps, prevState) {
            if (prevProps.oakPath !== this.props.oakPath) {
                // oakPath如果是用变量初始化，在这里再执行onPathSet，如果有entity的结点在此执行ready
                assert(this.props.oakPath && this.oakOption.entity);
                const pathState = onPathSet.call(this, this.oakOption);
                if (this.unmounted) {
                    return;
                }
                this.setState(pathState, () => {
                    if (prevProps.oakPath === undefined) {
                        // 如果每个页面都在oakFullpath形成后再渲染子结点，这个if感觉是不应该命中的
                        console.warn('发生了结点先形成再配置oakPath的情况，请检查代码修正');
                        lifetimes?.ready && lifetimes.ready.call(this);
                        lifetimes?.show && lifetimes.show.call(this);
                        const { oakFullpath } = this.state;
                        if (oakFullpath && !features.runningTree.checkIsModiNode(oakFullpath)) {
                            this.refresh();
                        }
                        else {
                            this.reRender();
                        }
                    }
                });
            }
            if (this.props.oakId !== prevProps.oakId) {
                assert(this.props.oakId); // 好像不可能把已有的id设空的界面需求吧
                this.setId(this.props.oakId);
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
        render() {
            const { oakPullDownRefreshLoading } = this.state;
            const Render = getRender.call(this);
            // 传入oakPath或page入口页 需要等待oakFullpath初始化完成
            if ((this.props.oakPath || path) &&
                !this.state.oakFullpath) {
                return null;
            }
            // option有entity，也需要等待oakFullpath初始化完成
            if (this.oakOption.entity && !this.state.oakFullpath) {
                return null;
            }
            if (this.supportPullDownRefresh()) {
                return (_jsx(PullToRefresh, { onRefresh: async () => {
                        this.pullDownRefresh = true;
                        await this.refresh();
                        this.pullDownRefresh = false;
                    }, refreshing: oakPullDownRefreshLoading, distanceToRefresh: DEFAULT_REACH_BOTTOM_DISTANCE, indicator: {
                        activate: this.t('common::ptrActivate', {
                            '#oakModule': 'oak-frontend-base',
                        }),
                        deactivate: this.t('common::ptrDeactivate', {
                            '#oakModule': 'oak-frontend-base',
                        }),
                        release: this.t('common::ptrRelease', {
                            '#oakModule': 'oak-frontend-base',
                        }),
                        finish: this.t('common::ptrFinish', {
                            '#oakModule': 'oak-frontend-base',
                        }),
                    }, children: _jsx(Render, { methods: this.methodProps, data: {
                            ...this.defaultProperties,
                            ...this.state,
                            ...this.props,
                        } }) }));
            }
            return (_jsx(Render, { methods: this.methodProps, data: {
                    ...this.defaultProperties,
                    ...this.state,
                    ...this.props,
                } }));
        }
    }
    ;
    return withRouter(OakComponentWrapper, option);
}
