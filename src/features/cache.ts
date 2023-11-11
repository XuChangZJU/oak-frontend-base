import { EntityDict, OperateOption, SelectOption, OpRecord, AspectWrapper, CheckerType, Aspect, SelectOpResult, StorageSchema, Checker, SubDataDef } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { CommonAspectDict } from 'oak-common-aspect';
import { Feature } from '../types/Feature';
import { merge, pull, intersection, omit, pick } from 'oak-domain/lib/utils/lodash';
import { CacheStore } from '../cacheStore/CacheStore';
import { OakRowUnexistedException, OakRowInconsistencyException, OakException, OakUserException } from 'oak-domain/lib/types/Exception';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import { assert } from 'oak-domain/lib/utils/assert';
import { generateNewId } from 'oak-domain/lib/utils/uuid';
import { LocalStorage } from './localStorage';
import { LOCAL_STORAGE_KEYS } from '../constant/constant';
import { combineFilters } from 'oak-domain/lib/store/filter';

const DEFAULT_KEEP_FRESH_PERIOD = 600 * 1000;       // 10分钟不刷新

interface CacheSelectOption extends SelectOption {
    ignoreKeepFreshRule?: true,
};

type RefreshOption = {
    dontPublish?: true;
    useLocalCache?: {
        keys: string[];     // entity的查询根据这些keys上次查询是不是在gap()内判定是用cache的数据还是刷新
        gap?: number;
        onlyReturnFresh?: boolean;  // 如果置true只返回新的（update大于now - gap的）
    };
};

export class Cache<
    ED extends EntityDict & BaseEntityDict,
    Cxt extends AsyncContext<ED>,
    FrontCxt extends SyncContext<ED>,
    AD extends CommonAspectDict<ED, Cxt> & Record<string, Aspect<ED, Cxt>>
> extends Feature {
    cacheStore: CacheStore<ED, FrontCxt>;
    private aspectWrapper: AspectWrapper<ED, Cxt, AD>;
    private syncEventsCallbacks: Array<
        (opRecords: OpRecord<ED>[]) => void
    >;
    private contextBuilder?: () => FrontCxt;
    private refreshing = 0;
    private savedEntities: (keyof ED)[];
    private keepFreshPeriod: number;
    private localStorage: LocalStorage;
    private getFullDataFn: () => any;
    private refreshRecords: {
        [T in keyof ED]?: Record<string, number>;
    } = {};
    private context?: FrontCxt;

    constructor(
        storageSchema: StorageSchema<ED>,
        aspectWrapper: AspectWrapper<ED, Cxt, AD>,
        frontendContextBuilder: () => (store: CacheStore<ED, FrontCxt>) => FrontCxt,
        checkers: Array<Checker<ED, keyof ED, FrontCxt | Cxt>>,
        getFullData: () => any,
        localStorage: LocalStorage,
        savedEntities?: (keyof ED)[],
        keepFreshPeriod?: number,
    ) {
        super();
        this.aspectWrapper = aspectWrapper;
        this.syncEventsCallbacks = [];

        this.cacheStore = new CacheStore(storageSchema);
        this.contextBuilder = () => frontendContextBuilder()(this.cacheStore);
        this.savedEntities = ['actionAuth', 'i18n', 'path', ...(savedEntities || [])];
        this.keepFreshPeriod = keepFreshPeriod || DEFAULT_KEEP_FRESH_PERIOD;
        this.localStorage = localStorage;

        checkers.forEach(
            (checker) => this.cacheStore.registerChecker(checker)
        );

        this.getFullDataFn = getFullData;
        this.initSavedLogic();
    }

    /**
     * 处理cache中需要缓存的数据
     */
    private initSavedLogic() {
        const data: {
            [T in keyof ED]?: ED[T]['OpSchema'][];
        } = {};
        this.savedEntities.forEach(
            (entity) => {
                // 加载缓存的数据项
                const key = `${LOCAL_STORAGE_KEYS.cacheSaved}:${entity as string}`;
                const cached = this.localStorage.load(key);
                if (cached) {
                    data[entity] = cached;
                }

                // 加载缓存的时间戳项
                const key2 = `${LOCAL_STORAGE_KEYS.cacheRefreshRecord}:${entity as string}`;
                const cachedTs = this.localStorage.load(key2);
                if (cachedTs) {
                    this.refreshRecords[entity] = cachedTs;
                }
            }
        );
        this.cacheStore.resetInitialData(data);
        this.cacheStore.onCommit((result) => {
            const entities = Object.keys(result);
            const referenced = intersection(entities, this.savedEntities);

            if (referenced.length > 0) {
                const saved = this.cacheStore.getCurrentData(referenced);
                Object.keys(saved).forEach(
                    (entity) => {
                        const key = `${LOCAL_STORAGE_KEYS.cacheSaved}:${entity as string}`;
                        this.localStorage.save(key, saved[entity]);
                    }
                )
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

    async exec<K extends keyof AD>(
        name: K,
        params: Parameters<AD[K]>[0],
        callback?: (result: Awaited<ReturnType<AD[K]>>, opRecords?: OpRecord<ED>[]) => void,
        dontPublish?: true,
    ) {
        try {
            this.refreshing ++;
            const { result, opRecords, message } = await this.aspectWrapper.exec(name, params);
            if (opRecords) {
                this.syncInner(opRecords);
            }
            this.refreshing --;
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
            this.refreshing --;
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

    private saveRefreshRecord(entity: keyof ED) {
        const records = this.refreshRecords[entity];
        assert(records);


        const key2 = `${LOCAL_STORAGE_KEYS.cacheRefreshRecord}:${entity as string}`;
        this.localStorage.save(key2, records);
    }

    private addRefreshRecord(entity: keyof ED, key: string, now: number): () => void {
        const originTimestamp = this.refreshRecords[entity] && this.refreshRecords[entity]![key];
        if (this.refreshRecords[entity]) {
            Object.assign(this.refreshRecords[entity]!, {
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
        return () => undefined as void;
    }

    async refresh<T extends keyof ED, OP extends CacheSelectOption>(
        entity: T,
        selection: ED[T]['Selection'],
        option?: OP,
        getCount?: true,
        callback?: (result: Awaited<ReturnType<AD['select']>>) => void,
        refreshOption?: RefreshOption,
    ) {
        // todo 还要判定没有aggregation
        const { dontPublish, useLocalCache } = refreshOption || {};
        const onlyReturnFresh = refreshOption?.useLocalCache?.onlyReturnFresh;

        let undoFns = [] as Array<() => void>;
        const originFilter = selection.filter;
        if (useLocalCache) {
            assert(!selection.indexFrom && !selection.count, '用cache的查询不能使用分页');
            assert(this.savedEntities.includes(entity), `${entity as string}不在系统设置的应缓存对象当中`);
            const { keys, gap } = useLocalCache;
            let oldest = Number.MAX_SAFE_INTEGER;

            keys.forEach(
                (k) => {
                    const last = this.refreshRecords[entity] && this.refreshRecords[entity]![k];
                    if (typeof last === 'number') {
                        if (last < oldest) {
                            oldest = last;
                        }
                    }
                    else {
                        // 说明这个key没有取过，直接赋0
                        oldest = 0;
                    }
                }
            );

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
            else  {
                if (oldest > 0) {
                    // 说明key曾经都取过了，只取updateAt在oldest之后的数据
                    selection.filter = combineFilters(entity, this.getSchema(), [selection.filter, {
                        $$updateAt$$: {
                            $gte: oldest,
                        }
                    }]);
                }

                undoFns = keys.map(
                    (k) => this.addRefreshRecord(entity, k, now)
                );
            }
        }

        try {
            const { result: { ids, count, aggr } } = await this.exec('select', {
                entity,
                selection,
                option,
                getCount,
            }, callback, dontPublish);

            let filter2: ED[T]['Selection']['filter'] = {
                id: {
                    $in: ids,
                }
            };

            if (undoFns.length > 0 && !onlyReturnFresh) {
                filter2 = originFilter!;
            }

            const selection2 = Object.assign({}, selection, {
                filter: filter2,
            });
            const data = this.get(entity, selection2);
            if (aggr) {
                merge(data, aggr);
            }
            if (useLocalCache) {
                this.saveRefreshRecord(entity);
            }
            return {
                data: data as Partial<ED[T]['Schema']>[],
                count,
            };
        }
        catch(err) {
            undoFns && undoFns.forEach(
                (fn) => fn()
            );

            throw err;
        }
    }


    async aggregate<T extends keyof ED, OP extends SelectOption>(
        entity: T,
        aggregation: ED[T]['Aggregation'],
        option?: OP,
    ) {
        const { result } = await this.aspectWrapper.exec('aggregate', {
            entity,
            aggregation,
            option,
        });
        return result;
    }

    async operate<T extends keyof ED, OP extends OperateOption>(
        entity: T,
        operation: ED[T]['Operation'] | ED[T]['Operation'][],
        option?: OP,
        callback?: (result: Awaited<ReturnType<AD['operate']>>) => void,
    ) {
        const result = await this.exec('operate', {
            entity,
            operation,
            option,
        }, callback);
        return result;
    }

    async count<T extends keyof ED, OP extends SelectOption>(
        entity: T,
        selection: Pick<ED[T]['Selection'], 'filter'>,
        option?: OP,
        callback?: (result: Awaited<ReturnType<AD['count']>>) => void,
    ) {
        const { result } = await this.exec('count', {
            entity,
            selection,
            option,
        }, callback);

        return result;
    }

    private syncInner(records: OpRecord<ED>[]) {
        // sync会异步并发的调用，不能用this.context;
        const context = this.contextBuilder!();
        this.cacheStore!.sync(records, context);

        // 唤起同步注册的回调
        this.syncEventsCallbacks.map((ele) => ele(records));
    }

    sync(records: OpRecord<ED>[]) {
        this.syncInner(records);
        this.publish();
    }

    /**
     * 前端缓存做operation只可能是测试权限，必然回滚
     * @param entity
     * @param operation
     * @returns
     */
    tryRedoOperations<T extends keyof ED>(operations: ({ operation: ED[T]['Operation']; entity: T })[]) {
        this.begin();
        try {
            for (const oper of operations) {
                const { entity, operation } = oper;
                this.context!.operate(entity, operation, {
                    dontCollect: true,
                    dontCreateOper: true,
                    dontCreateModi: true,
                });
            }
            this.rollback();
            return true;
        } catch (err) {
            this.rollback();
            if (!(err instanceof OakUserException)) {
                throw err;
            }
            return err as Error;
        }
    }

    checkOperation<T extends keyof ED>(entity: T, action: ED[T]['Action'], data?: ED[T]['Update']['data'], filter?: ED[T]['Update']['filter'], checkerTypes?: CheckerType[]) {
        let autoCommit = false;
        if (!this.context) {
            this.begin();
            autoCommit = true;
        }
        const operation = {
            action,
            filter,
            data
        } as ED[T]['Update'];
        try {
            this.cacheStore!.check(entity, operation, this.context!, checkerTypes);
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

    redoOperation(opers: Array<{
        entity: keyof ED;
        operation: ED[keyof ED]['Operation'];
    }>) {
        assert(this.context);
        opers.forEach(
            (oper) => {
                const { entity, operation } = oper;
                this.cacheStore!.operate(entity, operation, this.context!, {
                    checkerTypes: ['logical'],      // 这里不能检查data，不然在数据没填完前会有大量异常
                    dontCollect: true,
                    dontCreateOper: true,
                    dontCreateModi: true,
                });
            }
        );
        return;
    }

    fetchRows(missedRows: Array<{ entity: keyof ED, selection: ED[keyof ED]['Selection']}>) {
        if (!this.refreshing) {
            if (process.env.NODE_ENV === 'development') {
                console.warn('缓存被动去获取数据，请查看页面行为并加以优化', missedRows);
            }
            this.exec('fetchRows', missedRows, async (result, opRecords) => {
                // missedRows理论上一定要取到，不能为空集。否则就是程序员有遗漏
                for (const record of opRecords!) {
                    const { d } = record as SelectOpResult<ED>;
                    assert(Object.keys(d).length > 0, '在通过fetchRow取不一致数据时返回了空数据，请拿该程序员祭天。');
                    for (const mr of missedRows) {
                        assert(Object.keys(d![mr.entity]!).length > 0, `在通过fetchRow取不一致数据时返回了空数据，请拿该程序员祭天。entity是${mr.entity as string}`);
                    }
                }
            })
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
    getById<T extends keyof ED>(
        entity: T,
        data: ED[T]['Selection']['data'],
        id: string,
        allowMiss?: boolean
    ): Partial<ED[T]['Schema']> | undefined {
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

    private getInner<T extends keyof ED>(
        entity: T,
        selection: ED[T]['Selection'],
        allowMiss?: boolean): Partial<ED[T]['Schema']>[] {
        let autoCommit = false;
        if (!this.context) {
            this.begin();
            autoCommit = true;
        }
        try {
            const result = this.cacheStore!.select(
                entity,
                selection,
                this.context!,
                {
                    dontCollect: true,
                    includedDeleted: true,
                    ignoreAttrMiss: allowMiss || undefined,
                }
            );
            if (autoCommit) {
                this.commit();
            }
            return result;
        } catch (err) {
            if (autoCommit) {
                this.rollback();
            }
            if (err instanceof OakRowUnexistedException) {
                if (!allowMiss) {
                    this.fetchRows(err.getRows());
                }
                return [];
            } else {
                throw err;
            }
        }
    }

    get<T extends keyof ED>(
        entity: T,
        selection: ED[T]['Selection'],
        allowMiss?: boolean
    ) {
        return this.getInner(entity, selection, allowMiss);
    }

    judgeRelation(entity: keyof ED, attr: string) {
        return this.cacheStore!.judgeRelation(entity, attr);
    }

    bindOnSync(callback: (opRecords: OpRecord<ED>[]) => void) {
        this.syncEventsCallbacks.push(callback);
    }

    unbindOnSync(callback: (opRecords: OpRecord<ED>[]) => void) {
        pull(this.syncEventsCallbacks, callback);
    }

    getCachedData() {
        return this.cacheStore!.getCurrentData();
    }

    getFullData() {
        return this.getFullDataFn();
    }

    begin() {
        assert(!this.context);
        this.context = this.contextBuilder!();
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
        return this.contextBuilder!();
    }
}
