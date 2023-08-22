import { EntityDict, OperateOption, SelectOption, OpRecord, AspectWrapper, CheckerType, Aspect, SelectOpResult, StorageSchema, Checker, EXPRESSION_PREFIX } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { CommonAspectDict } from 'oak-common-aspect';
import { Feature } from '../types/Feature';
import { merge, pull, intersection, omit, pick } from 'oak-domain/lib/utils/lodash';
import { CacheStore } from '../cacheStore/CacheStore';
import { OakRowUnexistedException, OakRowInconsistencyException, OakException, OakUserException } from 'oak-domain/lib/types/Exception';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import assert from 'assert';
import { generateNewId } from 'oak-domain/lib/utils/uuid';
import { LocalStorage } from './localStorage';
import { LOCAL_STORAGE_KEYS } from '../constant/constant';
import { combineFilters } from 'oak-domain/lib/store/filter';

const DEFAULT_KEEP_FRESH_PERIOD = 600 * 1000;       // 10分钟不刷新

interface CacheSelectOption extends SelectOption {
    ignoreKeepFreshRule?: true,
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
    private refreshing = false;
    private savedEntities: (keyof ED)[];
    private keepFreshPeriod: number;
    private localStorage: LocalStorage;
    private getFullDataFn: () => any;
    private refreshRecords: {
        [T in keyof ED]?: Record<string, number>;
    } = {};

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
        this.savedEntities = ['actionAuth', 'i18n', ...(savedEntities || [])];
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
                const key = `${LOCAL_STORAGE_KEYS.cacheSaved}:${entity as string}`;
                const cached = this.localStorage.load(key);
                if (cached) {
                    data[entity] = cached;
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

    getCurrentUserId(allowUnloggedIn?: boolean) {
        const context = this.contextBuilder && this.contextBuilder();
        return context?.getCurrentUserId(allowUnloggedIn);
    }

    async exec<K extends keyof AD>(
        name: K,
        params: Parameters<AD[K]>[0],
        callback?: (result: Awaited<ReturnType<AD[K]>>, opRecords?: OpRecord<ED>[]) => void,
        dontPublish?: true,
    ) {
        try {
            const { result, opRecords, message } = await this.aspectWrapper.exec(name, params);
            this.refreshing = false;
            if (opRecords) {
                this.sync(opRecords);
            }
            callback && callback(result, opRecords);
            if (opRecords && !dontPublish) {
                this.publish();
            }
            return {
                result,
                message,
            };
        }
        catch (e) {
            // 如果是数据不一致错误，这里可以让用户知道
            if (e instanceof OakException) {
                const { opRecord } = e;
                if (opRecord) {
                    this.sync([opRecord]);
                    this.publish();
                }
            }
            throw e;
        }
    }

    private getRefreshRecordSize() {
        let count = 0;
        Object.keys(this.refreshRecords).forEach(
            (entity) => count += Object.keys(this.refreshRecords[entity]!).length
        );
        return count;
    }

    private reduceRefreshRecord(now: number) {
        Object.keys(this.refreshRecords).forEach(
            (ele) => {
                if (!this.savedEntities.includes(ele)) {
                    const outdated: string[] = [];
                    for (const filter in this.refreshRecords[ele]) {
                        if (this.refreshRecords[ele]![filter]! < now - this.keepFreshPeriod) {
                            outdated.push(filter);
                        }
                    }
                    this.refreshRecords[ele as keyof ED] = omit(this.refreshRecords[ele], outdated);
                }
            }
        );
    }

    private addRefreshRecord(entity: keyof ED, filter: string, now: number) {
        const originTimestamp = this.refreshRecords[entity] && this.refreshRecords[entity]![filter];
        if (this.refreshRecords[entity]) {
            Object.assign(this.refreshRecords[entity]!, {
                [filter]: now,
            });
        }
        else {
            Object.assign(this.refreshRecords, {
                [entity]: {
                    [filter]: now,
                }
            });
        }

        let count = this.getRefreshRecordSize();
        if (count > 100) {
            count = this.getRefreshRecordSize();
            this.reduceRefreshRecord(now);
            if (count > 100) {
                console.warn('cache中的refreshRecord数量过多，请检查是否因为存在带有Date.now等变量的刷新例程！', this.refreshRecords);
            }
        }
        if (originTimestamp) {
            return () => this.addRefreshRecord(entity, filter, originTimestamp);
        }
    }

    /**
     * 判定一个refresh行为是否可以应用缓存优化
     * 可以优化的selection必须满足：
     * 1）没有indexFrom和count
     * 2）没要求getCount
     * 3）查询的projection和filter只限定在该对象自身属性上
     * 4）有filter
     * @param entity 
     * @param selection 
     * @param option 
     * @param getCount 
     */
    private canOptimizeRefresh<T extends keyof ED, OP extends CacheSelectOption>(
        entity: T,
        selection: ED[T]['Selection'],
        option?: OP,
        getCount?: true): boolean {
        if (getCount || selection.indexFrom || selection.count || selection.randomRange || !selection.filter || option?.ignoreKeepFreshRule) {
            return false;
        }

        const { data, filter, sorter } = selection;

        // projection中不能有cascade查询或者表达式
        const checkProjection = (projection: ED[keyof ED]['Selection']['data']) => {
            for (const attr in data) {
                const rel = this.judgeRelation(entity, attr);
                if (typeof rel !== 'number' || ![0, 1].includes(rel)) {
                    return false;
                }
            }
            return true;
        };

        if (!checkProjection(data)) {
            return false;
        }

        // filter中不能有cascade查询或者表达式
        const checkFilter = (filter2: ED[keyof ED]['Selection']['filter']): boolean => {
            for (const attr in filter2) {
                if (['$and', '$or'].includes(attr)) {
                    for (const f2 of filter2[attr]) {
                        if (!checkFilter(f2)) {
                            return false;
                        }
                    }
                }
                else if (attr === '$not') {
                    if (!checkFilter(filter2[attr])) {
                        return false;
                    }
                }
                else if (!attr.startsWith('$') || !attr.startsWith('#')) {
                    const rel = this.judgeRelation(entity, attr);
                    if (typeof rel !== 'number' || ![0, 1].includes(rel)) {
                        return false;
                    }
                }
            }
            return true;
        };

        if (!checkFilter(filter)) {
            return false;
        }

        if (sorter) {
            for (const s of sorter) {
                if (!checkProjection(s.$attr)) {
                    return false;
                }
            }
        }

        return true;
    }

    private filterToKey(filter: object) {
        return JSON.stringify(filter);
    }

    async refresh<T extends keyof ED, OP extends CacheSelectOption>(
        entity: T,
        selection: ED[T]['Selection'],
        option?: OP,
        getCount?: true,
        callback?: (result: Awaited<ReturnType<AD['select']>>) => void,
        dontPublish?: true
    ) {
        // todo 还要判定没有aggregation
        const canOptimize = this.canOptimizeRefresh(entity, selection, option, getCount);
        let now = 0, key = '';
        let undoSetRefreshRecord: undefined | (() => void);
        let originFilter: ED[T]['Selection']['filter'];
        if (canOptimize) {
            const { filter } = selection;
            assert(filter);
            originFilter = filter;
            key = this.filterToKey(filter);

            now = Date.now();
            if (this.refreshRecords[entity] && this.refreshRecords[entity]![key]) {
                if (this.refreshRecords[entity]![key] > now - this.keepFreshPeriod && this.savedEntities.includes(entity)) {
                    // 对于savedEntities，同一查询条件不必过于频繁刷新，减少性能开销
                    if (process.env.NODE_ENV === 'development') {
                        // console.warn('根据keepFresh规则，省略了一次请求数据的行为', entity, selection);
                    }
                    const data = this.get(entity, selection);
                    return {
                        data,
                    };
                }
                else {
                    // 对于其它entity或者是过期的savedEntity，可以加上增量条件，只检查上次查询之后有更新的数据（减少网络传输开销）
                    if (!this.savedEntities.includes(entity) && process.env.NODE_ENV === 'development') {
                        console.log('对象的查询可能可以被缓存，请查看代码逻辑', entity);
                    }
                    selection.filter = combineFilters(entity, this.getSchema(), [selection.filter, {
                        $$updateAt$$: {
                            $gte: this.refreshRecords[entity]![key]!
                        }
                    }]);
                }
            }
            else if (this.savedEntities.includes(entity)) {
                // 启动以后的第一次查询，因为此entity会被缓存，因此可以利用满足查询条件的行上的$$updateAt$$作为上一次查询的时间戳，来最大限度利用缓存减少网络传输开销
                const current = this.get(entity, {
                    data: {
                        id: 1,
                        $$updateAt$$: 1,
                    },
                    filter,
                });

                if (current.length > 0) {
                    let maxUpdateAt = 0;
                    const ids = current.map(
                        (row) => {
                            if (typeof row.$$updateAt$$ === 'number' && row.$$updateAt$$ > maxUpdateAt) {
                                maxUpdateAt = row.$$updateAt$$;
                            }
                            return row.id!;
                        }
                    );

                    /**
                     * 这个filter其实有疏漏，如果有一现有行的updateAt在它自己的updateAt和maxUpdateAt之间就会得不到更新，
                     * 但作为savedEntites这一概率是极低的。
                     */
                    const filter: ED[T]['Selection']['filter'] = {
                        $or: [
                            {
                                id: {
                                    $nin: ids,
                                },
                            },
                            {
                                $$updateAt$$: {
                                    $gte: maxUpdateAt,
                                },
                            }
                        ],
                    };

                    selection.filter = combineFilters(entity, this.getSchema(), [filter, selection.filter]);
                }
            }
            undoSetRefreshRecord = this.addRefreshRecord(entity, key, now);
        }

        this.refreshing = true;
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

            if (canOptimize) {
                filter2 = originFilter!;
            }

            const selection2 = Object.assign({}, selection, {
                filter: filter2,
            });
            const data = this.get(entity, selection2);
            if (aggr) {
                merge(data, aggr);
            }
            return {
                data: data as Partial<ED[T]['Schema']>[],
                count,
            };
        }
        catch(err) {
            this.refreshing = false;            
            undoSetRefreshRecord && undoSetRefreshRecord();

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
        this.refreshing = true;
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

    private sync(records: OpRecord<ED>[]) {
        // sync会异步并发的调用，不能用this.context;
        const context = this.contextBuilder!();
        this.cacheStore!.sync(records, context);

        // 唤起同步注册的回调
        this.syncEventsCallbacks.map((ele) => ele(records));
    }

    /**
     * 前端缓存做operation只可能是测试权限，必然回滚
     * @param entity
     * @param operation
     * @returns
     */
    tryRedoOperations<T extends keyof ED>(operations: ({ operation: ED[T]['Operation']; entity: T })[]) {
        const context = this.contextBuilder!();
        context.begin();
        try {
            for (const oper of operations) {
                const { entity, operation } = oper;
                this.cacheStore!.operate(entity, operation, context, {
                    dontCollect: true,
                    dontCreateOper: true,
                    dontCreateModi: true,
                });
            }
            context.rollback();
            return true;
        } catch (err) {
            context.rollback();
            if (!(err instanceof OakUserException)) {
                throw err;
            }
            return err as Error;
        }
    }

    checkOperation<T extends keyof ED>(entity: T, action: ED[T]['Action'], data?: ED[T]['Update']['data'], filter?: ED[T]['Update']['filter'], checkerTypes?: CheckerType[]) {
        const context = this.contextBuilder!();
        context.begin();
        const operation = {
            action,
            filter,
            data
        } as ED[T]['Update'];
        try {
            this.cacheStore!.check(entity, operation, context, checkerTypes);
            context.rollback();
            return true;
        }
        catch (err) {
            context.rollback();
            if (!(err instanceof OakUserException)) {
                throw err;
            }
            return false;
        }
    }

    redoOperation(opers: Array<{
        entity: keyof ED;
        operation: ED[keyof ED]['Operation'];
    }>, context: FrontCxt) {
        opers.forEach(
            (oper) => {
                const { entity, operation } = oper;
                this.cacheStore!.operate(entity, operation, context, {
                    dontCollect: true,
                    dontCreateOper: true,
                    blockTrigger: true,
                    dontCreateModi: true,
                });
            }
        );
        return;
    }

    private getInner<T extends keyof ED>(
        entity: T,
        selection: ED[T]['Selection'],
        context: SyncContext<ED>,
        allowMiss?: boolean): Partial<ED[T]['Schema']>[] {
        try {
            const result = this.cacheStore!.select(
                entity,
                selection,
                context,
                {
                    dontCollect: true,
                    includedDeleted: true,
                }
            );
            return result;
        } catch (err) {
            if (err instanceof OakRowUnexistedException) {
                if (!this.refreshing && !allowMiss) {
                    const missedRows = err.getRows();
                    this.refreshing = true;
                    this.exec('fetchRows', missedRows, async (result, opRecords) => {
                        // missedRows理论上一定要取到，不能为空集。否则就是程序员有遗漏
                        for (const record of opRecords!) {
                            const { d } = record as SelectOpResult<ED>;
                            assert(Object.keys(d).length > 0, '在通过fetchRow取不一致数据时返回了空数据，请拿该程序员祭天。');
                            for (const mr of missedRows) {
                                assert(Object.keys(d![mr.entity]!).length > 0, `在通过fetchRow取不一致数据时返回了空数据，请拿该程序员祭天。entity是${mr.entity}`);
                            }
                        }
                    })
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
        context?: FrontCxt,
        allowMiss?: boolean
    ) {
        const context2 = context || this.contextBuilder!();

        return this.getInner(entity, selection, context2, allowMiss);
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
        const context = this.contextBuilder!();
        context.begin();
        return context;
    }

    commit(context: FrontCxt) {
        context.commit();
    }

    rollback(context: FrontCxt) {
        context.rollback();
    }
}
