"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
const Feature_1 = require("../types/Feature");
const lodash_1 = require("oak-domain/lib/utils/lodash");
const CacheStore_1 = require("../cacheStore/CacheStore");
const Exception_1 = require("oak-domain/lib/types/Exception");
const assert_1 = require("oak-domain/lib/utils/assert");
const constant_1 = require("../constant/constant");
const filter_1 = require("oak-domain/lib/store/filter");
const DEFAULT_KEEP_FRESH_PERIOD = 600 * 1000; // 10分钟不刷新
;
class Cache extends Feature_1.Feature {
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
        this.cacheStore = new CacheStore_1.CacheStore(storageSchema);
        this.contextBuilder = () => frontendContextBuilder()(this.cacheStore);
        this.savedEntities = ['actionAuth', 'i18n', ...(savedEntities || [])];
        this.keepFreshPeriod = keepFreshPeriod || DEFAULT_KEEP_FRESH_PERIOD;
        this.localStorage = localStorage;
        checkers.forEach((checker) => this.cacheStore.registerChecker(checker));
        this.getFullDataFn = getFullData;
        this.initSavedLogic();
    }
    /**
     * 处理cache中需要缓存的数据
     */
    initSavedLogic() {
        const data = {};
        this.savedEntities.forEach((entity) => {
            // 加载缓存的数据项
            const key = `${constant_1.LOCAL_STORAGE_KEYS.cacheSaved}:${entity}`;
            const cached = this.localStorage.load(key);
            if (cached) {
                data[entity] = cached;
            }
            // 加载缓存的时间戳项
            const key2 = `${constant_1.LOCAL_STORAGE_KEYS.cacheRefreshRecord}:${entity}`;
            const cachedTs = this.localStorage.load(key2);
            if (cachedTs) {
                this.refreshRecords[entity] = cachedTs;
            }
        });
        this.cacheStore.resetInitialData(data);
        this.cacheStore.onCommit((result) => {
            const entities = Object.keys(result);
            const referenced = (0, lodash_1.intersection)(entities, this.savedEntities);
            if (referenced.length > 0) {
                const saved = this.cacheStore.getCurrentData(referenced);
                Object.keys(saved).forEach((entity) => {
                    const key = `${constant_1.LOCAL_STORAGE_KEYS.cacheSaved}:${entity}`;
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
            if (e instanceof Exception_1.OakException) {
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
        (0, assert_1.assert)(records);
        const key2 = `${constant_1.LOCAL_STORAGE_KEYS.cacheRefreshRecord}:${entity}`;
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
    async refresh(entity, selection, option, getCount, callback, refreshOption) {
        // todo 还要判定没有aggregation
        const { dontPublish, useLocalCache } = refreshOption || {};
        const onlyReturnFresh = refreshOption?.useLocalCache?.onlyReturnFresh;
        let undoFns = [];
        const originFilter = selection.filter;
        if (useLocalCache) {
            (0, assert_1.assert)(!selection.indexFrom && !selection.count, '用cache的查询不能使用分页');
            (0, assert_1.assert)(this.savedEntities.includes(entity), `${entity}不在系统设置的应缓存对象当中`);
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
                    selection.filter = (0, filter_1.combineFilters)(entity, this.getSchema(), [selection.filter, {
                            $$updateAt$$: {
                                $gte: oldest,
                            }
                        }]);
                }
                undoFns = keys.map((k) => this.addRefreshRecord(entity, k, now));
            }
        }
        try {
            const { result: { ids, count, aggr } } = await this.exec('select', {
                entity,
                selection,
                option,
                getCount,
            }, callback, dontPublish);
            let filter2 = {
                id: {
                    $in: ids,
                }
            };
            if (undoFns.length > 0 && !onlyReturnFresh) {
                filter2 = originFilter;
            }
            const selection2 = Object.assign({}, selection, {
                filter: filter2,
            });
            const data = this.get(entity, selection2);
            if (aggr) {
                (0, lodash_1.merge)(data, aggr);
            }
            if (useLocalCache) {
                this.saveRefreshRecord(entity);
            }
            return {
                data: data,
                count,
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
            if (!(err instanceof Exception_1.OakUserException)) {
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
            if (!(err instanceof Exception_1.OakUserException)) {
                throw err;
            }
            return false;
        }
    }
    redoOperation(opers) {
        (0, assert_1.assert)(this.context);
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
                    (0, assert_1.assert)(Object.keys(d).length > 0, '在通过fetchRow取不一致数据时返回了空数据，请拿该程序员祭天。');
                    for (const mr of missedRows) {
                        (0, assert_1.assert)(Object.keys(d[mr.entity]).length > 0, `在通过fetchRow取不一致数据时返回了空数据，请拿该程序员祭天。entity是${mr.entity}`);
                    }
                }
            });
        }
    }
    /**
     * getById可以处理当本行不在缓存中的自动取
     * @attention 这里如果访问了一个id不存在的行（被删除？），可能会陷入无限循环。如果遇到了再处理
     * @param entity
     * @param data
     * @param id
     * @param allowMiss
     */
    getById(entity, data, id, allowMiss) {
        const result = this.getInner(entity, {
            data,
            filter: {
                id,
            },
        }, allowMiss);
        if (result.length === 0 && !allowMiss) {
            this.fetchRows([{
                    entity,
                    selection: {
                        data,
                        filter: {
                            id,
                        },
                    }
                }]);
        }
        return result[0];
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
            if (err instanceof Exception_1.OakRowUnexistedException) {
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
    get(entity, selection, allowMiss) {
        return this.getInner(entity, selection, allowMiss);
    }
    judgeRelation(entity, attr) {
        return this.cacheStore.judgeRelation(entity, attr);
    }
    bindOnSync(callback) {
        this.syncEventsCallbacks.push(callback);
    }
    unbindOnSync(callback) {
        (0, lodash_1.pull)(this.syncEventsCallbacks, callback);
    }
    getCachedData() {
        return this.cacheStore.getCurrentData();
    }
    getFullData() {
        return this.getFullDataFn();
    }
    begin() {
        (0, assert_1.assert)(!this.context);
        this.context = this.contextBuilder();
        this.context.begin();
        return this.context;
    }
    commit() {
        (0, assert_1.assert)(this.context);
        this.context.commit();
        this.context = undefined;
    }
    rollback() {
        (0, assert_1.assert)(this.context);
        this.context.rollback();
        this.context = undefined;
    }
    buildContext() {
        return this.contextBuilder();
    }
}
exports.Cache = Cache;
