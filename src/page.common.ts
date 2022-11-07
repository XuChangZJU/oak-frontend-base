import { assert } from 'oak-domain/lib/utils/assert';
import {
    Context,
    EntityDict,
    OakException,
    OakInputIllegalException,
    OakUserException,
} from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { subscribe as FeactureSubscribe } from './types/Feature';
import { NamedFilterItem, NamedSorterItem } from './types/NamedCondition';
import {
    OakComponentOption,
    ComponentFullThisType,
} from './types/Page';
import { unset } from 'oak-domain/lib/utils/lodash';

export function subscribe<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>>(this: ComponentFullThisType<ED, T, any, Cxt>): void {
    if (!this.subscribed) {
        this.subscribed = FeactureSubscribe(() => this.reRender());
    }
}

export function unsubscribe<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>>(this: ComponentFullThisType<ED, T, any, Cxt>): void {
    if (this.subscribed) {
        this.subscribed();
        this.subscribed = undefined;
    }
}

export async function onPathSet<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>>(
        this: ComponentFullThisType<ED, T, any, Cxt>,
        option: OakComponentOption<ED, T, Cxt, any, any, any, any, any, {}, {}, {}>) {
    const { props, state } = this;
    const { oakPath, oakProjection, oakIsPicker, oakFilters, oakSorters, oakId } = props;
    const { entity, path, projection, isList, filters, sorters, pagination } = option;
    const { features } = this;

    const oakPath2 = oakPath || path;
    if (entity) {
        const entity2 = entity instanceof Function ? entity.call(this) : entity;
        const filters2: NamedFilterItem<ED, T>[] = [];
        if (oakFilters) {
            // 这里在跳页面的时候用this.navigate应该可以限制传过来的filter的格式
            const oakFilters2 = typeof oakFilters === 'string' ? JSON.parse(oakFilters) : oakFilters;
            filters2.push(...oakFilters2);
        } else if (filters) {
            for (const ele of filters) {
                const { filter, '#name': name } = ele;
                filters2.push({
                    filter:
                        typeof filter === 'function'
                            ? () =>
                                filter.call(this, {
                                    features,
                                    props: this.props,
                                    state: this.state,
                                })
                            : filter,
                    ['#name']: name,
                });
            }
        }
        let proj = oakProjection && (typeof oakProjection === 'string' ? JSON.parse(oakProjection) : oakProjection);
        if (!proj && projection) {
            proj = typeof projection === 'function'
                ? () =>
                    projection.call(this, {
                        features,
                        props: this.props,
                        state: this.state,
                    })
                : projection;
        }
        let sorters2: NamedSorterItem<ED, T>[] = [];
        if (oakSorters) {
            // 这里在跳页面的时候用this.navigate应该可以限制传过来的sorter的格式
            const oakSorters2 = typeof oakSorters === 'string' ? JSON.parse(oakSorters) : oakSorters;
            sorters2.push(...oakSorters2);
        } else if (sorters) {
            for (const ele of sorters) {
                const { sorter, '#name': name } = ele;
                sorters2.push({
                    sorter:
                        typeof sorter === 'function'
                            ? () =>
                                sorter.call(this, {
                                    features,
                                    props: this.props,
                                    state: this.state,
                                })
                            : sorter,
                    ['#name']: name,
                });
            }
        }
        assert(
            oakPath2,
            '没有正确的path信息，请检查是否配置正确'
        );

        await features.runningTree.createNode({
            path: oakPath2,
            entity: entity2,
            isList,
            isPicker: oakIsPicker,
            projection: proj,
            pagination: pagination,
            filters: filters2,
            sorters: sorters2,
            id: oakId,
        });

        Object.assign(this.state, {
            oakEntity: entity2,
            oakFullpath: oakPath2,
        });

    }
    else {
        Object.assign(this.state, {
            oakFullpath: oakPath2,
        });
        // 创建virtualNode
        await features.runningTree.createNode({
            path: oakPath2 as string,
        });
    }
    await this.refresh();
}

export async function reRender<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>>(
        this: ComponentFullThisType<ED, T, any, Cxt>,
        option: OakComponentOption<ED, T, Cxt, any, any, any, any, any, {}, {}, {}>,
        extra?: Record<string, any>) {
    const { features } = this;
    const { formData } = option;
    if (this.state.oakEntity && this.state.oakFullpath) {
        const rows = await this.features.runningTree.getFreshValue(
            this.state.oakFullpath
        );

        const oakDirty = this.features.runningTree.isDirty(this.state.oakFullpath);
        const oakLoading = !(this as any).pullDownRefresh && this.features.runningTree.isLoading(this.state.oakFullpath);
        const oakPullDownRefreshLoading = (this as any).pullDownRefresh && this.features.runningTree.isLoading(this.state.oakFullpath);
        const oakLoadingMore = this.features.runningTree.isLoadingMore(this.state.oakFullpath);
        const oakExecuting = this.features.runningTree.isExecuting(this.state.oakFullpath);

        let oakLegalActions: ED[T]['Action'][] = [];
        const actions: ED[T]['Action'][] = this.props.oakActions || option.actions;
        if (actions && actions.length > 0) {
            assert(this.props.oakId);       // actions必须配合id来使用
            const testResult = await Promise.all(
                actions.map(
                    async ele => ({
                        action: ele,
                        result: await this.checkOperation(this.state.oakEntity, ele, { id: this.props.oakId }, ['user', 'row']),
                    })
                )
            );
            oakLegalActions = testResult.filter(
                ele => ele.result
            ).map(
                ele => ele.action
            );
        }
        const data: Record<string, any> = formData
            ? await formData.call(this, {
                data: rows as any,
                features,
                props: this.props,
                legalActions: oakLegalActions,
            })
            : {};

        Object.assign(data, {
            oakLegalActions,
        });
        for (const k in data) {
            if (data[k] === undefined) {
                Object.assign(data, {
                    [k]: null,
                });
            }
        }
        Object.assign(data, {
            oakDirty,
            oakLoading,
            oakLoadingMore,
            oakExecuting,
            oakPullDownRefreshLoading,
        });

        if (extra) {
            Object.assign(data, extra);
        }
        let oakAllowExecuting: boolean | OakUserException = false;
        try {
            oakAllowExecuting = await this.features.runningTree.tryExecute(this.state.oakFullpath);
        }
        catch (err) {
            if (err instanceof OakUserException) {
                oakAllowExecuting = err;
            }
            else {
                oakAllowExecuting = false;
                throw err;
            }
        }
        Object.assign(data, {
            oakAllowExecuting,
        });

        this.setState(data);
    } else {
        const data: Record<string, any> = formData
            ? await formData.call(this, {
                features,
                props: this.props,
            } as any)
            : {
                __now: Date.now(),          // 如果没有任何state被set，可能会不触发重渲染
            };
        if (extra) {
            Object.assign(data, extra);
        }
        this.setState(data);
    }
}

export async function refresh<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>>(
        this: ComponentFullThisType<ED, T, any, Cxt>
    ) {
    if (this.state.oakFullpath) {
        try {
            await this.features.runningTree.refresh(this.state.oakFullpath);
        } catch (err) {
            this.setMessage({
                type: 'error',
                content: (err as Error).message,
            });
        }
    }
}

export async function loadMore<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>>(this: ComponentFullThisType<ED, T, any, Cxt>) {
    if (this.state.oakEntity && this.state.oakFullpath) {
        try {
            await this.features.runningTree.loadMore(this.state.oakFullpath);
        } catch (err) {
            this.setMessage({
                type: 'error',
                content: (err as Error).message,
            });
        }
    }
}

export async function execute<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>>(
        this: ComponentFullThisType<ED, T, any, Cxt>,
        data?: ED[T]['Update']['data'] | Record<string, ED[T]['Update']['data']>,
        path?: string) {
    if (this.state.oakExecuting) {
        throw new Error('请仔细设计按钮状态，不要允许重复点击！');
    }
    /* this.setState({
        oakFocused: undefined,
    }); */

    const fullpath = path ? `${this.state.oakFullpath}.${path}` : this.state.oakFullpath;
    const result = await this.features.runningTree.execute(fullpath, data);
    await this.setMessage({
        type: 'success',
        content: '操作成功',
    });
    return result;
}

export function callPicker<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>>(this: ComponentFullThisType<ED, T, any, Cxt>, attr: string, params: Record<string, any> = {}) {
    if (this.state.oakExecuting) {
        return;
    }

    const relation = this.features.cache.judgeRelation(
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
    let url = `/pickers/${subEntity}?oakIsPicker=true&oakParentEntity=${this.state.oakEntity as string}&oakParent=${this.state.oakFullpath}&oakPath=${attr}`;
    for (const k in params) {
        url += `&${k}=${JSON.stringify(params[k])}`;
    }
    this.navigateTo({
        url,
    });
}


export function destroyNode<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>>(
        this: ComponentFullThisType<ED, T, any, Cxt>) {
    assert(this.state.oakFullpath);
    this.features.runningTree.destroyNode(this.state.oakFullpath);
    unset(this.state, ['oakFullpath', 'oakEntity']);
}