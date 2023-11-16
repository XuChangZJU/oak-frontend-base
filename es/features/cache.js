import { Feature } from '../types/Feature';
import { pull, intersection } from 'oak-domain/lib/utils/lodash';
import { CacheStore } from '../cacheStore/CacheStore';
import { OakRowUnexistedException, OakException, OakUserException } from 'oak-domain/lib/types/Exception';
import { assert } from 'oak-domain/lib/utils/assert';
import { LOCAL_STORAGE_KEYS } from '../constant/constant';
import { combineFilters } from 'oak-domain/lib/store/filter';
const DEFAULT_KEEP_FRESH_PERIOD = 600 * 1000; // 10分钟不刷新
;
export class Cache extends Feature {
    cacheStore;
    aspectWrapper;
    syncEventsCallbacks;
    contextBuilder;
    refreshing = 0;
    savedEntities;
    keepFreshPeriod;
    localStorage;
    getFullDataFn;
    refreshRecords = {};
    context;
    constructor(storageSchema, aspectWrapper, frontendContextBuilder, checkers, getFullData, localStorage, savedEntities, keepFreshPeriod) {
        super();
        this.aspectWrapper = aspectWrapper;
        this.syncEventsCallbacks = [];
        this.cacheStore = new CacheStore(storageSchema);
        this.contextBuilder = () => frontendContextBuilder()(this.cacheStore);
        this.savedEntities = ['actionAuth', 'i18n', 'path', ...(savedEntities || [])];
        this.keepFreshPeriod = keepFreshPeriod || DEFAULT_KEEP_FRESH_PERIOD;
        this.localStorage = localStorage;
        checkers.forEach((checker) => this.cacheStore.registerChecker(checker));
        this.getFullDataFn = getFullData;
        this.initSavedLogic();
    }
    rebuildRefreshRows(entity, projection, result) {
        const { data } = result;
        const rows = [];
        // 重新建立
    }
    /**
     * 处理cache中需要缓存的数据
     */
    initSavedLogic() {
        const data = {};
        this.savedEntities.forEach((entity) => {
            // 加载缓存的数据项
            const key = `${LOCAL_STORAGE_KEYS.cacheSaved}:${entity}`;
            const cached = this.localStorage.load(key);
            if (cached) {
                data[entity] = cached;
            }
            // 加载缓存的时间戳项
            const key2 = `${LOCAL_STORAGE_KEYS.cacheRefreshRecord}:${entity}`;
            const cachedTs = this.localStorage.load(key2);
            if (cachedTs) {
                this.refreshRecords[entity] = cachedTs;
            }
        });
        this.cacheStore.resetInitialData(data);
        this.cacheStore.onCommit((result) => {
            const entities = Object.keys(result);
            const referenced = intersection(entities, this.savedEntities);
            if (referenced.length > 0) {
                const saved = this.cacheStore.getCurrentData(referenced);
                Object.keys(saved).forEach((entity) => {
                    const key = `${LOCAL_STORAGE_KEYS.cacheSaved}:${entity}`;
                    this.localStorage.save(key, saved[entity]);
                });
            }
        });
    }
    getSchema() {
        return this.cacheStore.getSchema();
    }
    /* getCurrentUserId(allowUnloggedIn?: boolean) {
        const context = this.contextBuilder && this.contextBuilder();
        return context?.getCurrentUserId(allowUnloggedIn);
    } */
    async exec(name, params, callback, dontPublish) {
        try {
            this.refreshing++;
            const { result, opRecords, message } = await this.aspectWrapper.exec(name, params);
            if (opRecords) {
                this.syncInner(opRecords);
            }
            this.refreshing--;
            callback && callback(result, opRecords);
            if (opRecords && opRecords.length > 0 && !dontPublish) {
                this.publish();
            }
            return {
                result,
                message,
            };
        }
        catch (e) {
            // 如果是数据不一致错误，这里可以让用户知道
            this.refreshing--;
            if (e instanceof OakException) {
                const { opRecord } = e;
                if (opRecord) {
                    this.syncInner([opRecord]);
                    this.publish();
                }
            }
            throw e;
        }
    }
    saveRefreshRecord(entity) {
        const records = this.refreshRecords[entity];
        assert(records);
        const key2 = `${LOCAL_STORAGE_KEYS.cacheRefreshRecord}:${entity}`;
        this.localStorage.save(key2, records);
    }
    addRefreshRecord(entity, key, now) {
        const originTimestamp = this.refreshRecords[entity] && this.refreshRecords[entity][key];
        if (this.refreshRecords[entity]) {
            Object.assign(this.refreshRecords[entity], {
                [key]: now,
            });
        }
        else {
            Object.assign(this.refreshRecords, {
                [entity]: {
                    [key]: now,
                }
            });
        }
        if (originTimestamp) {
            return () => this.addRefreshRecord(entity, key, originTimestamp);
        }
        return () => undefined;
    }
    async refresh(entity, selection, option, callback, refreshOption) {
        // todo 还要判定没有aggregation
        const { dontPublish, useLocalCache } = refreshOption || {};
        const onlyReturnFresh = refreshOption?.useLocalCache?.onlyReturnFresh;
        let undoFns = [];
        const originFilter = selection.filter;
        if (useLocalCache) {
            assert(!selection.indexFrom && !selection.count, '用cache的查询不能使用分页');
            assert(this.savedEntities.includes(entity), `${entity}不在系统设置的应缓存对象当中`);
            const { keys, gap } = useLocalCache;
            let oldest = Number.MAX_SAFE_INTEGER;
            keys.forEach((k) => {
                const last = this.refreshRecords[entity] && this.refreshRecords[entity][k];
                if (typeof last === 'number') {
                    if (last < oldest) {
                        oldest = last;
                    }
                }
                else {
                    // 说明这个key没有取过，直接赋0
                    oldest = 0;
                }
            });
            const gap2 = gap || this.keepFreshPeriod;
            const now = Date.now();
            if (oldest < Number.MAX_SAFE_INTEGER && oldest > now - gap2) {
                // 说明可以用localCache的数据，不用去请求
                if (process.env.NODE_ENV === 'development') {
                    // console.warn('根据keepFresh规则，省略了一次请求数据的行为', entity, selection);
                }
                if (onlyReturnFresh) {
                    return {
                        data: [],
                    };
                }
                const data = this.get(entity, selection);
                return {
                    data,
                };
            }
            else {
                if (oldest > 0) {
                    // 说明key曾经都取过了，只取updateAt在oldest之后的数据
                    selection.filter = combineFilters(entity, this.getSchema(), [selection.filter, {
                            $$updateAt$$: {
                                $gte: oldest,
                            }
                        }]);
                }
                undoFns = keys.map((k) => this.addRefreshRecord(entity, k, now));
            }
        }
        try {
            const { result: { data: sr, total } } = await this.exec('select', {
                entity,
                selection,
                option,
            }, callback, dontPublish);
            let filter2 = {
                id: {
                    $in: Object.keys(sr),
                }
            };
            if (undoFns.length > 0 && !onlyReturnFresh) {
                filter2 = originFilter;
            }
            const selection2 = Object.assign({}, selection, {
                filter: filter2,
            });
            const data = this.get(entity, selection2, undefined, sr);
            if (useLocalCache) {
                this.saveRefreshRecord(entity);
            }
            return {
                data,
                total,
            };
        }
        catch (err) {
            undoFns && undoFns.forEach((fn) => fn());
            throw err;
        }
    }
    async aggregate(entity, aggregation, option) {
        const { result } = await this.aspectWrapper.exec('aggregate', {
            entity,
            aggregation,
            option,
        });
        return result;
    }
    async operate(entity, operation, option, callback) {
        const result = await this.exec('operate', {
            entity,
            operation,
            option,
        }, callback);
        return result;
    }
    async count(entity, selection, option, callback) {
        const { result } = await this.exec('count', {
            entity,
            selection,
            option,
        }, callback);
        return result;
    }
    syncInner(records) {
        // sync会异步并发的调用，不能用this.context;
        const context = this.contextBuilder();
        this.cacheStore.sync(records, context);
        // 唤起同步注册的回调
        this.syncEventsCallbacks.map((ele) => ele(records));
    }
    sync(records) {
        this.syncInner(records);
        this.publish();
    }
    /**
     * 前端缓存做operation只可能是测试权限，必然回滚
     * @param entity
     * @param operation
     * @returns
     */
    tryRedoOperations(operations) {
        this.begin();
        try {
            for (const oper of operations) {
                const { entity, operation } = oper;
                this.context.operate(entity, operation, {
                    dontCollect: true,
                    dontCreateOper: true,
                    dontCreateModi: true,
                });
            }
            this.rollback();
            return true;
        }
        catch (err) {
            this.rollback();
            if (!(err instanceof OakUserException)) {
                throw err;
            }
            return err;
        }
    }
    checkOperation(entity, action, data, filter, checkerTypes) {
        let autoCommit = false;
        if (!this.context) {
            this.begin();
            autoCommit = true;
        }
        const operation = {
            action,
            filter,
            data
        };
        try {
            this.cacheStore.check(entity, operation, this.context, checkerTypes);
            if (autoCommit) {
                this.rollback();
            }
            return true;
        }
        catch (err) {
            if (autoCommit) {
                this.rollback();
            }
            if (!(err instanceof OakUserException)) {
                throw err;
            }
            return false;
        }
    }
    redoOperation(opers) {
        assert(this.context);
        opers.forEach((oper) => {
            const { entity, operation } = oper;
            this.cacheStore.operate(entity, operation, this.context, {
                checkerTypes: ['logical'],
                dontCollect: true,
                dontCreateOper: true,
                dontCreateModi: true,
            });
        });
        return;
    }
    fetchRows(missedRows) {
        if (!this.refreshing) {
            if (process.env.NODE_ENV === 'development') {
                console.warn('缓存被动去获取数据，请查看页面行为并加以优化', missedRows);
            }
            this.exec('fetchRows', missedRows, async (result, opRecords) => {
                // missedRows理论上一定要取到，不能为空集。否则就是程序员有遗漏
                for (const record of opRecords) {
                    const { d } = record;
                    assert(Object.keys(d).length > 0, '在通过fetchRow取不一致数据时返回了空数据，请拿该程序员祭天。');
                    for (const mr of missedRows) {
                        assert(Object.keys(d[mr.entity]).length > 0, `在通过fetchRow取不一致数据时返回了空数据，请拿该程序员祭天。entity是${mr.entity}`);
                    }
                }
            });
        }
    }
    getInner(entity, selection, allowMiss) {
        let autoCommit = false;
        if (!this.context) {
            this.begin();
            autoCommit = true;
        }
        try {
            const result = this.cacheStore.select(entity, selection, this.context, {
                dontCollect: true,
                includedDeleted: true,
                ignoreAttrMiss: allowMiss || undefined,
            });
            if (autoCommit) {
                this.commit();
            }
            return result;
        }
        catch (err) {
            if (autoCommit) {
                this.rollback();
            }
            if (err instanceof OakRowUnexistedException) {
                if (!allowMiss) {
                    this.fetchRows(err.getRows());
                }
                return [];
            }
            else {
                throw err;
            }
        }
    }
    /**
     * 把select的结果merge到sr中，因为select有可能存在aggr数据，在这里必须要使用合并后的结果
     * sr的数据结构不好规范化描述，参见common-aspect中的select接口
     * @param entity
     * @param rows
     * @param sr
     */
    mergeSelectResult(entity, rows, sr) {
        const mergeSingleRow = (e, r, sr2) => {
            for (const k in sr2) {
                if (k.endsWith('$$aggr')) {
                    Object.assign(r, {
                        [k]: sr2[k],
                    });
                }
                else if (r[k]) {
                    const rel = this.judgeRelation(e, k);
                    if (rel === 2) {
                        mergeSingleRow(k, r[k], sr2[k]);
                    }
                    else if (typeof rel === 'string') {
                        mergeSingleRow(rel, r[k], sr2[k]);
                    }
                    else {
                        assert(rel instanceof Array);
                        assert(r[k] instanceof Array);
                        const { data } = sr2[k];
                        this.mergeSelectResult(rel[0], r[k], data);
                    }
                }
            }
        };
        rows.forEach((row) => {
            const { id } = row;
            if (sr[id]) {
                mergeSingleRow(entity, row, sr[id]);
            }
        });
    }
    get(entity, selection, allowMiss, sr) {
        const rows = this.getInner(entity, selection, allowMiss);
        if (sr) {
            this.mergeSelectResult(entity, rows, sr);
        }
        return rows;
    }
    getById(entity, projection, id, allowMiss) {
        return this.getInner(entity, {
            data: projection,
            filter: {
                id,
            },
        }, allowMiss);
    }
    judgeRelation(entity, attr) {
        return this.cacheStore.judgeRelation(entity, attr);
    }
    bindOnSync(callback) {
        this.syncEventsCallbacks.push(callback);
    }
    unbindOnSync(callback) {
        pull(this.syncEventsCallbacks, callback);
    }
    getCachedData() {
        return this.cacheStore.getCurrentData();
    }
    getFullData() {
        return this.getFullDataFn();
    }
    begin() {
        assert(!this.context);
        this.context = this.contextBuilder();
        this.context.begin();
        return this.context;
    }
    commit() {
        assert(this.context);
        this.context.commit();
        this.context = undefined;
    }
    rollback() {
        assert(this.context);
        this.context.rollback();
        this.context = undefined;
    }
    buildContext() {
        return this.contextBuilder();
    }
}
