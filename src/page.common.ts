import { assert } from 'oak-domain/lib/utils/assert';
import {
    Context,
    EntityDict,
    OakException,
    OakInputIllegalException,
} from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { subscribe as FeactureSubscribe } from './types/Feature';
import { NamedFilterItem, NamedSorterItem } from './types/NamedCondition';
import {
    OakComponentOption,
    ComponentFullThisType,
} from './types/Page';

export function subscribe<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>>(this: ComponentFullThisType<ED, T, Cxt>): void {
    if (!this.subscribed) {
        this.subscribed = FeactureSubscribe(() => this.reRender());
    }
}

export function unsubscribe<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>>(this: ComponentFullThisType<ED, T, Cxt>): void {
    if (this.subscribed) {
        this.subscribed();
        this.subscribed = undefined;
    }
}

export async function onPathSet<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>>(
        this: ComponentFullThisType<ED, T, Cxt>,
        option: OakComponentOption<ED, T, Cxt, any, any, any, any, any, {}, {}, {}>) {
    const { props, state } = this;
    const { oakEntity, oakPath, oakProjection, oakIsPicker, oakFilters, oakSorters, oakId } = props;
    const { entity, path, projection, isList, filters, sorters, pagination } = option;
    const { features } = this;

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
                            filter({
                                features,
                                props,
                                state
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
                projection({
                    features,
                    props,
                    state,
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
            sorters.push({
                sorter:
                    typeof sorter === 'function'
                        ? () =>
                            sorter({
                                features,
                                props,
                                state,
                            })
                        : sorter,
                ['#name']: name,
            });
        }
    }
    const oakPath2 = oakPath || path;
    assert(
        oakPath2,
        '没有正确的path信息，请检查是否配置正确'
    );

    await features.runningTree.createNode({
        path: oakPath2,
        entity: (oakEntity || entity) as T,
        isList,
        isPicker: oakIsPicker,
        projection: proj,
        pagination: pagination,
        filters: filters2,
        sorters: sorters2,
        id: oakId,
    });

    Object.assign(this.state, {
        oakEntity: (oakEntity || entity) as T,
        oakFullpath: oakPath2,
        oakIsReady: true,
    });
    // await this.refresh();
}

export async function reRender<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>>(
        this: ComponentFullThisType<ED, T, Cxt>,
        option: OakComponentOption<ED, T, Cxt, any, any, any, any, any, {}, {}, {}>,
        extra?: Record<string, any>) {
    const { features } = this;
    const { formData } = option;
    if (this.state.oakEntity && this.state.oakFullpath) {
        const rows = await this.features.runningTree.getFreshValue(
            this.state.oakFullpath
        );

        const oakDirty = this.features.runningTree.isDirty(this.state.oakFullpath);
        const oakLoading = this.features.runningTree.isLoading(this.state.oakFullpath);
        const oakLoadingMore = this.features.runningTree.isLoadingMore(this.state.oakFullpath);
        const oakExecuting = this.features.runningTree.isExecuting(this.state.oakFullpath);

        const data: Record<string, any> = formData
            ? await formData.call(this, {
                data: rows as any,
                features,
                props: this.props,
            })
            : {};
        for (const k in data) {
            if (data[k] === undefined) {
                Object.assign(data, {
                    [k]: null,
                });
            }
        }
        Object.assign(data, { oakDirty, oakLoading, oakLoadingMore, oakExecuting });

        if (extra) {
            Object.assign(data, extra);
        }
        this.setState(data);
    } else {
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
}

export async function refresh<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>>(
        this: ComponentFullThisType<ED, T, Cxt>
    ) {
    if (this.state.oakEntity && this.state.oakFullpath) {
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
    Cxt extends Context<ED>>(this: ComponentFullThisType<ED, T, Cxt>) {
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
        this: ComponentFullThisType<ED, T, Cxt>,
        legalExceptions?: Array<string>, path?: string) {
    if (this.state.oakExecuting) {
        return;
    }
    this.setState({
        oakFocused: {},
    });
    try {
        const fullpath = path
            ? `${this.state.oakFullpath}.${path}`
            : this.state.oakFullpath;
        const result = await this.features.runningTree.execute(fullpath);
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
                });
                this.setMessage({
                    type: 'warning',
                    content: err.message,
                });
            } else {
                const { name } = err.constructor;
                if (legalExceptions && legalExceptions.includes(name)) {
                    // 如果调用时就知道有异常，直接抛出
                    this.setState({
                        oakExecuting: false,
                    });
                    throw err;
                }
            }
        } else {
            this.setMessage({
                type: 'warning',
                content: (err as Error).message,
            });
        }
        throw err;
    }
}

export function callPicker<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>>(this: ComponentFullThisType<ED, T, Cxt>, attr: string, params: Record<string, any> = {}) {
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


export async function setUpdateData<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>>(this: ComponentFullThisType<ED, T, Cxt>, attr: string, data: any) {
    assert(attr.indexOf('.') === -1, 'setUpdateData只能设置当前对象属性，子层对象请写完整的addOperation')
    if (this.props.oakId) {
        return this.addOperation({
            action: 'update',
            data: {
                [attr]: data,
            }
        } as ED[T]['Update']);
    }
    else {
        const id = await generateNewId(); 
        await this.addOperation({
            action: 'create',
            data: {
                id,
                [attr]: data,
            }
        } as ED[T]['CreateSingle']);
        this.setProps({ oakId: id });
    }
}
