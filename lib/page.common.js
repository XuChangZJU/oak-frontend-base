"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makePageMethods = exports.makeListComponentMethods = exports.makeCommonComponentMethods = exports.makeHiddenComponentMethods = void 0;
const assert_1 = __importDefault(require("assert"));
const types_1 = require("oak-domain/lib/types");
const Feature_1 = require("./types/Feature");
function makeHiddenComponentMethods() {
    return {
        subscribe() {
            if (!this.subscribed) {
                this.subscribed = (0, Feature_1.subscribe)(() => this.reRender());
            }
        },
        unsubscribe() {
            if (this.subscribed) {
                this.subscribed();
                this.subscribed = undefined;
            }
        },
    };
}
exports.makeHiddenComponentMethods = makeHiddenComponentMethods;
function makeCommonComponentMethods(features, exceptionRouterDict, formData) {
    return {
        sub(type, callback) {
            features.eventBus.sub(type, callback);
        },
        unsub(type, callback) {
            features.eventBus.unsub(type, callback);
        },
        pub(type, options) {
            features.eventBus.pub(type, options);
        },
        unsubAll(type) {
            features.eventBus.unsubAll(type);
        },
        save(key, item) {
            features.localStorage.save(key, item);
        },
        load(key) {
            return features.localStorage.load(key);
        },
        clear() {
            features.localStorage.clear();
        },
        setNotification(data) {
            features.notification.setNotification(data);
        },
        consumeNotification() {
            return features.notification.consumeNotification();
        },
        async reRender(extra) {
            if (this.state.oakEntity && this.state.oakFullpath) {
                const rows = features.runningTree.getFreshValue(this.state.oakFullpath);
                const dirty = features.runningTree.isDirty(this.state.oakFullpath);
                const oakLegalActions = [];
                if (this.state.newOakActions) {
                    for (const action of this.state.newOakActions) {
                        try {
                            await features.runningTree.testAction(this.state.oakFullpath, action);
                            oakLegalActions.push(action);
                        }
                        catch (e) {
                            if (e instanceof types_1.OakInputIllegalException) {
                                oakLegalActions.push(action);
                            }
                        }
                    }
                }
                const data = formData ? await formData.call(this, {
                    data: rows,
                    features,
                    props: this.props,
                    legalActions: oakLegalActions,
                }) : {};
                for (const k in data) {
                    if (data[k] === undefined) {
                        Object.assign(data, {
                            [k]: null,
                        });
                    }
                }
                Object.assign(data, { oakDirty: dirty });
                if (extra) {
                    Object.assign(data, extra);
                }
                Object.assign(data, {
                    oakLegalActions,
                });
                this.setState(data);
            }
            else {
                /**
                 * 这里的data属性为undefined，但声明不太好写，很难精准的判断这种情况
                 * 即使oakpage的entity属性为空也不行，有可能动态传入
                 */
                const data = formData ? await formData.call(this, {
                    features,
                    props: this.props,
                }) : {};
                if (extra) {
                    Object.assign(data, extra);
                }
                this.setState(data);
            }
        },
        callPicker(attr, params) {
            if (this.state.oakExecuting) {
                return;
            }
            const relation = features.cache.judgeRelation(this.state.oakEntity, attr);
            let subEntity;
            if (relation === 2) {
                subEntity = attr;
            }
            else {
                (0, assert_1.default)(typeof relation === 'string');
                subEntity = relation;
            }
            let url = `/pickers/${subEntity}?oakIsPicker=true&oakParentEntity=${this.state.oakEntity}&oakParent=${this.state.oakFullpath}&oakPath=${attr}`;
            for (const k in params) {
                url += `&${k}=${JSON.stringify(params[k])}`;
            }
            this.navigateTo({
                url,
            });
        },
        setForeignKey(id, goBackDelta = -1) {
            if (this.state.oakExecuting) {
                return;
            }
            const { oakIsPicker, oakParent, oakPath } = this.state;
            (0, assert_1.default)(oakIsPicker);
            features.runningTree.setForeignKey(oakParent, oakPath, id);
            if (goBackDelta !== 0) {
                this.navigateBack({
                    delta: goBackDelta,
                });
            }
        },
        addForeignKeys(ids, goBackDelta = -1) {
            if (this.state.oakExecuting) {
                return;
            }
            const { oakIsPicker, oakParent, oakPath } = this.state;
            (0, assert_1.default)(oakIsPicker);
            features.runningTree.addForeignKeys(oakParent, oakPath, ids);
            if (goBackDelta !== 0) {
                this.navigateBack({
                    delta: goBackDelta,
                });
            }
        },
        setUniqueForeignKeys(ids, goBackDelta = -1) {
            if (this.state.oakExecuting) {
                return;
            }
            const { oakIsPicker, oakParent, oakPath } = this.state;
            (0, assert_1.default)(oakIsPicker);
            features.runningTree.setUniqueForeignKeys(oakParent, oakPath, ids);
            if (goBackDelta !== 0) {
                this.navigateBack({
                    delta: goBackDelta,
                });
            }
        },
        toggleNode(nodeData, checked, path) {
            const fullpath = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            features.runningTree.toggleNode(fullpath, nodeData, checked);
        },
        async execute(action, legalExceptions, path) {
            if (this.state.oakExecuting) {
                return;
            }
            this.setState({
                oakExecuting: true,
                oakFocused: {},
            });
            try {
                const fullpath = path ? `${this.state.oakFullpath}.${path}` : this.state.oakFullpath;
                const result = await features.runningTree.execute(fullpath, action);
                this.setState({ oakExecuting: false });
                this.setNotification({
                    type: 'success',
                    content: '操作成功',
                });
                return result;
            }
            catch (err) {
                if (err instanceof types_1.OakException) {
                    if (err instanceof types_1.OakInputIllegalException) {
                        const attr = err.getAttributes()[0];
                        this.setState({
                            oakFocused: {
                                [attr]: true,
                            },
                            oakExecuting: false,
                        });
                        this.setNotification({
                            type: 'warning',
                            content: err.message,
                        });
                    }
                    else {
                        const { name } = err.constructor;
                        const handler = exceptionRouterDict[name];
                        if (legalExceptions && legalExceptions.includes(name)) {
                            // 如果调用时就知道有异常，直接抛出
                            this.setState({
                                oakExecuting: false,
                            });
                            throw err;
                        }
                        else if (handler) {
                            const { hidden, level, handler: fn, router, } = handler;
                            if (!hidden) {
                                this.setState({
                                    oakExecuting: false,
                                });
                                this.setNotification({
                                    type: level || 'warning',
                                    content: err.message,
                                });
                            }
                            else {
                                this.setState({
                                    oakExecuting: false,
                                });
                            }
                            if (fn) {
                                fn(err);
                                return;
                            }
                            else if (router) {
                                this.setState({
                                    oakExecuting: false,
                                });
                                this.navigateTo({
                                    url: router,
                                    exception: err.toString(),
                                });
                            }
                        }
                        else {
                            this.setState({
                                oakExecuting: false,
                            });
                            this.setNotification({
                                type: 'warning',
                                content: err.message,
                            });
                        }
                    }
                }
                else {
                    this.setState({
                        oakExecuting: false,
                    });
                    this.setNotification({
                        type: 'warning',
                        content: err.message,
                    });
                }
                throw err;
            }
        },
        resetUpdateData() {
            return features.runningTree.resetUpdateData(this.state.oakFullpath);
        },
        setAction(action, path) {
            const fullpath = path ? `${this.state.oakFullpath}.${path}` : this.state.oakFullpath;
            return features.runningTree.setAction(fullpath, action);
        },
        setUpdateData(attr, value) {
            if (this.state.oakExecuting) {
                return;
            }
            return features.runningTree.setUpdateData(this.state.oakFullpath, attr, value);
        },
    };
}
exports.makeCommonComponentMethods = makeCommonComponentMethods;
function makeListComponentMethods(features) {
    return {
        pushNode(path, options) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            features.runningTree.pushNode(path2, options || {});
        },
        removeNode(parent, path) {
            const path2 = parent
                ? `${this.state.oakFullpath}.${parent}`
                : this.state.oakFullpath;
            features.runningTree.removeNode(path2, path);
        },
        async getFilters() {
            const namedFilters = features.runningTree.getNamedFilters(this.state.oakFullpath);
            const filters = await Promise.all(namedFilters.map(({ filter }) => {
                if (typeof filter === 'function') {
                    return filter();
                }
                return filter;
            }));
            return filters;
        },
        async getFilterByName(name) {
            const filter = features.runningTree.getNamedFilterByName(this.state.oakFullpath, name);
            if (filter?.filter) {
                if (typeof filter.filter === 'function') {
                    return filter.filter();
                }
                return filter.filter;
            }
            return;
        },
        addNamedFilter(namedFilter, refresh = false) {
            return features.runningTree.addNamedFilter(this.state.oakFullpath, namedFilter, refresh);
        },
        removeNamedFilter(namedFilter, refresh = false) {
            return features.runningTree.removeNamedFilter(this.state.oakFullpath, namedFilter, refresh);
        },
        removeNamedFilterByName(name, refresh = false) {
            return features.runningTree.removeNamedFilterByName(this.state.oakFullpath, name, refresh);
        },
        setNamedSorters(namedSorters) {
            return features.runningTree.setNamedSorters(this.state.oakFullpath, namedSorters);
        },
        async getSorters() {
            const namedSorters = features.runningTree.getNamedSorters(this.state.oakFullpath);
            const sorters = (await Promise.all(namedSorters.map(({ sorter }) => {
                if (typeof sorter === 'function') {
                    return sorter();
                }
                return sorter;
            }))).filter((ele) => !!ele);
            return sorters;
        },
        async getSorterByName(name) {
            const sorter = features.runningTree.getNamedSorterByName(this.state.oakFullpath, name);
            if (sorter?.sorter) {
                if (typeof sorter.sorter === 'function') {
                    return sorter.sorter();
                }
                return sorter.sorter;
            }
            return;
        },
        addNamedSorter(namedSorter, refresh = false) {
            return features.runningTree.addNamedSorter(this.state.oakFullpath, namedSorter, refresh);
        },
        removeNamedSorter(namedSorter, refresh = false) {
            return features.runningTree.removeNamedSorter(this.state.oakFullpath, namedSorter, refresh);
        },
        removeNamedSorterByName(name, refresh = false) {
            return features.runningTree.removeNamedSorterByName(this.state.oakFullpath, name, refresh);
        },
        setFilters(filters) {
            return features.runningTree.setNamedFilters(this.state.oakFullpath, filters);
        },
    };
}
exports.makeListComponentMethods = makeListComponentMethods;
function makePageMethods(features, options, context) {
    return {
        async refresh() {
            if (this.state.oakEntity && this.state.oakFullpath) {
                this.setState({
                    oakLoading: true,
                });
                try {
                    await features.runningTree.refresh(this.state.oakFullpath);
                    this.setState({
                        oakLoading: false,
                    });
                    // this.setNotification({
                    //     type: 'success',
                    //     content: '访问成功',
                    // })
                }
                catch (err) {
                    this.setNotification({
                        type: 'error',
                        content: err.message,
                    });
                }
            }
        },
        async onPullDownRefresh() {
            await this.refresh();
        },
        async onReachBottom() {
            if (this.state.oakEntity && options.isList) {
                this.setState({
                    oakMoreLoading: true,
                });
                try {
                    await features.runningTree.loadMore(this.state.oakFullpath);
                    this.setState({
                        oakMoreLoading: false,
                    });
                }
                catch (err) {
                    this.setState({
                        oakMoreLoading: false,
                    });
                    this.setNotification({
                        type: 'error',
                        content: err.message,
                    });
                }
            }
        },
        async onLoad(pageOption) {
            return new Promise(async (resolve, reject) => {
                try {
                    const { oakId, oakEntity, oakPath, oakProjection, oakParent, oakSorters, oakFilters, oakIsPicker, oakFrom, oakActions, ...props } = this.props;
                    if (oakEntity || options.entity) {
                        (0, assert_1.default)(!(options.isList && oakId));
                        const filters = [];
                        if (oakFilters?.length > 0) {
                            // 这里在跳页面的时候用this.navigate应该可以限制传过来的filter的格式
                            const oakFilters2 = JSON.parse(oakFilters);
                            filters.push(...oakFilters2);
                        }
                        else if (options.filters) {
                            for (const ele of options.filters) {
                                const { filter, '#name': name } = ele;
                                filters.push({
                                    filter: typeof filter === 'function'
                                        ? () => filter({
                                            features,
                                            props: this.props,
                                            onLoadOptions: pageOption,
                                        })
                                        : filter,
                                    ['#name']: name,
                                });
                            }
                        }
                        let proj = oakProjection && JSON.parse(oakProjection);
                        if (!proj && options.projection) {
                            const { projection } = options;
                            proj =
                                typeof projection === 'function'
                                    ? () => projection({
                                        features,
                                        props: this.props,
                                        onLoadOptions: pageOption,
                                    })
                                    : projection;
                        }
                        let sorters = [];
                        if (oakSorters?.length > 0) {
                            // 这里在跳页面的时候用this.navigate应该可以限制传过来的sorter的格式
                            const oakSorters2 = JSON.parse(oakSorters);
                            sorters.push(...oakSorters2);
                        }
                        else if (options.sorters) {
                            for (const ele of options.sorters) {
                                const { sorter, '#name': name } = ele;
                                sorters.push({
                                    sorter: typeof sorter === 'function'
                                        ? () => sorter({
                                            features,
                                            props: this.props,
                                            onLoadOptions: pageOption,
                                        })
                                        : sorter,
                                    ['#name']: name,
                                });
                            }
                        }
                        const oakPath2 = oakPath || options.path;
                        (0, assert_1.default)(oakPath2);
                        const path2 = oakParent
                            ? `${oakParent}:${oakPath2}`
                            : oakPath2;
                        const node = await features.runningTree.createNode({
                            path: path2,
                            entity: (oakEntity || options.entity),
                            isList: options.isList,
                            isPicker: oakIsPicker,
                            projection: proj,
                            pagination: options.pagination,
                            filters,
                            sorters,
                            id: oakId,
                        });
                        // const oakFullpath = oakParent ? `${oakParent}.${oakPath || options.path}` : oakPath || options.path;
                        await this.setState({
                            oakEntity: node.getEntity(),
                            oakFullpath: path2,
                            oakFrom,
                            newOakActions: oakActions && JSON.parse(oakActions).length > 0
                                ? JSON.parse(oakActions)
                                : options.actions || [],
                        }, async () => {
                            context.setScene(path2);
                            this.refresh();
                            options.methods?.onLoad &&
                                await options.methods.onLoad.call(this, pageOption);
                            resolve();
                        });
                    }
                    else {
                        options.methods?.onLoad &&
                            await options.methods.onLoad.call(this, pageOption);
                        resolve();
                    }
                }
                catch (e) {
                    reject(e);
                }
            });
        },
    };
}
exports.makePageMethods = makePageMethods;
