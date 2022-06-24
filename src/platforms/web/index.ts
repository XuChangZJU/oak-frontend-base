import {
    Aspect,
    OakInputIllegalException,
    Context,
    EntityDict,
    OakException,
    DeduceSorterItem,
    DeduceOperation,
    SelectRowShape,
} from 'oak-domain/lib/types';
import { AspectDict } from 'oak-common-aspect/src/aspectDict';
import { Feature } from '../../types/Feature';
import { initialize as init } from '../../initialize.dev';
import { Pagination } from '../../types/Pagination';
import { BasicFeatures } from '../../features';
import assert from 'assert';
import { assign } from 'lodash';
import { ExceptionHandler } from '../../types/ExceptionRoute';
import { NamedFilterItem, NamedSorterItem } from '../../types/NamedCondition';
import { CreateNodeOptions } from '../../features/runningTree';
import React from 'react';
import {
    NavigateFunction,
} from 'react-router-dom';

export type RowSelected<
    ED extends EntityDict,
    T extends keyof ED,
    Proj extends ED[T]['Selection']['data'] = Required<
        ED[T]['Selection']['data']
    >
> = SelectRowShape<ED[T]['Schema'], Proj> | undefined;

export type OakComponentOption<
    ED extends EntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD & AspectDict<ED, Cxt>>>,
    FormedData extends React.ComponentState,
    IsList extends boolean
> = {
    entity: T;
    isList: IsList;
    formData: (options: {
        data: IsList extends true ? RowSelected<ED, T>[] : RowSelected<ED, T>;
        features: BasicFeatures<ED, Cxt, AD & AspectDict<ED, Cxt>> & FD;
        params?: Record<string, any>;
        legalActions?: string[];
    }) => Promise<FormedData>;
    render: () => JSX.Element;
};

export interface OakPageOption<
    ED extends EntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD & AspectDict<ED, Cxt>>>,
    Proj extends ED[T]['Selection']['data'],
    FormedData extends React.ComponentState,
    IsList extends boolean
> {
    entity: T;
    path: string;
    isList: IsList;
    projection?:
        | Proj
        | ((options: {
              features: BasicFeatures<ED, Cxt, AD & AspectDict<ED, Cxt>> & FD;
              rest: Record<string, any>;
              onLoadOptions: Record<string, string | undefined>;
          }) => Promise<Proj>);
    parent?: string;
    append?: boolean;
    pagination?: Pagination;
    filters?: Array<{
        filter:
            | ED[T]['Selection']['filter']
            | ((options: {
                  features: BasicFeatures<ED, Cxt, AD & AspectDict<ED, Cxt>> &
                      FD;
                  rest: Record<string, any>;
                  onLoadOptions: Record<string, string | undefined>;
              }) => Promise<ED[T]['Selection']['filter']>);
        '#name'?: string;
    }>;
    sorters?: Array<{
        sorter:
            | DeduceSorterItem<ED[T]['Schema']>
            | ((options: {
                  features: BasicFeatures<ED, Cxt, AD & AspectDict<ED, Cxt>> &
                      FD;
                  rest: Record<string, any>;
                  onLoadOptions: Record<string, string | undefined>;
              }) => Promise<DeduceSorterItem<ED[T]['Schema']>>);
        '#name'?: string;
    }>;
    actions?: ED[T]['Action'][];
    formData: (options: {
        data: IsList extends true
            ? RowSelected<ED, T, Proj>[]
            : RowSelected<ED, T, Proj>;
        features: BasicFeatures<ED, Cxt, AD & AspectDict<ED, Cxt>> & FD;
        params?: Record<string, any>;
    }) => Promise<FormedData>;
    ns?: T | T[];
    render: () => JSX.Element;
}

export type OakPageData = {
    oakFullpath: string;
    oakExecuting: boolean;
    oakFocused: object;
    oakDirty: boolean;
    oakError: {
        type: 'warning' | 'error' | 'success' | 'primary';
        msg: string;
    };
    oakLegalActions: string[];
    oakLoading: boolean;
    oakMoreLoading: boolean;
    newOakActions: string[];
};

export type OakComponentProperties = {
    oakEntity: StringConstructor;
    oakPath: StringConstructor;
    oakParent: StringConstructor;
};

// export type OakPageProperties = {
//     oakEntity: StringConstructor;
//     oakPath: StringConstructor;
//     oakParent: StringConstructor;
//     oakId: StringConstructor;
//     oakProjection: StringConstructor;
//     oakFilters: StringConstructor;
//     oakSorters: StringConstructor;
//     oakIsPicker: BooleanConstructor;
//     oakFrom: StringConstructor;
//     oakParentEntity: StringConstructor;
//     oakActions: StringConstructor;
//     newOakActions: ArrayConstructor;
// };

export type OakPageProps = {
    oakEntity: string;
    oakPath: string;
    oakParent: string;
    oakId: string;
    oakProjection: string;
    oakFilters: string;
    oakSorters: string;
    oakIsPicker: boolean;
    oakFrom: string;
    oakParentEntity: string;
    oakActions: string;
    newOakActions: string[];
};

export type OakNavigateToParameters<ED extends EntityDict, T extends keyof ED> = {
    oakId?: string;
    oakEntity?: T;
    oakPath?: string;
    oakParent?: string;
    oakProjection?: ED[T]['Selection']['data'];
    oakSorters?: Array<NamedSorterItem<ED, T>>;
    oakFilters?: Array<NamedFilterItem<ED, T>>;
    oakIsPicker?: boolean;
    oakActions?: Array<ED[T]['Action']>;
    [k: string]: any;
};

export type OakComponentMethods<ED extends EntityDict, T extends keyof ED> = {
    subscribed?: () => void;
    subscribe: () => void;
    unsubscribe: () => void;
    reRender: (extra?: Record<string, any>) => Promise<void>;
    pushNode: (
        path?: string,
        options?: Pick<
            CreateNodeOptions<ED, keyof ED>,
            'updateData' | 'beforeExecute' | 'afterExecute'
        >
    ) => void;
    removeNode: (parent: string, path: string) => void;
    setUpdateData: (attr: string, input: any) => void;
    callPicker: (attr: string, params: Record<string, any>) => void;
    setFilters: (filters: NamedFilterItem<ED, T>[]) => void;
    getFilters: () => Promise<ED[T]['Selection']['filter'][]>;
    getFilterByName: (
        name: string
    ) => Promise<ED[T]['Selection']['filter']> | undefined;
    addNamedFilter: (filter: NamedFilterItem<ED, T>, refresh?: boolean) => void;
    removeNamedFilter: (
        filter: NamedFilterItem<ED, T>,
        refresh?: boolean
    ) => void;
    removeNamedFilterByName: (name: string, refresh?: boolean) => void;
    setNamedSorters: (sorters: NamedSorterItem<ED, T>[]) => void;
    getSorters: () => Promise<ED[T]['Selection']['sorter']>;
    getSorterByName: (
        name: string
    ) => Promise<DeduceSorterItem<ED[T]['Schema']> | undefined>;
    addNamedSorter: (filter: NamedSorterItem<ED, T>, refresh?: boolean) => void;
    removeNamedSorter: (
        filter: NamedSorterItem<ED, T>,
        refresh?: boolean
    ) => void;
    removeNamedSorterByName: (name: string, refresh?: boolean) => void;
    navigateTo: <T2 extends keyof ED>(
        options: OakNavigateToParameters<ED, T2>
    ) => void;
    resetUpdateData: () => void;
    execute: (
        action: ED[T]['Action'],
        legalExceptions?: Array<string>
    ) => Promise<
        | DeduceOperation<ED[T]['Schema']>
        | DeduceOperation<ED[T]['Schema']>[]
        | undefined
    >;
    // t(key: string, params?: object): string;
};

export type ComponentOnPropsChangeOption = {
    path?: string;
    parent?: string;
};

export type OakComponentOnlyMethods = {
    onPropsChanged: (options: ComponentOnPropsChangeOption) => Promise<void>;
};

export type OakPageMethods<
    ED extends EntityDict,
    T extends keyof ED
> = OakComponentMethods<ED, T> & {
    refresh: (extra?: any) => Promise<void>;
    onPullDownRefresh: () => Promise<void>;
    onReachBottom: () => Promise<void>;
    onLoad: (options: Record<string, string | undefined>) => Promise<void>;
    setForeignKey: (id: string, goBackDelta?: number) => Promise<void>;
    onForeignKeyPicked: (touch: React.BaseSyntheticEvent) => void;
};

export type OakComponentInstanceProperties<
    ED extends EntityDict,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD & AspectDict<ED, Cxt>>>
> = {
    features: BasicFeatures<ED, Cxt, AD & AspectDict<ED, Cxt>> & FD;
    isReady: boolean;
};

export type OakPageInstanceProperties<
    ED extends EntityDict,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD & AspectDict<ED, Cxt>>>
> = OakComponentInstanceProperties<ED, Cxt, AD, FD>;

export type DataOption = Record<string, any>;
export type MethodOption = Record<string, Function>;
export type IAnyObject = Record<string, any>;

export interface Method<
    P extends DataOption,
    D extends DataOption,
    M extends MethodOption,
    TIsPage extends boolean = false
> {
    /** 组件的方法，包括事件响应函数和任意的自定义方法，关于事件响应函数的使用 */
    methods: M & Partial<React.ComponentLifecycle<P, D>>;
}

export type Instance<
    TProps extends DataOption,
    TData extends DataOption,
    TMethod extends Partial<MethodOption>,
    TCustomInstanceProperty extends IAnyObject = {},
    TIsPage extends boolean = false
> = React.Component<TProps, TData> &
    TMethod &
    TCustomInstanceProperty & {
        /** 组件数据，**包括内部数据和属性值** */
        data: TData;
    };

export type OakWebOptions<
    TProps extends DataOption,
    TData extends DataOption,
    TMethod extends MethodOption,
    InherentMethods extends MethodOption,
    InherentData extends DataOption,
    InherentInstanceProperty extends IAnyObject,
    TCustomInstanceProperty extends IAnyObject = {},
    TIsPage extends boolean = false
> = Partial<TData> &
    Partial<Method<TProps, TData, TMethod, TIsPage>> &
    Partial<React.ComponentLifecycle<TProps, TData>> &
    ThisType<
        Instance<
            TProps,
            TData & InherentData,
            TMethod & InherentMethods,
            TCustomInstanceProperty & InherentInstanceProperty,
            TIsPage
        >
    >;

export type MakeOakPage<
    ED extends EntityDict,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD & AspectDict<ED, Cxt>>>
> = <
    T extends keyof ED,
    P extends DataOption, //props
    D extends DataOption,
    M extends MethodOption,
    Proj extends ED[T]['Selection']['data'],
    IsList extends boolean,
    IS extends IAnyObject = {},
    FormedData extends React.ComponentState = {}
>(
    options: OakPageOption<ED, T, Cxt, AD, FD, Proj, FormedData, IsList> &
        ThisType<
            Instance<
                P & OakPageProps,
                D & OakPageData,
                M & OakPageMethods<ED, T>,
                IS & OakPageInstanceProperties<ED, Cxt, AD, FD>,
                true
            >
        >,
    componentOptions: OakWebOptions<
        P,
        D,
        M,
        OakPageMethods<ED, T>,
        OakPageData & FormedData,
        OakPageInstanceProperties<ED, Cxt, AD, FD>,
        IS,
        true
    >
) => React.ComponentType<any>;

export type MakeOakComponent<
    ED extends EntityDict,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD & AspectDict<ED, Cxt>>>
> = <
    T extends keyof ED,
    P extends DataOption,
    D extends DataOption,
    M extends MethodOption,
    IsList extends boolean,
    IS extends IAnyObject = {},
    FormedData extends React.ComponentState = {}
>(
    options: OakComponentOption<ED, T, Cxt, AD, FD, FormedData, IsList> &
        ThisType<
            Instance<
                P & OakPageProps,
                D & OakPageData,
                M & OakPageMethods<ED, T>,
                IS & OakPageInstanceProperties<ED, Cxt, AD, FD>,
                true
            >
        >,
    componentOptions: OakWebOptions<
        P,
        D,
        M,
        OakPageMethods<ED, T>,
        OakPageData & FormedData,
        OakPageInstanceProperties<ED, Cxt, AD, FD>,
        IS,
        false
    >
) => React.ComponentType<any>;

export type OakComponentData = {
    // entity: keyof EntityDict;
} & OakPageData;

export function makeComponentMethods<
    ED extends EntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD & AspectDict<ED, Cxt>>>,
    FormedData extends React.ComponentState,
    IsList extends boolean
>(
    features: BasicFeatures<ED, Cxt, AD & AspectDict<ED, Cxt>> & FD,
    doSubscribe: ReturnType<typeof init>['subscribe'],
    formData: OakComponentOption<
        ED,
        T,
        Cxt,
        AD,
        FD,
        FormedData,
        IsList
    >['formData'],
    exceptionRouterDict: Record<string, ExceptionHandler>
): OakComponentMethods<ED, T> &
    ThisType<
        Instance<
            OakPageProps,
            OakComponentData & OakPageProps,
            OakPageMethods<ED, T>,
            OakComponentInstanceProperties<ED, Cxt, AD, FD>,
            false
        >
    > {
    return {
        subscribe() {
            if (!this.subscribed) {
                this.subscribed = doSubscribe(() => this.reRender());
            }
        },

        unsubscribe() {
            if (this.subscribed) {
                this.subscribed();
                this.subscribed = undefined;
            }
        },

        async reRender(extra) {
            if (this.state.oakFullpath) {
                const rows = await features.runningTree.getFreshValue(
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

                const data = await formData.call(this, {
                    data: rows as any,
                    features,
                    params: this.state,
                    legalActions: oakLegalActions,
                });
                for (const k in data) {
                    if (data[k] === undefined) {
                        assign(data, {
                            [k]: null,
                        });
                    }
                }
                assign(data, { oakDirty: dirty });

                if (extra) {
                    assign(data, extra);
                }

                assign(data, {
                    oakLegalActions,
                });
                this.setState(data);
            }
        },

        pushNode(path, options) {
            const path2 = path
                ? `${this.state.oakFullpath}.${path}`
                : this.state.oakFullpath;
            features.runningTree.pushNode(path2, options || {});
        },

        removeNode(parent, path) {
            features.runningTree.removeNode(parent, path);
        },

        async getFilters() {
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
        },

        async getFilterByName(name) {
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
            return;
        },

        addNamedFilter(namedFilter, refresh = false) {
            return features.runningTree.addNamedFilter(
                this.state.oakFullpath,
                namedFilter,
                refresh
            );
        },

        removeNamedFilter(namedFilter, refresh = false) {
            return features.runningTree.removeNamedFilter(
                this.state.oakFullpath,
                namedFilter,
                refresh
            );
        },

        removeNamedFilterByName(name, refresh = false) {
            return features.runningTree.removeNamedFilterByName(
                this.state.oakFullpath,
                name,
                refresh
            );
        },

        setNamedSorters(namedSorters) {
            return features.runningTree.setNamedSorters(
                this.state.oakFullpath,
                namedSorters
            );
        },

        async getSorters() {
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
        },

        async getSorterByName(name) {
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
            return;
        },

        addNamedSorter(namedSorter, refresh = false) {
            return features.runningTree.addNamedSorter(
                this.state.oakFullpath,
                namedSorter,
                refresh
            );
        },

        removeNamedSorter(namedSorter, refresh = false) {
            return features.runningTree.removeNamedSorter(
                this.state.oakFullpath,
                namedSorter,
                refresh
            );
        },

        removeNamedSorterByName(name, refresh = false) {
            return features.runningTree.removeNamedSorterByName(
                this.state.oakFullpath,
                name,
                refresh
            );
        },

        resetUpdateData() {
            return features.runningTree.resetUpdateData(this.state.oakFullpath);
        },

        setUpdateData(attr, value) {
            if (this.state.oakExecuting) {
                return;
            }
            return features.runningTree.setUpdateData(
                this.state.oakFullpath,
                attr,
                value
            );
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
            let url = `/pages/pickers/${subEntity}/index?oakIsPicker=true&oakParentEntity=${this.state.oakEntity}&oakParent=${this.data.oakFullpath}&oakPath=${attr}`;
            for (const k in params) {
                url += `&${k}=${JSON.stringify(params[k])}`;
            }
            return this.props.navigate(url);
        },

        setFilters(filters) {
            return features.runningTree.setNamedFilters(
                this.state.oakFullpath,
                filters
            );
        },

        navigateTo(options) {
            const { url, state, ...props } = options;
            let url2 = url.includes('?')
                ? url.concat(`&oakFrom=${this.state.oakFullpath}`)
                : url.concat(`?oakFrom=${this.state.oakFullpath}`);

            for (const param in props) {
                const param2 = param as unknown as keyof typeof props;
                url2 += `&${param}=${
                    typeof props[param2] === 'string'
                        ? props[param2]
                        : JSON.stringify(props[param2])
                }`;
            }
            return this.props.navigate(url2, {
                state,
            });
        },

        async execute(action, legalExceptions) {
            if (this.state.oakExecuting) {
                return;
            }
            this.setState({
                oakExecuting: true,
                oakFocused: {},
            });
            try {
                const result = await features.runningTree.execute(
                    this.state.oakFullpath,
                    action
                );
                this.setState({ oakExecuting: false });
                this.setState({
                    oakError: {
                        type: 'success',
                        msg: '操作成功',
                    },
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
                            oakError: {
                                type: 'warning',
                                msg: err.message,
                            },
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
                            } = handler;
                            if (!hidden) {
                                this.setState({
                                    oakExecuting: false,
                                    oakError: {
                                        type: level!,
                                        msg: err.message,
                                    },
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
                                this.navigateTo({
                                    url: router,
                                });
                            }
                        } else {
                            this.setState({
                                oakExecuting: false,
                                oakError: {
                                    type: 'warning',
                                    msg: err.message,
                                },
                            });
                        }
                    }
                } else {
                    this.setState({
                        oakExecuting: false,
                        oakError: {
                            type: 'error',
                            msg: (err as Error).message,
                        },
                    });
                }
                throw err;
            }
        },
    };
}

export function createPageOptions<
    ED extends EntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD & AspectDict<ED, Cxt>>>,
    Proj extends ED[T]['Selection']['data'],
    FormedData extends React.ComponentState,
    IsList extends boolean
>(
    options: OakPageOption<ED, T, Cxt, AD, FD, Proj, FormedData, IsList>,
    doSubscribe: ReturnType<typeof init>['subscribe'],
    features: BasicFeatures<ED, Cxt, AD & AspectDict<ED, Cxt>> & FD,
    exceptionRouterDict: Record<string, ExceptionHandler>
) {
    const { formData, isList, pagination, append = true, render } = options;

    const componentOptions = {
        render,
        methods: {
            async refresh() {
                if (options.projection && this.state.oakFullpath) {
                    this.setState({
                        oakLoading: true,
                    });
                    try {
                        await features.runningTree.refresh(
                            this.state.oakFullpath
                        );
                        this.setState({
                            oakLoading: false,
                        });
                    } catch (err) {
                        this.setState({
                            oakLoading: false,
                            oakError: {
                                type: 'error',
                                msg: (err as Error).message,
                            },
                        });
                    }
                }
            },
            async onPullDownRefresh() {
                if (options.projection) {
                    await this.refresh();
                    if (!this.state.oakLoading) {
                    }
                }
            },

            async onReachBottom() {
                if (isList && append && options.projection) {
                    this.setState({
                        oakMoreLoading: true,
                    });
                    try {
                        await features.runningTree.loadMore(
                            this.state.oakFullpath
                        );
                        this.setState({
                            oakMoreLoading: false,
                        });
                    } catch (err) {
                        this.setState({
                            oakMoreLoading: false,
                            oakError: {
                                type: 'error',
                                msg: (err as Error).message,
                            },
                        });
                    }
                }
            },

            async ready() {
                this.refresh();
                this.isReady = true;
            },

            async attached() {
                console.log('oak:createNode');
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
                    ...rest
                } = this.props;
                assert(!(isList && oakId));
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
                                    ? await filter({
                                          features,
                                          rest,
                                          onLoadOptions: this.props,
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
                                      rest,
                                      onLoadOptions: this.props,
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
                                    ? await sorter({
                                          features,
                                          rest,
                                          onLoadOptions: this.props,
                                      })
                                    : sorter,
                            ['#name']: name,
                        });
                    }
                }
                const path2 = oakParent
                    ? `${oakParent}:${oakPath || options.path}`
                    : oakPath || options.path;
                const node = await features.runningTree.createNode({
                    path: path2,
                    entity: (oakEntity || options.entity) as T,
                    isList,
                    isPicker: oakIsPicker,
                    projection: proj,
                    pagination,
                    filters,
                    sorters,
                    id: oakId,
                });
                // const oakFullpath = oakParent ? `${oakParent}.${oakPath || options.path}` : oakPath || options.path;
                this.setState(
                    {
                        oakEntity: node.getEntity(),
                        oakFullpath: path2,
                        oakFrom,
                        newOakActions:
                            oakActions && JSON.parse(oakActions).length > 0
                                ? JSON.parse(oakActions)
                                : options.actions || [],
                    },
                    () => {
                        this.isReady = true;
                        if (this.isReady) {
                            this.refresh();
                        }
                    }
                );
            },

            async detached() {
                features.runningTree.destroyNode(this.state.oakFullpath);
            },

            ...makeComponentMethods(
                features,
                doSubscribe,
                formData as any,
                exceptionRouterDict
            ),
        },
    };

    return componentOptions;
}

export function createComponentOptions<
    ED extends EntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD & AspectDict<ED, Cxt>>>,
    IsList extends boolean,
    FormedData extends React.ComponentState
>(
    options: OakComponentOption<ED, T, Cxt, AD, FD, FormedData, IsList>,
    doSubscribe: ReturnType<typeof init>['subscribe'],
    features: BasicFeatures<ED, Cxt, AD & AspectDict<ED, Cxt>> & FD,
    exceptionRouterDict: Record<string, ExceptionHandler>
) {
    const { formData, entity, render } = options;

    const componentOptions = {
        render,
        methods: {
            async ready() {
                const { oakPath, oakParent } = this.props;
                if (oakParent && oakPath) {
                    const oakFullpath = `${oakParent}.${oakPath}`;
                    this.setState({
                        oakFullpath,
                        oakEntity: entity,
                    });
                    this.reRender();
                }
            },
            async attached() {
                this.subscribe();
            },

            async detached() {
                this.unsubscribe();
            },
            ...makeComponentMethods(
                features,
                doSubscribe,
                formData,
                exceptionRouterDict
            ),
        },
    };

    return componentOptions;
}


