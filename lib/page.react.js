"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComponent = void 0;
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const assert_1 = require("oak-domain/lib/utils/assert");
const react_1 = tslib_1.__importDefault(require("react"));
const lodash_1 = require("oak-domain/lib/utils/lodash");
const page_common_1 = require("./page.common");
class OakComponentBase extends react_1.default.PureComponent {
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
        return page_common_1.reRender.call(this, this.oakOption, extra);
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
        return page_common_1.execute.call(this, action, path, messageProps);
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
        return page_common_1.refresh.call(this);
    }
    loadMore() {
        return page_common_1.loadMore.call(this);
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
        (0, assert_1.assert)(currentPage !== 0);
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
                    if ((0, lodash_1.get)(props, k) !== (0, lodash_1.get)(prevProps, k) ||
                        (0, lodash_1.get)(state, k) !== (0, lodash_1.get)(prevState, k)) {
                        changed = true;
                        break;
                    }
                }
                const prev = {};
                const next = {};
                if (changed) {
                    for (const k of keys) {
                        next[k] = (0, lodash_1.get)(props, k) === undefined
                            ? (0, lodash_1.get)(state, k)
                            : (0, lodash_1.get)(props, k);
                        prev[k] = (0, lodash_1.get)(prevProps, k) === undefined
                            ? (0, lodash_1.get)(prevState, k)
                            : (0, lodash_1.get)(prevProps, k);
                    }
                    listeners && listeners[obs] && listeners[obs].call(this, prev, next);
                }
            }
        },
    };
}
function createComponent(option, features) {
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
            // 现按屏幕宽度判断是否为mobile
            return this.props.width === 'xs';
        }
        supportPullDownRefresh() {
            const { oakDisablePulldownRefresh = false } = this.props;
            return (this.isMobile() &&
                this.iAmThePage() &&
                !oakDisablePulldownRefresh);
        }
        async componentDidMount() {
            this.subscribed.push(features.locales.subscribe(() => this.reRender()));
            if (option.entity) {
                this.subscribed.push(features.cache.subscribe(() => this.reRender()));
            }
            lifetimes?.attached && lifetimes.attached.call(this);
            const { oakPath } = this.props;
            if (oakPath || path) {
                const pathState = page_common_1.onPathSet.call(this, this.oakOption);
                if (this.unmounted) {
                    return;
                }
                this.setState(pathState, () => {
                    lifetimes?.ready && lifetimes.ready.call(this);
                    lifetimes?.show && lifetimes.show.call(this);
                    const { oakFullpath } = this.state;
                    if (oakFullpath && !features.runningTree.checkIsModiNode(oakFullpath)) {
                        page_common_1.refresh.call(this, true);
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
                option.features.forEach(ele => {
                    if (typeof ele === 'string') {
                        this.subscribed.push(features[ele].subscribe(() => this.reRender()));
                    }
                    else {
                        (0, assert_1.assert)(typeof ele === 'object');
                        const { feature, behavior } = ele;
                        this.subscribed.push(features[feature].subscribe(() => {
                            switch (behavior) {
                                case 'reRender': {
                                    this.reRender();
                                    return;
                                }
                                default: {
                                    (0, assert_1.assert)(behavior === 'refresh');
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
            this.state.oakFullpath && (this.iAmThePage() || this.props.oakAutoUnmount) && page_common_1.destroyNode.call(this);
            lifetimes?.detached && lifetimes.detached.call(this);
            this.unmounted = true;
        }
        async componentDidUpdate(prevProps, prevState) {
            if (prevProps.oakPath !== this.props.oakPath) {
                // oakPath如果是用变量初始化，在这里再执行onPathSet，如果有entity的结点在此执行ready
                (0, assert_1.assert)(this.props.oakPath && this.oakOption.entity);
                const pathState = page_common_1.onPathSet.call(this, this.oakOption);
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
                            page_common_1.refresh.call(this, true);
                        }
                        else {
                            this.reRender();
                        }
                    }
                });
            }
            if (this.props.oakId !== prevProps.oakId) {
                (0, assert_1.assert)(this.props.oakId); // 好像不可能把已有的id设空的界面需求吧
                this.setId(this.props.oakId);
            }
            fn && fn.call(this, prevProps, prevState);
        }
        render() {
            const Render = getRender.call(this);
            // 传入oakPath或page入口页 需要等待oakFullpath初始化完成
            if ((this.props.oakPath || path) && !this.state.oakFullpath) {
                return null;
            }
            // option有entity，也需要等待oakFullpath初始化完成
            if (this.oakOption.entity && !this.state.oakFullpath) {
                return null;
            }
            return ((0, jsx_runtime_1.jsx)(Render, { methods: this.methodProps, data: {
                    ...this.defaultProperties,
                    ...this.state,
                    ...this.props,
                } }));
        }
    }
    ;
    return OakComponentWrapper;
}
exports.createComponent = createComponent;
