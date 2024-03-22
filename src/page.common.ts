import { assert } from 'oak-domain/lib/utils/assert';
import {
    CheckerType,
    EntityDict,
} from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { NamedFilterItem } from './types/NamedCondition';
import {
    OakComponentOption,
    ComponentFullThisType,
    ActionDef,
    RowWithActions,
    ComponentProps,
    OakComponentData,
} from './types/Page';
import { cloneDeep, unset } from 'oak-domain/lib/utils/lodash';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { MessageProps } from './types/Message';
import { judgeRelation } from 'oak-domain/lib/store/relation';
import { combineFilters } from 'oak-domain/lib/store/filter';
import { generateNewId } from 'oak-domain/lib/utils/uuid';
import { Cache } from './features/cache';
import { CommonAspectDict } from 'oak-common-aspect/es/AspectDict';

export function onPathSet<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends AsyncContext<ED>,
    FrontCxt extends SyncContext<ED>>(
        this: ComponentFullThisType<ED, T, any, Cxt, FrontCxt> & {
            addFeatureSub: (name: string, callback: (args?: any) => void) => void;
        },
        option: OakComponentOption<any, ED, T, Cxt, FrontCxt, any, any, any, {}, {}, {}>): Partial<OakComponentData<ED, T>> {
    const { props, state } = this;
    const { oakPath, oakId, oakFilters } = props as ComponentProps<ED, T, {}>;
    const { entity, path, projection, isList, filters, sorters, pagination, getTotal } = option;
    const { features } = this;

    const oakPath2 = oakPath || path;
    assert(oakPath2);
    assert(!oakPath || !path);
    if (entity) {
        // entity在node生命周期中不可可变，但sorter/filter/projection应当是运行时来决定
        const entity2 = entity instanceof Function ? entity.call(this) : entity;
        const projection2 = typeof projection === 'function' ? () => projection.call(this) : projection;
        let filters2: NamedFilterItem<ED, T>[] | undefined = filters?.map(
            (ele) => {
                const { filter, '#name': name } = ele;
                return {
                    filter: typeof filter === 'function' ? () => (filter as Function).call(this) : filter,
                    ['#name']: name,
                }
            }
        );
        if (oakFilters) {
            if (filters2) {
                filters2.push(oakFilters.map(
                    ele => ({
                        filter: ele
                    })
                ));
            }
            else {
                filters2 = oakFilters.map(
                    ele => ({
                        filter: ele
                    })
                );
            }
        }
        const sorters2 = sorters?.map(
            (ele) => {
                const { sorter, '#name': name } = ele;
                return {
                    sorter:
                        typeof sorter === 'function'
                            ? () =>
                                (sorter as Function).call(this)
                            : sorter,
                    ['#name']: name,
                };
            }
        );

        assert(
            oakPath2,
            '没有正确的path信息，请检查是否配置正确'
        );

        const { actions, cascadeActions } = option;

        // 在这里适配宽窄屏处理getTotal，不到运行时处理了 by Xc
        let getTotal2: undefined | number;
        if (getTotal) {
            const { width } = this.props;
            if (typeof getTotal === 'object') {
                const { max, deviceWidth } = getTotal;
                switch (deviceWidth) {
                    case 'all': {
                        getTotal2 = max;
                        break;
                    }
                    case 'mobile':
                        {
                            if (width === 'xs') {
                                getTotal2 = max;
                            }
                            break;
                        }
                    case 'pc':
                    default: {
                        if (width !== 'xs') {
                            getTotal2 = max;
                        }
                        break;
                    }
                }
            }
            else {
                if (width !== 'xs') {
                    getTotal2 = getTotal;
                }
            }
        }
        else {
            // 不设置的默认情况，宽屏取100窄屏不取
            const { width } = this.props;
            if (width !== 'xs') {
                getTotal2 = 100;
            }
        }
        features.runningTree.createNode({
            path: oakPath2,
            entity: entity2,
            isList,
            projection: projection2,
            pagination: pagination,
            filters: filters2,
            sorters: sorters2,
            id: oakId,
            actions: typeof actions === 'function' ? () => actions.call(this) : actions,
            cascadeActions: cascadeActions && (() => cascadeActions.call(this)),
            getTotal: getTotal2,
        });
        this.addFeatureSub('runningTree', (path2: string) => {
            // 父结点改变，子结点要重渲染
            if (this.state.oakFullpath?.includes(path2)) {
                this.reRender();
            }
        });

        // 确保SetState生效，这里改成异步
        return {
            oakEntity: entity2,
            oakFullpath: oakPath2,
        };
    }
    else {
        // 创建virtualNode
        features.runningTree.createNode({
            path: oakPath2 as string,
        });
        this.addFeatureSub('runningTree', (path2: string) => {
            // 父结点改变，子结点要重渲染
            if (this.state.oakFullpath?.includes(path2)) {
                this.reRender();
            }
        });

        return {
            oakFullpath: oakPath2,
        };
    }
}

function checkActionAttrsIfNecessary<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends AsyncContext<ED>,
    FrontCxt extends SyncContext<ED>>(
        cache: Cache<ED, Cxt, FrontCxt, CommonAspectDict<ED, Cxt>>,
        entity: T,
        action: ActionDef<ED, T>,
        id: string
    ): ActionDef<ED, T> {
    if (typeof action === 'string') {
        return action;
    }

    const { attrs } = action;
    if (!attrs) {
        return action;
    }

    // 处理一下#all
    const idx = attrs.indexOf('#all');
    if (idx >= 0) {
        attrs.splice(idx, 1, ...Object.keys(cache.getSchema()[entity].attributes));
    }
    const attrs2 = cache.getLegalUpdateAttrs(entity, action.action, attrs!, id);

    return {
        ...action,
        attrs: attrs2,
    };
}

function checkActionsAndCascadeEntities<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends AsyncContext<ED>,
    FrontCxt extends SyncContext<ED>>(
        this: ComponentFullThisType<ED, T, any, Cxt, FrontCxt>,
        rows: Partial<ED[keyof ED]['Schema']> | Partial<ED[keyof ED]['Schema']>[],
        option: OakComponentOption<any, ED, T, Cxt, FrontCxt, any, any, any, {}, {}, {}>
    ) {
    const checkTypes = ['relation', 'row', 'logical'] as CheckerType[];
    const actions = this.props.oakActions ? JSON.parse(this.props.oakActions) as ED[T]['Action'][] : (typeof option.actions === 'function' ? option.actions.call(this) : option.actions);
    const legalActions = [] as ActionDef<ED, T>[];

    // 这里向服务器请求相应的actionAuth，cache层会对请求加以优化，避免反复过频的不必要取数据
    const destEntities: (keyof ED)[] = [];
    if (actions) {
        destEntities.push(this.state.oakEntity);
        // 这里actions整体进行测试的性能应该要高于一个个去测试
        for (const action of actions as ActionDef<ED, T>[]) {
            if (rows instanceof Array) {
                assert(option.isList);
                const filter = this.features.runningTree.getIntrinsticFilters(this.state.oakFullpath!);
                if (action === 'create' || typeof action === 'object' && action.action === 'create') {
                    // 创建对象的判定不落在具体行上，但要考虑list上外键相关属性的限制
                    const data = typeof action === 'object' ? cloneDeep(action.data!) : undefined;
                    if (this.checkOperation(this.state.oakEntity, { action: 'create', data, filter }, checkTypes) === true) {
                        legalActions.push(data ? checkActionAttrsIfNecessary(this.features.cache, this.state.oakEntity, action, data.id!) : action);
                    }
                }
                else {
                    const a2 = typeof action === 'object' ? action.action : action;
                    // 先尝试整体测试是否通过，再测试每一行
                    // todo，这里似乎还能优化，这些行一次性进行测试比单独测试的性能要高
                    if (filter && this.checkOperation(this.state.oakEntity, { action: a2, filter }, checkTypes) === true) {
                        rows.forEach(
                            (row) => {
                                if (row['#oakLegalActions']) {
                                    row['#oakLegalActions'].push(checkActionAttrsIfNecessary(this.features.cache, this.state.oakEntity, action, row.id!));
                                }
                                else {
                                    Object.assign(row, {
                                        '#oakLegalActions': [checkActionAttrsIfNecessary(this.features.cache, this.state.oakEntity, action, row.id!)],
                                    });
                                }
                            }
                        );
                    }
                    else {
                        rows.forEach(
                            (row) => {
                                const { id } = row;
                                if (this.checkOperation(this.state.oakEntity, { action: a2, filter: { id } }, checkTypes) === true) {
                                    if (row['#oakLegalActions']) {
                                        row['#oakLegalActions'].push(checkActionAttrsIfNecessary(this.features.cache, this.state.oakEntity, action, row.id!));
                                    }
                                    else {
                                        Object.assign(row, {
                                            '#oakLegalActions': [checkActionAttrsIfNecessary(this.features.cache, this.state.oakEntity, action, row.id!)],
                                        });
                                    }
                                }
                            }
                        );
                    }
                }
            }
            else {
                assert(!option.isList);
                if (action === 'create' || typeof action === 'object' && action.action === 'create') {
                    // 如果是create，根据updateData来判定。create动作应该是自动创建行的并将$$createAt$$置为1
                    if (rows.$$createAt$$ === 1) {
                        const [{ operation }] = this.features.runningTree.getOperations(this.state.oakFullpath!)!;

                        if (this.checkOperation(this.state.oakEntity, {
                            action: 'create',
                            data: operation.data,
                        }, checkTypes) === true) {
                            legalActions.push(checkActionAttrsIfNecessary(this.features.cache, this.state.oakEntity, action, rows.id!));
                            if (rows['#oakLegalActions']) {
                                rows['#oakLegalActions'].push(action);
                            }
                            else {
                                Object.assign(rows, {
                                    '#oakLegalActions': [action],
                                });
                            }
                        }
                    }
                }
                else {
                    const a2 = typeof action === 'object' ? action.action : action;
                    const data = typeof action === 'object' ? action.data : undefined;
                    const filter1 = typeof action === 'object' ? action.filter : undefined;

                    const filter2 = this.features.runningTree.getIntrinsticFilters(this.state.oakFullpath!);
                    const filter = (filter1 || filter2) && combineFilters(this.state.oakEntity, this.features.cache.getSchema(), [
                        filter1, filter2
                    ]);
                    if (filter && this.checkOperation(this.state.oakEntity, { action: a2, filter }, checkTypes) === true) {
                        const action2 = checkActionAttrsIfNecessary(this.features.cache, this.state.oakEntity, action, rows.id!);
                        legalActions.push(action2);
                        if (rows['#oakLegalActions']) {
                            rows['#oakLegalActions'].push(action2);
                        }
                        else {
                            Object.assign(rows, {
                                '#oakLegalActions': [action2],
                            });
                        }
                    }
                }
            }
        }
    }
    const cascadeActionDict: {
        [K in keyof ED[T]['Schema']]?: ActionDef<ED, keyof ED>[];
    } = this.props.oakCascadeActions ? JSON.parse(this.props.oakCascadeActions) : ((option.cascadeActions && option.cascadeActions.call(this)));

    if (cascadeActionDict) {
        const addToRow = (entity: keyof ED, r: Partial<ED[keyof ED]['Schema']>, e: keyof ED[T]['Schema'], a: ActionDef<ED, keyof ED>) => {
            if (!r['#oakLegalCascadeActions']) {
                Object.assign(r, {
                    '#oakLegalCascadeActions': {
                        [e]: [checkActionAttrsIfNecessary(this.features.cache, entity, a, r.id!)],
                    },
                });
            }
            else if (!r['#oakLegalCascadeActions'][e]) {
                Object.assign(r['#oakLegalCascadeActions'], {
                    [e]: [checkActionAttrsIfNecessary(this.features.cache, entity, a, r.id!)],
                });
            }
            else {
                r['#oakLegalCascadeActions'][e].push(checkActionAttrsIfNecessary(this.features.cache, entity, a, r.id!));
            }
        };
        for (const e in cascadeActionDict) {
            const cascadeActions = cascadeActionDict[e];
            if (cascadeActions) {
                const rel = judgeRelation(this.features.cache.getSchema()!, this.state.oakEntity, e);
                assert(rel instanceof Array, `${this.state.oakFullpath}上所定义的cascadeAction中的键值${e}不是一对多映射`);
                destEntities.push(rel[0]);
                for (const action of cascadeActions as ActionDef<ED, T>[]) {
                    if (rows instanceof Array) {
                        if (action === 'create' || typeof action === 'object' && action.action === 'create') {
                            rows.forEach(
                                (row) => {
                                    const intrinsticData = rel[1] ? {
                                        id: generateNewId(),
                                        [rel[1]]: row.id,
                                    } : { id: generateNewId(), entity: this.state.oakEntity, entityId: row.id };
                                    if (typeof action === 'object') {
                                        Object.assign(intrinsticData, action.data);
                                    }
                                    if (this.checkOperation(rel[0] as any, {
                                        action: 'create',
                                        data: intrinsticData,
                                    }, checkTypes) === true) {
                                        addToRow(rel[0], row, e, action);
                                    }
                                }
                            );
                        }
                        else {
                            const a2 = typeof action === 'object' ? action.action : action;
                            const filter = typeof action === 'object' ? action.filter : undefined;
                            const intrinsticFilter = rel[1] ? {
                                [rel[1].slice(0, rel[1].length - 2)]: this.features.runningTree.getIntrinsticFilters(this.state.oakFullpath!),
                            } : {
                                [this.state.oakEntity]: this.features.runningTree.getIntrinsticFilters(this.state.oakFullpath!),
                            };
                            const filter2 = combineFilters(rel[0], this.features.cache.getSchema(), [filter, intrinsticFilter]);

                            // 先尝试整体测试是否通过，再测试每一行
                            // todo，这里似乎还能优化，这些行一次性进行测试比单独测试的性能要高
                            if (this.checkOperation(rel[0] as any, {
                                action: a2,
                                filter: filter2,
                            }, checkTypes) === true) {
                                rows.forEach(
                                    (row) => addToRow(rel[0], row, e, action)
                                );
                            }
                            else {
                                rows.forEach(
                                    (row) => {
                                        const { id } = row;
                                        let intrinsticFilterRow = rel[1] ? {
                                            [rel[1]]: id,
                                        } : { entity: this.state.oakEntity, entityId: row.id };
                                        if (filter) {
                                            intrinsticFilterRow = combineFilters(rel[0], this.features.cache.getSchema(), [filter, intrinsticFilterRow])!;
                                        }
                                        if (this.checkOperation(rel[0] as any, {
                                            action: a2,
                                            filter: intrinsticFilterRow,
                                        }, checkTypes) === true) {
                                            addToRow(rel[0], row, e, action);
                                        }
                                    }
                                );
                            }
                        }
                    }
                    else {
                        if (action === 'create' || typeof action === 'object' && action.action === 'create') {
                            const intrinsticData = rel[1] ? {
                                id: generateNewId(),
                                [rel[1]]: rows.id,
                            } : { id: generateNewId(), entity: this.state.oakEntity, entityId: rows.id };
                            if (typeof action === 'object') {
                                Object.assign(intrinsticData, action.data);
                            }
                            if (this.checkOperation(rel[0] as any, {
                                action: 'create',
                                data: intrinsticData,
                            }, checkTypes) === true) {
                                addToRow(rel[0], rows, e, action);
                            }
                        }
                        else {
                            const a2 = typeof action === 'object' ? action.action : action;
                            const filter = typeof action === 'object' ? action.filter : undefined;
                            const intrinsticFilter = rel[1] ? {
                                [rel[1]]: rows.id,
                            } : { entity: this.state.oakEntity, entityId: rows.id };
                            const filter2 = combineFilters(rel[0], this.features.cache.getSchema(), [filter, intrinsticFilter]);

                            // 先尝试整体测试是否通过，再测试每一行
                            // todo，这里似乎还能优化，这些行一次性进行测试比单独测试的性能要高
                            if (this.checkOperation(rel[0] as any, {
                                action: a2,
                                filter: filter2,
                            }, checkTypes) === true) {
                                addToRow(rel[0], rows, e, action);
                            }
                        }
                    }
                }
            }
        }
    }

    if (destEntities.length > 0) {
        // 权限判断需要actionAuth的数据，这里向cache请求时，会根据keepFresh规则进行一定程度的优化。
        this.features.cache.refresh('actionAuth', {
            data: {
                id: 1,
                relationId: 1,
                path: {
                    id: 1,
                    sourceEntity: 1,
                    destEntity: 1,
                    value: 1,
                    recursive: 1,
                },
                deActions: 1,
            },
            filter: {
                path: {
                    destEntity: {
                        $in: destEntities as string[],
                    }
                }
            }
        }, undefined, undefined, {
            useLocalCache: {
                keys: destEntities as string[],
                gap: process.env.NODE_ENV === 'development' ? 60 * 1000 : 1200 * 1000,
                onlyReturnFresh: true,
            },
            dontPublish: true,
        }).then(
            ({ data }) => {
                // 这里利用cache的缓存行为，如果没有返回新的actionAuth数据就不用再reRender了
                if (data.length > 0) {
                    this.reRender();
                }
            }
        );
    }

    return legalActions;
}

export function reRender<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends AsyncContext<ED>,
    FrontCxt extends SyncContext<ED>>(
        this: ComponentFullThisType<ED, T, any, Cxt, FrontCxt>,
        option: OakComponentOption<any, ED, T, Cxt, FrontCxt, any, any, any, {}, {}, {}>,
        extra?: Record<string, any>) {
    const { features } = this;
    const { formData } = option;

    const localeState = features.locales.getState();
    if (this.state.oakEntity && this.state.oakFullpath) {
        // 现在取数据需要把runningTree上的更新应用了再取，判定actions也一样
        this.features.runningTree.redoBranchOperations(this.state.oakFullpath);
        const rows = this.features.runningTree.getFreshValue(this.state.oakFullpath);
        const oakLegalActions = rows && checkActionsAndCascadeEntities.call(
            this as any,
            rows,
            option as any
        );
        this.features.runningTree.rollbackRedoBranchOperations();

        const oakDirty = this.features.runningTree.isDirty(this.state.oakFullpath);
        const oakLoadingMore = this.features.runningTree.isLoadingMore(this.state.oakFullpath);
        const oakLoading = !oakLoadingMore && this.features.runningTree.isLoading(this.state.oakFullpath);
        const oakExecuting = this.features.runningTree.isExecuting(this.state.oakFullpath);
        const oakExecutable = !oakExecuting && this.tryExecute();
        let data = formData
            ? formData.call(this, {
                data: rows as RowWithActions<ED, T>,
                features,
                props: this.props,
                legalActions: oakLegalActions,
            })
            : {};

        Object.assign(data, {
            oakLegalActions,
            oakLocales: localeState.dataset,
            oakLocalesVersion: localeState.version,
            oakLng: localeState.lng,
            oakDefaultLng: localeState.defaultLng,
        });

        if (option.isList) {
            // 因为oakFilters和props里的oakFilters同名，这里只能先注掉，好像还没有组件用过
            // const oakFilters = (this as ComponentFullThisType<ED, T, true, Cxt, FrontCxt>).getFilters();
            // const oakSorters = (this as ComponentFullThisType<ED, T, true, Cxt, FrontCxt>).getSorters();
            const oakPagination = (
                this as ComponentFullThisType<ED, T, true, Cxt, FrontCxt>
            ).getPagination();
            Object.assign(data, {
                // oakFilters,
                // oakSorters,
                oakPagination,
            });
        }

        for (const k in data) {
            if (data[k] === undefined) {
                Object.assign(data, {
                    [k]: null,
                });
            }
        };
        Object.assign(data, {
            oakExecutable,
            oakDirty,
            oakLoading,
            oakLoadingMore,
            oakExecuting,
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
            const oakExecutable = !oakExecuting && this.tryExecute();
            const oakLoading = this.features.runningTree.isLoading(this.state.oakFullpath);
            Object.assign(data, {
                oakDirty,
                oakExecutable,
                oakExecuting,
                oakLoading,
            });
        }

        Object.assign(data, {
            oakLocales: localeState.dataset,
            oakLocalesVersion: localeState.version,
            oakLng: localeState.lng,
            oakDefaultLng: localeState.defaultLng,
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
        await this.features.runningTree.refresh(this.state.oakFullpath);
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
    opers?: Array<{
        entity: T,
        operation: ED[T]['Operation'],
    }>
) {
    if (this.state.oakExecuting) {
        throw new Error('请仔细设计按钮状态，不要允许重复点击！');
    }
    /* this.setState({
        oakFocused: undefined,
    }); */

    const fullpath = path ? path : this.state.oakFullpath;
    const { message } = await this.features.runningTree.execute(fullpath, action, opers);
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