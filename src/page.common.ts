import { assert } from 'oak-domain/lib/utils/assert';
import { CommonAspectDict } from 'oak-common-aspect';
import {
    Aspect,
    Context,
    DeduceSorterItem,
    EntityDict,
    OakException,
    OakInputIllegalException,
} from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { BasicFeatures } from './features';
import { ExceptionHandler } from './types/ExceptionRoute';
import { Feature, subscribe } from './types/Feature';
import { NamedFilterItem, NamedSorterItem } from './types/NamedCondition';
import {
    OakCommonComponentMethods,
    OakComponentData,
    OakComponentOption,
    OakComponentProperties,
    OakHiddenComponentMethods,
    OakListComponentMethods,
    OakComponentOnlyMethods,
    OakPageMethods,
    OakPageOption,
} from './types/Page';

export type ComponentProps<
    TProperty extends WechatMiniprogram.Component.PropertyOption
    > = WechatMiniprogram.Component.PropertyOptionToData<
        OakComponentProperties & TProperty
    >;

export type ComponentData<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    FormedData extends WechatMiniprogram.Component.DataOption,
    TData extends WechatMiniprogram.Component.DataOption
    > = TData & FormedData & OakComponentData<ED, T>;

export type ComponentThisType<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    FormedData extends WechatMiniprogram.Component.DataOption,
    IsList extends boolean,
    TData extends WechatMiniprogram.Component.DataOption,
    TProperty extends WechatMiniprogram.Component.PropertyOption,
    TMethod extends WechatMiniprogram.Component.MethodOption
    > = ThisType<
        {
            state: ComponentData<ED, T, FormedData, TData>;
            props: ComponentProps<TProperty>;
            setState: (data: any, callback?: () => void) => Promise<void>;
            triggerEvent: <DetailType = any>(
                name: string,
                detail?: DetailType,
                options?: WechatMiniprogram.Component.TriggerEventOption
            ) => void;
        } & TMethod &
        OakCommonComponentMethods<ED, T> &
        OakHiddenComponentMethods &
        (IsList extends true ? OakListComponentMethods<ED, T> : {})
    >;

export function makeHiddenComponentMethods<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    FormedData extends WechatMiniprogram.Component.DataOption,
    IsList extends boolean,
    TData extends WechatMiniprogram.Component.DataOption,
    TProperty extends WechatMiniprogram.Component.PropertyOption,
    TMethod extends WechatMiniprogram.Component.MethodOption
>(): OakHiddenComponentMethods &
    ComponentThisType<ED, T, FormedData, IsList, TData, TProperty, TMethod> {
    return {
        subscribe() {
            if (!this.subscribed) {
                this.subscribed = subscribe(() => this.reRender());
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

export function makeCommonComponentMethods<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>,
    FormedData extends WechatMiniprogram.Component.DataOption,
    Proj extends ED[T]['Selection']['data'],
    IsList extends boolean,
    TData extends WechatMiniprogram.Component.DataOption = {},
    TProperty extends WechatMiniprogram.Component.PropertyOption = {},
    TMethod extends WechatMiniprogram.Component.MethodOption = {}
>(
    features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD,
    exceptionRouterDict: Record<string, ExceptionHandler>,
    formData: OakPageOption<
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
    >['formData']
): Omit<
    OakCommonComponentMethods<ED, T>,
    'navigateTo' | 'navigateBack' | 'resolveInput' | 'redirectTo' | 't'
> &
    ComponentThisType<ED, T, FormedData, IsList, TData, TProperty, TMethod> {
    return {
        sub(type: string, callback: Function) {
            features.eventBus.sub(type, callback);
        },

        unsub(type: string, callback: Function) {
            features.eventBus.unsub(type, callback);
        },

        pub(type: string, options?: any) {
            features.eventBus.pub(type, options);
        },

        unsubAll(type: string) {
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

        setMessage(data) {
            features.message.setMessage(data);
        },

        consumeMessage() {
            return features.message.consumeMessage();
        },

        async reRender(extra) {
            if (this.state.oakEntity && this.state.oakFullpath) {
                const rows = features.runningTree.getFreshValue(
                    this.state.oakFullpath
                );

                const dirty = features.runningTree.isDirty(
                    this.state.oakFullpath
                );

                const oakLegalActions = [];
                if (this.state.newOakActions) {
                    for (const action of this.state.newOakActions) {
                        try {
                            await features.runningTree.testAction(
                                this.state.oakFullpath,
                                action
                            );
                            oakLegalActions.push(action);
                        } catch (e) {
                            if (e instanceof OakInputIllegalException) {
                                oakLegalActions.push(action);
                            }
                        }
                    }
                }

                const data: Record<string, any> = formData
                    ? await formData.call(this, {
                          data: rows as any,
                          features,
                          props: this.props,
                          legalActions: oakLegalActions,
                      })
                    : {};
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
            } else {
                /**
                 * 这里的data属性为undefined，但声明不太好写，很难精准的判断这种情况
                 * 即使oakpage的entity属性为空也不行，有可能动态传入
                 */
                const data: Record<string, any> = formData
                    ? await formData.call(this, {
                          features,
                          props: this.props,
                      } as any)
                    : {};
                if (extra) {
                    Object.assign(data, extra);
                }
                this.setState(data);
            }
        },

        callPicker(attr: string, params: Record<string, any>) {
            if (this.state.oakExecuting) {
                return;
            }

            const relation = features.cache.judgeRelation(
                this.state.oakEntity,
                attr
            );
            let subEntity: string;
            if (relation === 2) {
                subEntity = attr;
            } else {
                assert(typeof relation === 'string');
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

        async setForeignKey(id: string, goBackDelta: number = -1) {
            if (this.state.oakExecuting) {
                return;
            }
            const { oakIsPicker, oakParent, oakPath } = this.state;
            assert(oakIsPicker);
            await features.runningTree.setForeignKey(oakParent, oakPath, id);

            if (goBackDelta !== 0) {
                this.navigateBack({
                    delta: goBackDelta,
                });
            }
        },

        async addForeignKeys(ids: string[], goBackDelta: number = -1) {
            if (this.state.oakExecuting) {
                return;
            }
            const { oakIsPicker, oakParent, oakPath } = this.state;
            assert(oakIsPicker);
            await features.runningTree.addForeignKeys(oakParent, oakPath, ids);

            if (goBackDelta !== 0) {
                this.navigateBack({
                    delta: goBackDelta,
                });
            }
        },

        async setUniqueForeignKeys(ids: string[], goBackDelta: number = -1) {
            if (this.state.oakExecuting) {
                return;
            }
            const { oakIsPicker, oakParent, oakPath } = this.state;
            assert(oakIsPicker);
            await features.runningTree.setUniqueForeignKeys(oakParent, oakPath, ids);

            if (goBackDelta !== 0) {
                this.navigateBack({
                    delta: goBackDelta,
                });
            }
        },

        async toggleNode(
            nodeData: Record<string, any>,
            checked: boolean,
            path?: string
        ) {
            const fullpath = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            await features.runningTree.toggleNode(fullpath, nodeData, checked);
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
                const fullpath = path
                    ? `${this.state.oakFullpath}.${path}`
                    : this.state.oakFullpath;
                const result = await features.runningTree.execute(
                    fullpath,
                    action
                );
                this.setState({ oakExecuting: false });
                this.setMessage({
                    type: 'success',
                    content: '操作成功',
                });
                return result;
            } catch (err) {
                if (err instanceof OakException) {
                    if (err instanceof OakInputIllegalException) {
                        const attr = err.getAttributes()[0];
                        this.setState({
                            oakFocused: {
                                [attr]: true,
                            },
                            oakExecuting: false,
                        });
                        this.setMessage({
                            type: 'warning',
                            content: err.message,
                        });
                    } else {
                        const { name } = err.constructor;
                        const handler = exceptionRouterDict[name];
                        if (legalExceptions && legalExceptions.includes(name)) {
                            // 如果调用时就知道有异常，直接抛出
                            this.setState({
                                oakExecuting: false,
                            });
                            throw err;
                        } else if (handler) {
                            const {
                                hidden,
                                level,
                                handler: fn,
                                router,
                                disableNamespace,
                            } = handler;
                            if (!hidden) {
                                this.setState({
                                    oakExecuting: false,
                                });
                                this.setMessage({
                                    type: level || 'warning',
                                    content: err.message,
                                });
                            } else {
                                this.setState({
                                    oakExecuting: false,
                                });
                            }
                            if (fn) {
                                fn(err);
                                return;
                            } else if (router) {
                                this.setState({
                                    oakExecuting: false,
                                });
                                this.navigateTo(
                                    {
                                        url: router,
                                    },
                                    {
                                        exception: err.toString(),
                                    },
                                    disableNamespace
                                );
                            }
                        } else {
                            this.setState({
                                oakExecuting: false,
                            });
                            this.setMessage({
                                type: 'warning',
                                content: err.message,
                            });
                        }
                    }
                } else {
                    this.setState({
                        oakExecuting: false,
                    });
                    this.setMessage({
                        type: 'warning',
                        content: (err as Error).message,
                    });
                }
                throw err;
            }
        },

        resetUpdateData() {
            return features.runningTree.resetUpdateData(this.state.oakFullpath);
        },

        async setAction(action, path) {
            const fullpath = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            return features.runningTree.setAction(fullpath, action);
        },

        async setUpdateData(attr, value) {
            if (this.state.oakExecuting) {
                return;
            }
            return features.runningTree.setUpdateData(
                this.state.oakFullpath,
                attr,
                value
            );
        },
    };
}

export function makeComponentOnlyMethods<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>,
    FormedData extends WechatMiniprogram.Component.DataOption,
    Proj extends ED[T]['Selection']['data'],
    IsList extends boolean,
    TData extends WechatMiniprogram.Component.DataOption = {},
    TProperty extends WechatMiniprogram.Component.PropertyOption = {},
    TMethod extends WechatMiniprogram.Component.MethodOption = {}
>(
    formData: OakPageOption<
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
    >['formData'],
    entity: T | undefined,
    actions: ED[T]['Action'][] | undefined,
): OakComponentOnlyMethods &
    ComponentThisType<ED, T, FormedData, IsList, TData, TProperty, TMethod> {
    return {
        onPropsChanged(params) {
            const path2 = params.hasOwnProperty('path')
                ? params.path!
                : this.props.oakPath;
            const parent2 = params.hasOwnProperty('parent')
                ? params.parent!
                : this.props.oakParent;
            const oakFullpath2 = `${parent2 || ''}${
                parent2 && path2 ? '.' : ''
            }${path2 || ''}`;

            if (oakFullpath2) {
                if (oakFullpath2 !== this.state.oakFullpath) {
                    this.setState({
                        oakFullpath: oakFullpath2,
                        oakEntity: entity as string,
                    });
                    typeof formData === 'function' && this.reRender();
                }
            }
        },
        registerReRender() {
            const { oakPath, oakParent } = this.props;
            if (oakParent || oakPath) {
                const oakFullpath = `${oakParent || ''}${
                    oakParent && oakPath ? '.' : ''
                }${oakPath || ''}`;
                this.setState(
                    {
                        oakFullpath,
                        oakEntity: entity as any,
                    },
                    () => {
                        typeof formData === 'function' &&
                            this.reRender.call(this);
                    }
                );
            } else {
                typeof formData === 'function' && this.reRender.call(this);
            }
        },
        setOakActions() {
            const { oakActions } = this.props;
            this.setState({
                newOakActions:
                    oakActions && JSON.parse(oakActions).length > 0
                        ? JSON.parse(oakActions)
                        : actions || [],
            });
        },
    };
}

export function makeListComponentMethods<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>,
    FormedData extends WechatMiniprogram.Component.DataOption,
    IsList extends boolean,
    TData extends WechatMiniprogram.Component.DataOption = {},
    TProperty extends WechatMiniprogram.Component.PropertyOption = {},
    TMethod extends WechatMiniprogram.Component.MethodOption = {}
>(
    features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD
): OakListComponentMethods<ED, T> &
    ComponentThisType<ED, T, FormedData, IsList, TData, TProperty, TMethod> {
    return {
        async pushNode(path, options) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            await features.runningTree.pushNode(path2, options || {});
        },

        async removeNode(parent, path) {
            const path2 = parent
                ? `${this.state.oakFullpath}.${parent}`
                : this.state.oakFullpath;
            await features.runningTree.removeNode(path2, path);
        },

        async getFilters() {
            if (this.state.oakFullpath) {
                const namedFilters = features.runningTree.getNamedFilters(
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

        async getFilterByName(name) {
            if (this.state.oakFullpath) {
                const filter = features.runningTree.getNamedFilterByName(
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

        async addNamedFilter(namedFilter, refresh = false) {
            await features.runningTree.addNamedFilter(
                this.state.oakFullpath,
                namedFilter,
                refresh
            );
        },

        async removeNamedFilter(namedFilter, refresh = false) {
            await features.runningTree.removeNamedFilter(
                this.state.oakFullpath,
                namedFilter,
                refresh
            );
        },

        async removeNamedFilterByName(name, refresh = false) {
            await features.runningTree.removeNamedFilterByName(
                this.state.oakFullpath,
                name,
                refresh
            );
        },

        async setNamedSorters(namedSorters) {
            await features.runningTree.setNamedSorters(
                this.state.oakFullpath,
                namedSorters
            );
        },

        async getSorters() {
            if (this.state.oakFullpath) {
                const namedSorters = features.runningTree.getNamedSorters(
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
                ).filter((ele) => !!ele) as DeduceSorterItem<ED[T]['Schema']>[];
                return sorters;
            }
        },

        async getSorterByName(name) {
            if (this.state.oakFullpath) {
                const sorter = features.runningTree.getNamedSorterByName(
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

        async addNamedSorter(namedSorter, refresh = false) {
            await features.runningTree.addNamedSorter(
                this.state.oakFullpath,
                namedSorter,
                refresh
            );
        },

        async removeNamedSorter(namedSorter, refresh = false) {
            await features.runningTree.removeNamedSorter(
                this.state.oakFullpath,
                namedSorter,
                refresh
            );
        },

        async removeNamedSorterByName(name, refresh = false) {
            await features.runningTree.removeNamedSorterByName(
                this.state.oakFullpath,
                name,
                refresh
            );
        },

        async setFilters(filters) {
            await features.runningTree.setNamedFilters(
                this.state.oakFullpath,
                filters
            );
        },

        getPagination() {
            if (this.state.oakFullpath) {
                return features.runningTree.getPagination(this.state.oakFullpath);
            }
        },

        async setPageSize(pageSize: number, refresh = true) {
            features.runningTree.setPageSize(
                this.state.oakFullpath,
                pageSize,
            );
            if (refresh) {
                this.refresh();
            }
        },

        async setCurrentPage(currentPage: number) {
            assert(currentPage !== 0);

            if (this.state.oakEntity && this.state.oakFullpath) {
                this.setState({
                    oakLoading: true,
                });
                try {
                    await features.runningTree.setCurrentPage(
                        this.state.oakFullpath,
                        currentPage
                    );
                    this.setState({
                        oakLoading: false,
                    });
                } catch (err) {
                    this.setState({
                        oakLoading: false,
                    });
                    this.setMessage({
                        type: 'error',
                        content: (err as Error).message,
                    });
                }
            }
        },
    };
}

export function makePageMethods<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>,
    FormedData extends WechatMiniprogram.Component.DataOption,
    Proj extends ED[T]['Selection']['data'],
    IsList extends boolean,
    TData extends WechatMiniprogram.Component.DataOption = {},
    TProperty extends WechatMiniprogram.Component.PropertyOption = {},
    TMethod extends WechatMiniprogram.Component.MethodOption = {}
>(
    features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD,
    options: OakPageOption<
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
    >
): OakPageMethods &
    ComponentThisType<ED, T, FormedData, IsList, TData, TProperty, TMethod> {
    return {
        async refresh(pullDownRefresh: boolean) {
            // pullDownRefresh 如果是下拉刷新的话， 传入一个标识， 直接使用oakLoading页面会出现闪动
            if (this.state.oakEntity && this.state.oakFullpath) {
                this.setState({
                    oakLoading: true,
                    oakPullDownRefreshLoading: pullDownRefresh,
                });
               
                try {
                    await features.runningTree.refresh(this.state.oakFullpath);
                    this.setState({
                        oakLoading: false,
                        oakPullDownRefreshLoading: false,
                    });
                } catch (err) {
                    this.setMessage({
                        type: 'error',
                        content: (err as Error).message,
                    });
                }
            }
        },

        async onPullDownRefresh() {
            await this.refresh(true);
        },

        async loadMore() {
            if (
                this.state.oakEntity &&
                this.state.oakFullpath &&
                options.isList
            ) {
                this.setState({
                    oakMoreLoading: true,
                });
                try {
                    await features.runningTree.loadMore(this.state.oakFullpath);
                    this.setState({
                        oakMoreLoading: false,
                    });
                } catch (err) {
                    this.setState({
                        oakMoreLoading: false,
                    });
                    this.setMessage({
                        type: 'error',
                        content: (err as Error).message,
                    });
                }
            }
        },

        async onReachBottom() {
            await this.loadMore();
        },

        async onLoad(pageOption) {
            return new Promise(async (resolve, reject) => {
                try {
                    const {
                        oakId,
                        oakEntity,
                        oakPath,
                        oakProjection,
                        oakParent,
                        oakSorters,
                        oakFilters,
                        oakIsPicker,
                        oakFrom,
                        oakActions,
                        ...props
                    } = this.props;
                    if (oakEntity || options.entity) {
                        assert(!(options.isList && oakId));
                        const filters: NamedFilterItem<ED, T>[] = [];
                        if (oakFilters?.length > 0) {
                            // 这里在跳页面的时候用this.navigate应该可以限制传过来的filter的格式
                            const oakFilters2 = JSON.parse(oakFilters);
                            filters.push(...oakFilters2);
                        } else if (options.filters) {
                            for (const ele of options.filters) {
                                const { filter, '#name': name } = ele;
                                filters.push({
                                    filter:
                                        typeof filter === 'function'
                                            ? () =>
                                                  filter({
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
                                    ? () =>
                                          projection({
                                              features,
                                              props: this.props,
                                              onLoadOptions: pageOption,
                                          })
                                    : projection;
                        }
                        let sorters: NamedSorterItem<ED, T>[] = [];
                        if (oakSorters?.length > 0) {
                            // 这里在跳页面的时候用this.navigate应该可以限制传过来的sorter的格式
                            const oakSorters2 = JSON.parse(oakSorters);
                            sorters.push(...oakSorters2);
                        } else if (options.sorters) {
                            for (const ele of options.sorters) {
                                const { sorter, '#name': name } = ele;
                                sorters.push({
                                    sorter:
                                        typeof sorter === 'function'
                                            ? () =>
                                                  sorter({
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
                        assert(
                            oakPath2,
                            '没有正确的path信息，请检查是否配置正确'
                        );
                        const path2 = oakParent
                            ? `${oakParent}:${oakPath2}`
                            : oakPath2;
                        const node = await features.runningTree.createNode({
                            path: path2,
                            entity: (oakEntity || options.entity) as T,
                            isList: options.isList,
                            isPicker: oakIsPicker,
                            projection: proj,
                            pagination: options.pagination,
                            filters,
                            sorters,
                            id: oakId,
                        });
                        await this.setState(
                            {
                                oakEntity: node.getEntity(),
                                oakFullpath: path2,
                                oakFrom,
                            },
                            async () => {
                                this.setOakActions();
                                this.refresh();
                                options.methods?.onLoad &&
                                    (await options.methods.onLoad.call(
                                        this,
                                        pageOption
                                    ));
                                resolve();
                            }
                        );
                    } else {
                        options.methods?.onLoad &&
                            (await options.methods.onLoad.call(
                                this,
                                pageOption
                            ));

                        resolve();
                    }
                } catch (e) {
                    reject(e);
                }
            });
        },
    };
}
