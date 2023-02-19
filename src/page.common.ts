import { assert } from 'oak-domain/lib/utils/assert';
import {
    EntityDict,
    OakException,
    OakInputIllegalException,
    OakUserException,
} from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { NamedFilterItem, NamedSorterItem } from './types/NamedCondition';
import {
    OakComponentOption,
    ComponentFullThisType,
    CascadeEntity,
} from './types/Page';
import { unset } from 'oak-domain/lib/utils/lodash';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { MessageProps } from './types/Message';
import { judgeRelation } from 'oak-domain/lib/store/relation';

export async function onPathSet<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends AsyncContext<ED>,
    FrontCxt extends SyncContext<ED>>(
        this: ComponentFullThisType<ED, T, any, Cxt, FrontCxt>,
        option: OakComponentOption<ED, T, Cxt, FrontCxt, any, any, any, any, {}, {}, {}>) {
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
                                (filter as Function).call(this)
                            : filter,
                    ['#name']: name,
                });
            }
        }
        let proj = oakProjection && (typeof oakProjection === 'string' ? JSON.parse(oakProjection) : oakProjection);
        if (!proj && projection) {
            proj = typeof projection === 'function'
                ? () =>
                    (projection as Function).call(this)
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
                                (sorter as Function).call(this)
                            : sorter,
                    ['#name']: name,
                });
            }
        }
        assert(
            oakPath2,
            '没有正确的path信息，请检查是否配置正确'
        );

        features.runningTree.createNode({
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
        this.subscribed.push(
            features.runningTree.subscribeNode(
                (path2) => {
                    if (path2 === this.state.oakFullpath) {
                        this.reRender();
                    }
                },
                oakPath2!
            )
        );

        // 确保SetState生效，这里改成异步
        await new Promise(
            (resolve) => {
                this.setState({
                    oakEntity: entity2,
                    oakFullpath: oakPath2,
                }, () => resolve(0));
            }
        );

    }
    else {
        // 创建virtualNode
        features.runningTree.createNode({
            path: oakPath2 as string,
        });
        this.subscribed.push(
            features.runningTree.subscribeNode(
                (path2) => {
                    if (path2 === this.state.oakFullpath) {
                        this.reRender();
                    }
                },
                oakPath2!
            )
        );
        await new Promise(
            (resolve) => {
                this.setState({
                    oakFullpath: oakPath2,
                }, () => resolve(0));
            }
        );
    }
    this.refresh();
}

export function reRender<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends AsyncContext<ED>,
    FrontCxt extends SyncContext<ED>>(
        this: ComponentFullThisType<ED, T, any, Cxt, FrontCxt>,
        option: OakComponentOption<ED, T, Cxt, FrontCxt, any, any, any, any, {}, {}, {}>,
        extra?: Record<string, any>) {
    const { features } = this;
    const { formData } = option;
    if (this.state.oakEntity && this.state.oakFullpath) {
        const rows = this.features.runningTree.getFreshValue(
            this.state.oakFullpath
        );

        const oakDirty = this.features.runningTree.isDirty(this.state.oakFullpath);
        /**
         * 这里的pullDownRefresh处理的应该有问题，先不动。to wangkejun.  By Xc 20230201
         */
        const oakLoading = !(this as any).pullDownRefresh && this.features.runningTree.isLoading(this.state.oakFullpath);
        const oakPullDownRefreshLoading = !!(this as any).pullDownRefresh && this.features.runningTree.isLoading(this.state.oakFullpath);
        const oakLoadingMore = this.features.runningTree.isLoadingMore(this.state.oakFullpath);
        const oakExecuting = this.features.runningTree.isExecuting(this.state.oakFullpath);
        const oakExecutable = !oakExecuting && this.features.runningTree.tryExecute(this.state.oakFullpath);

        let oakLegalActions: ED[T]['Action'][] = [];
        const actions: ED[T]['Action'][] = this.props.oakActions || (typeof option.actions === 'function' ? option.actions.call(this) : option.actions);
        if (actions && actions.length > 0) {
            assert(!option.isList, 'actions目前只能作用于单个对象页面上');
            const id = this.features.runningTree.getId(this.state.oakFullpath);
            const value = this.features.runningTree.getFreshValue(this.state.oakFullpath);
            if (id && value) {
                // 必须有值才判断action
                const testResult = actions.map(
                    ele => ({
                        action: ele,
                        result: this.checkOperation(this.state.oakEntity, ele, undefined, { id }, ['relation', 'row', 'logical', 'logicalRelation']),
                    })
                );
                oakLegalActions = testResult.filter(
                    ele => ele.result
                ).map(
                    ele => ele.action
                );
            }
        }
        const data: Record<string, any> = formData
            ? formData.call(this, {
                data: rows as any,
                features,
                props: this.props,
                legalActions: oakLegalActions,
            })
            : {};

        Object.assign(data, {
            oakLegalActions,
        });

        const cascadeEntities = (option.cascadeEntities && option.cascadeEntities.call(this));
        if (cascadeEntities) {
            assert(!option.isList, 'actions目前只能作用于单个对象页面上');
            const id = this.features.runningTree.getId(this.state.oakFullpath);
            const value = this.features.runningTree.getFreshValue(this.state.oakFullpath);
            if (id && value) {
                // 计算所有一对多对象的权限是否存在
                const oakCascadeEntities: {
                    [K in keyof ED[keyof ED]]?: CascadeEntity<ED, keyof ED>;
                } = {};
                for (const attr in cascadeEntities) {
                    const rel = judgeRelation(features.cache.cacheStore.getSchema()!, this.state.oakEntity, attr);
                    assert(rel instanceof Array, `${this.state.oakFullpath}中定义的cascadeEntities的键值${attr}不是一对多的对象`);
                    const [e2, fkey] = rel;
                    const strictFilter = fkey ? {
                        [fkey]: id,
                    } : {
                        entity: this.state.oakEntity,
                        entityId: id,
                    };
                    const availableActions: CascadeEntity<ED, keyof ED> = [];
                    cascadeEntities[attr as keyof ED[T]['Schema']]!.forEach(
                        item => {
                            const { action, filter, data } = typeof item === 'string' ? { action: item, filter: {}, data: {}} : item;
                            if (action === 'create') {
                                const data2 = Object.assign({}, data, strictFilter);
                                if (this.checkOperation(e2 as any, 'create', data2, undefined, ['relation', 'row', 'logical', 'logicalRelation'])) {
                                    availableActions.push(item);
                                }
                            }
                            else {
                                const filter2 = Object.assign({}, filter, strictFilter);
                                if (this.checkOperation(e2 as any, action, undefined, filter2, ['relation', 'row', 'logical', 'logicalRelation'])) {
                                    availableActions.push(item);
                                }
                            }
                        }
                    );
                    if (availableActions.length > 0) {
                        Object.assign(oakCascadeEntities, {
                            [attr]: availableActions,
                        });
                    }
                }
                Object.assign(data, {
                    oakCascadeEntities,
                });
            }
        }

        if (option.isList) {
            const oakFilters = (this as ComponentFullThisType<ED, T, true, Cxt, FrontCxt>).getFilters();
            const oakSorters = (this as ComponentFullThisType<ED, T, true, Cxt, FrontCxt>).getSorters();
            const oakPagination = (this as ComponentFullThisType<ED, T, true, Cxt, FrontCxt>).getPagination();
            Object.assign(data, {
                oakFilters,
                oakSorters,
                oakPagination,
            });
        }

        for (const k in data) {
            if (data[k] === undefined) {
                Object.assign(data, {
                    [k]: null,
                });
            }
        }
        Object.assign(data, {
            oakExecutable,
            oakDirty,
            oakLoading,
            oakLoadingMore,
            oakExecuting,
            oakPullDownRefreshLoading,
        });

        if (extra) {
            Object.assign(data, extra);
        }

        this.setState(data);
    } else {
        const data: Record<string, any> = formData
            ? formData.call(this, {
                features,
                props: this.props,
            } as any)
            : {};
        if (extra) {
            Object.assign(data, extra);
        }

        if (this.state.oakFullpath) {
            /**
             * loadingMore和pullLoading设计上有问题，暂不处理
             */
            const oakDirty = this.features.runningTree.isDirty(this.state.oakFullpath);
            const oakExecuting = this.features.runningTree.isExecuting(this.state.oakFullpath);
            const oakExecutable = !oakExecuting && this.features.runningTree.tryExecute(this.state.oakFullpath);
            const oakLoading = this.features.runningTree.isLoading(this.state.oakFullpath);
            Object.assign(data, {
                oakDirty,
                oakExecutable,
                oakExecuting,
                oakLoading,
            });
        }

        Object.assign({
            __time: Date.now(),
        });         // 有些环境下如果传空值不触发判断
        this.setState(data);
    }
}

export async function refresh<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends AsyncContext<ED>,
    FrontCxt extends SyncContext<ED>>(
        this: ComponentFullThisType<ED, T, any, Cxt, FrontCxt>
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
    Cxt extends AsyncContext<ED>,
    FrontCxt extends SyncContext<ED>>(this: ComponentFullThisType<ED, T, any, Cxt, FrontCxt>) {
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
    Cxt extends AsyncContext<ED>,
    FrontCxt extends SyncContext<ED>
>(
    this: ComponentFullThisType<ED, T, any, Cxt, FrontCxt>,
    action?: ED[T]['Action'],
    path?: string,
    messageProps?: boolean | MessageProps, //默认true
) {
    if (this.state.oakExecuting) {
        throw new Error('请仔细设计按钮状态，不要允许重复点击！');
    }
    /* this.setState({
        oakFocused: undefined,
    }); */

    const fullpath = path
        ? `${this.state.oakFullpath}.${path}`
        : this.state.oakFullpath;
    const { message } = await this.features.runningTree.execute(fullpath, action);
    if (messageProps !== false) {
        const messageData: MessageProps = {
            type: 'success',
            content: message || '操作成功',
        };
        if (typeof messageProps === 'object') {
            Object.assign(messageData, messageProps);
        }
        this.setMessage(messageData);
    }
}

export function destroyNode<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends AsyncContext<ED>,
    FrontCxt extends SyncContext<ED>>(
        this: ComponentFullThisType<ED, T, any, Cxt, FrontCxt>) {
    assert(this.state.oakFullpath);
    this.features.runningTree.destroyNode(this.state.oakFullpath);
    unset(this.state, ['oakFullpath', 'oakEntity']);
}