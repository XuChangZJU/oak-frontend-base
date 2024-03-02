import { EntityDict, OperateOption, SelectOption, OpRecord, AspectWrapper, CheckerType, Aspect, SelectOpResult, StorageSchema, Checker, SubDataDef } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { CommonAspectDict } from 'oak-common-aspect';
import { Feature } from '../types/Feature';
import { merge, pull, intersection, omit, unset } from 'oak-domain/lib/utils/lodash';
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
    private initPromise: Promise<void>;

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
        
        // 现在这个init变成了异步行为，不知道有没有影响。by Xc 20231126
        this.initPromise = new Promise(
            (resolve) => this.initSavedLogic(resolve)
        );
    }

    /**
     * 处理cache中需要缓存的数据
     */
    private async initSavedLogic(complete: () => void) {
        const data: {
            [T in keyof ED]?: ED[T]['OpSchema'][];
        } = {};
        await Promise.all(
            this.savedEntities.map(
                async (entity) => {
                    // 加载缓存的数据项
                    const key = `${LOCAL_STORAGE_KEYS.cacheSaved}:${entity as string}`;
                    const cached = await this.localStorage.load(key);
                    if (cached) {
                        data[entity] = cached;
                    }

                    // 加载缓存的时间戳项
                    const key2 = `${LOCAL_STORAGE_KEYS.cacheRefreshRecord}:${entity as string}`;
                    const cachedTs = await this.localStorage.load(key2);
                    if (cachedTs) {
                        this.refreshRecords[entity] = cachedTs;
                    }
                }
            )
        );
        this.cacheStore.resetInitialData(data);
        this.cacheStore.onCommit(
            async (result) => {
                const entities = Object.keys(result);
                const referenced = intersection(entities, this.savedEntities);

                if (referenced.length > 0) {
                    const saved = this.cacheStore.getCurrentData(referenced);
                    for (const entity in saved) {
                        const key = `${LOCAL_STORAGE_KEYS.cacheSaved}:${entity as string}`;
                        await this.localStorage.save(key, saved[entity]);
                    }
                }
            }
        );
        complete();
    }

    async onInitialized() {
        await this.initPromise;
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
        ignoreContext?: true,
    ) {
        try {
            this.refreshing++;
            const { result, opRecords, message } = await this.aspectWrapper.exec(name, params, ignoreContext);
            callback && callback(result, opRecords);
            if (opRecords) {
                this.syncInner(opRecords);
            }
            this.refreshing--;
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
        return () => unset(this.refreshRecords[entity], key);
    }

    /**
     * 向服务器刷新数据
     * @param entity 
     * @param selection 
     * @param option 
     * @param callback 
     * @param refreshOption 
     * @returns 
     * @description 支持增量更新，可以使用useLocalCache来将一些metadata级的数据本地缓存，减少更新次数。
     * 使用增量更新这里要注意，传入的keys如果有一个key是首次更新，会导致所有的keys全部更新。使用模块自己保证这种情况不要出现
     */
    async refresh<T extends keyof ED, OP extends CacheSelectOption>(
        entity: T,
        selection: ED[T]['Selection'],
        option?: OP,
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
            else {
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
            const { result: { data: sr, total } } = await this.exec('select', {
                entity,
                selection,
                option,
            }, callback, dontPublish);

            let filter2: ED[T]['Selection']['filter'] = {
                id: {
                    $in: Object.keys(sr),
                }
            };

            if (undoFns.length > 0 && !onlyReturnFresh) {
                filter2 = originFilter!;
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
                });
            }
            this.rollback();
            return true;
        } catch (err) {
            this.rollback();
            // 现在如果cache中属性缺失会报OakRowUnexistedException，待进一步细化
            if (!(err instanceof OakUserException) && !(err instanceof OakRowUnexistedException)) {
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
                });
            }
        );
        return;
    }

    fetchRows(missedRows: Array<{ entity: keyof ED, selection: ED[keyof ED]['Selection'] }>) {
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

    /**
     * 把select的结果merge到sr中，因为select有可能存在aggr数据，在这里必须要使用合并后的结果
     * sr的数据结构不好规范化描述，参见common-aspect中的select接口
     * @param entity 
     * @param rows 
     * @param sr 
     */
    mergeSelectResult<T extends keyof ED>(entity: T, rows: Partial<ED[T]['Schema']>[], sr: Record<string, any>) {
        const mergeSingleRow = (e: keyof ED, r: Partial<ED[keyof ED]['Schema']>, sr2: Record<string, any>) => {
            for (const k in sr2) {
                if (k.endsWith('$$aggr')) {
                    Object.assign(r, {
                        [k]: sr2[k],
                    });
                }
                else if (r[k]) {
                    const rel = this.judgeRelation(e, k);
                    if (rel === 2) {
                        mergeSingleRow(k, r[k]!, sr2[k]);
                    }
                    else if (typeof rel === 'string') {
                        mergeSingleRow(rel, r[k]!, sr2[k]);
                    }
                    else {
                        assert(rel instanceof Array);
                        assert((r[k] as any) instanceof Array)
                        const { data } = sr2[k];
                        this.mergeSelectResult(rel[0], r[k]!, data);
                    }
                }
            }
        };

        rows.forEach(
            (row) => {
                const { id } = row;
                if (sr[id!]) {
                    mergeSingleRow(entity, row, sr[id!]);
                }
            }
        );
    }

    get<T extends keyof ED>(
        entity: T,
        selection: ED[T]['Selection'],
        allowMiss?: boolean,
        sr?: Record<string, any>
    ) {
        const rows = this.getInner(entity, selection, allowMiss);

        if (sr) {
            this.mergeSelectResult(entity, rows, sr);
        }
        return rows;
    }

    getById<T extends keyof ED>(entity: T, projection: ED[T]['Selection']['data'], id: string, allowMiss?: boolean) {
        return this.getInner(entity, {
            data: projection,
            filter: {
                id,
            },
        }, allowMiss);
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
