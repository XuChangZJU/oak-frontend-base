import { assert } from 'oak-domain/lib/utils/assert';
import { cloneDeep, unset } from 'oak-domain/lib/utils/lodash';
import { judgeRelation } from 'oak-domain/lib/store/relation';
import { combineFilters } from 'oak-domain/lib/store/filter';
import { generateNewId } from 'oak-domain/lib/utils/uuid';
export async function onPathSet(option) {
    const { props, state } = this;
    const { oakPath, oakProjection, oakFilters, oakSorters, oakId } = props;
    const { entity, path, projection, isList, filters, sorters, pagination } = option;
    const { features } = this;
    const oakPath2 = oakPath || path;
    if (entity) {
        const entity2 = entity instanceof Function ? entity.call(this) : entity;
        const filters2 = [];
        if (oakFilters) {
            // 这里在跳页面的时候用this.navigate应该可以限制传过来的filter的格式
            const oakFilters2 = typeof oakFilters === 'string' ? JSON.parse(oakFilters) : oakFilters;
            filters2.push(...oakFilters2);
        }
        if (filters) {
            for (const ele of filters) {
                const { filter, '#name': name } = ele;
                filters2.push({
                    filter: typeof filter === 'function'
                        ? () => filter.call(this)
                        : filter,
                    ['#name']: name,
                });
            }
        }
        let proj = oakProjection && (typeof oakProjection === 'string' ? JSON.parse(oakProjection) : oakProjection);
        if (!proj && projection) {
            proj = typeof projection === 'function'
                ? () => projection.call(this)
                : projection;
        }
        let sorters2 = [];
        if (oakSorters) {
            // 这里在跳页面的时候用this.navigate应该可以限制传过来的sorter的格式
            const oakSorters2 = typeof oakSorters === 'string' ? JSON.parse(oakSorters) : oakSorters;
            sorters2.push(...oakSorters2);
        }
        else if (sorters) {
            for (const ele of sorters) {
                const { sorter, '#name': name } = ele;
                sorters2.push({
                    sorter: typeof sorter === 'function'
                        ? () => sorter.call(this)
                        : sorter,
                    ['#name']: name,
                });
            }
        }
        assert(oakPath2, '没有正确的path信息，请检查是否配置正确');
        const { actions, cascadeActions } = option;
        features.runningTree.createNode({
            path: oakPath2,
            entity: entity2,
            isList,
            projection: proj,
            pagination: pagination,
            filters: filters2,
            sorters: sorters2,
            id: oakId,
            actions: typeof actions === 'function' ? () => actions.call(this) : actions,
            cascadeActions: cascadeActions && (() => cascadeActions.call(this)),
        });
        this.subscribed.push(features.runningTree.subscribeNode((path2) => {
            // 父结点改变，子结点要重渲染
            if (this.state.oakFullpath?.includes(path2)) {
                this.reRender();
            }
        }, oakPath2));
        // 确保SetState生效，这里改成异步
        await new Promise((resolve) => {
            this.setState({
                oakEntity: entity2,
                oakFullpath: oakPath2,
            }, () => resolve(0));
        });
        if ((projection || oakProjection) && !features.runningTree.checkIsModiNode(oakPath2)) {
            this.refresh();
        }
        else {
            this.reRender();
        }
    }
    else {
        // 创建virtualNode
        features.runningTree.createNode({
            path: oakPath2,
        });
        this.subscribed.push(features.runningTree.subscribeNode((path2) => {
            if (path2 === this.state.oakFullpath) {
                this.reRender();
            }
        }, oakPath2));
        await new Promise((resolve) => {
            this.setState({
                oakFullpath: oakPath2,
            }, () => resolve(0));
        });
        this.reRender();
    }
}
function checkActionsAndCascadeEntities(rows, option) {
    const checkTypes = ['relation', 'row', 'logical', 'logicalRelation'];
    const actions = this.props.oakActions ? JSON.parse(this.props.oakActions) : (typeof option.actions === 'function' ? option.actions.call(this) : option.actions);
    const legalActions = [];
    // 这里向服务器请求相应的actionAuth，cache层会对请求加以优化，避免反复过频的不必要取数据
    const destEntities = [];
    if (actions) {
        destEntities.push(this.state.oakEntity);
        // todo 这里actions整体进行测试的性能应该要高于一个个去测试
        for (const action of actions) {
            if (rows instanceof Array) {
                assert(option.isList);
                const filter = this.features.runningTree.getIntrinsticFilters(this.state.oakFullpath);
                if (action === 'create' || typeof action === 'object' && action.action === 'create') {
                    // 创建对象的判定不落在具体行上，但要考虑list上外键相关属性的限制
                    const data = typeof action === 'object' && Object.assign(cloneDeep(action.data) || {}, { id: generateNewId() });
                    if (this.checkOperation(this.state.oakEntity, 'create', data, filter, checkTypes)) {
                        legalActions.push(action);
                    }
                }
                else {
                    const a2 = typeof action === 'object' ? action.action : action;
                    // 先尝试整体测试是否通过，再测试每一行
                    // todo，这里似乎还能优化，这些行一次性进行测试比单独测试的性能要高
                    if (filter && this.checkOperation(this.state.oakEntity, a2, undefined, filter, checkTypes)) {
                        rows.forEach((row) => {
                            if (row['#oakLegalActions']) {
                                row['#oakLegalActions'].push(action);
                            }
                            else {
                                Object.assign(row, {
                                    '#oakLegalActions': [action],
                                });
                            }
                        });
                    }
                    else {
                        rows.forEach((row) => {
                            const { id } = row;
                            if (this.checkOperation(this.state.oakEntity, a2, undefined, { id }, checkTypes)) {
                                if (row['#oakLegalActions']) {
                                    row['#oakLegalActions'].push(action);
                                }
                                else {
                                    Object.assign(row, {
                                        '#oakLegalActions': [action],
                                    });
                                }
                            }
                        });
                    }
                }
            }
            else {
                assert(!option.isList);
                if (action === 'create' || typeof action === 'object' && action.action === 'create') {
                    // 如果是create，根据updateData来判定。create动作应该是自动创建行的并将$$createAt$$置为1
                    if (rows.$$createAt$$ === 1) {
                        const [{ operation }] = this.features.runningTree.getOperations(this.state.oakFullpath);
                        if (this.checkOperation(this.state.oakEntity, 'create', operation.data, undefined, checkTypes)) {
                            legalActions.push(action);
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
                    const filter = this.features.runningTree.getIntrinsticFilters(this.state.oakFullpath);
                    if (filter && this.checkOperation(this.state.oakEntity, a2, data, filter, checkTypes)) {
                        legalActions.push(action);
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
        }
    }
    const cascadeActionDict = this.props.oakCascadeActions ? JSON.parse(this.props.oakCascadeActions) : ((option.cascadeActions && option.cascadeActions.call(this)));
    if (cascadeActionDict) {
        const addToRow = (r, e, a) => {
            if (!r['#oakLegalCascadeActions']) {
                Object.assign(r, {
                    '#oakLegalCascadeActions': {
                        [e]: [a],
                    },
                });
            }
            else if (!r['#oakLegalCascadeActions'][e]) {
                Object.assign(r['#oakLegalCascadeActions'], {
                    [e]: [a],
                });
            }
            else {
                r['#oakLegalCascadeActions'][e].push(a);
            }
        };
        for (const e in cascadeActionDict) {
            const cascadeActions = cascadeActionDict[e];
            if (cascadeActions) {
                const rel = judgeRelation(this.features.cache.getSchema(), this.state.oakEntity, e);
                assert(rel instanceof Array, `${this.state.oakFullpath}上所定义的cascadeAction中的键值${e}不是一对多映射`);
                destEntities.push(rel[0]);
                for (const action of cascadeActions) {
                    if (rows instanceof Array) {
                        if (action === 'create' || typeof action === 'object' && action.action === 'create') {
                            rows.forEach((row) => {
                                const intrinsticData = rel[1] ? {
                                    id: generateNewId(),
                                    [rel[1]]: row.id,
                                } : { id: generateNewId(), entity: this.state.oakEntity, entityId: row.id };
                                if (typeof action === 'object') {
                                    Object.assign(intrinsticData, action.data);
                                }
                                if (this.checkOperation(rel[0], 'create', intrinsticData, undefined, checkTypes)) {
                                    addToRow(row, e, action);
                                }
                            });
                        }
                        else {
                            const a2 = typeof action === 'object' ? action.action : action;
                            const filter = typeof action === 'object' ? action.filter : undefined;
                            const intrinsticFilter = rel[1] ? {
                                [rel[1].slice(0, rel[1].length - 2)]: this.features.runningTree.getIntrinsticFilters(this.state.oakFullpath),
                            } : {
                                [this.state.oakEntity]: this.features.runningTree.getIntrinsticFilters(this.state.oakFullpath),
                            };
                            const filter2 = combineFilters(rel[0], this.features.cache.getSchema(), [filter, intrinsticFilter]);
                            // 先尝试整体测试是否通过，再测试每一行
                            // todo，这里似乎还能优化，这些行一次性进行测试比单独测试的性能要高
                            if (this.checkOperation(rel[0], a2, undefined, filter2, checkTypes)) {
                                rows.forEach((row) => addToRow(row, e, action));
                            }
                            else {
                                rows.forEach((row) => {
                                    const { id } = row;
                                    const intrinsticFilter = rel[1] ? {
                                        [rel[1]]: id,
                                    } : { entity: this.state.oakEntity, entityId: row.id };
                                    if (typeof action === 'object') {
                                        Object.assign(intrinsticFilter, action.filter);
                                    }
                                    if (this.checkOperation(rel[0], a2, undefined, intrinsticFilter, checkTypes)) {
                                        addToRow(row, e, action);
                                    }
                                });
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
                            if (this.checkOperation(rel[0], 'create', intrinsticData, undefined, checkTypes)) {
                                addToRow(rows, e, action);
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
                            if (this.checkOperation(rel[0], a2, undefined, filter2, checkTypes)) {
                                addToRow(rows, e, action);
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
                paths: 1,
                destEntity: 1,
                deActions: 1,
            },
            filter: {
                destEntity: {
                    $in: destEntities,
                }
            }
        });
    }
    return legalActions;
}
export function reRender(option, extra) {
    const { features } = this;
    const { formData } = option;
    const localeState = features.locales.getState();
    if (this.state.oakEntity && this.state.oakFullpath) {
        const rows = this.features.runningTree.getFreshValue(this.state.oakFullpath);
        const oakDirty = this.features.runningTree.isDirty(this.state.oakFullpath);
        /**
         * 这里的pullDownRefresh处理的应该有问题，先不动。to wangkejun.  By Xc 20230201
         */
        const oakLoading = !this.pullDownRefresh && this.features.runningTree.isLoading(this.state.oakFullpath);
        const oakPullDownRefreshLoading = !!this.pullDownRefresh && this.features.runningTree.isLoading(this.state.oakFullpath);
        const oakLoadingMore = this.features.runningTree.isLoadingMore(this.state.oakFullpath);
        const oakExecuting = this.features.runningTree.isExecuting(this.state.oakFullpath);
        const oakExecutable = !oakExecuting && this.features.runningTree.tryExecute(this.state.oakFullpath);
        let data = {};
        if (rows) {
            const oakLegalActions = checkActionsAndCascadeEntities.call(this, rows, option);
            data = formData
                ? formData.call(this, {
                    data: rows,
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
                const oakPagination = this.getPagination();
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
    }
    else {
        const data = formData
            ? formData.call(this, {
                features,
                props: this.props,
            })
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
        Object.assign(data, {
            oakLocales: localeState.dataset,
            oakLocalesVersion: localeState.version,
            oakLng: localeState.lng,
            oakDefaultLng: localeState.defaultLng,
            __time: Date.now(),
        }); // 有些环境下如果传空值不触发判断
        this.setState(data);
    }
}
export async function refresh() {
    if (this.state.oakFullpath) {
        await this.features.runningTree.refresh(this.state.oakFullpath);
    }
}
export async function loadMore() {
    if (this.state.oakEntity && this.state.oakFullpath) {
        try {
            await this.features.runningTree.loadMore(this.state.oakFullpath);
        }
        catch (err) {
            this.setMessage({
                type: 'error',
                content: err.message,
            });
        }
    }
}
export async function execute(action, path, messageProps) {
    if (this.state.oakExecuting) {
        throw new Error('请仔细设计按钮状态，不要允许重复点击！');
    }
    /* this.setState({
        oakFocused: undefined,
    }); */
    const fullpath = path ? path : this.state.oakFullpath;
    const { message } = await this.features.runningTree.execute(fullpath, action);
    if (messageProps !== false) {
        const messageData = {
            type: 'success',
            content: message || '操作成功',
        };
        if (typeof messageProps === 'object') {
            Object.assign(messageData, messageProps);
        }
        this.setMessage(messageData);
    }
}
export function destroyNode() {
    assert(this.state.oakFullpath);
    this.features.runningTree.destroyNode(this.state.oakFullpath);
    unset(this.state, ['oakFullpath', 'oakEntity']);
}