import { EntityDict, OperateOption, SelectOption, OpRecord, AspectWrapper, CheckerType, Aspect, SelectOpResult } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { CommonAspectDict } from 'oak-common-aspect';
import { Feature } from '../types/Feature';
import { cloneDeep, pull } from 'oak-domain/lib/utils/lodash';
import { CacheStore } from '../cacheStore/CacheStore';
import { OakRowUnexistedException, OakRowInconsistencyException, OakException } from 'oak-domain/lib/types/Exception';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import assert from 'assert';

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

    constructor(
        aspectWrapper: AspectWrapper<ED, Cxt, AD>,
        contextBuilder: () => FrontCxt,
        store: CacheStore<ED, FrontCxt>
    ) {
        super();
        this.aspectWrapper = aspectWrapper;
        this.syncEventsCallbacks = [];

        this.contextBuilder = contextBuilder;
        this.cacheStore = store;

        // 在这里把wrapper的返回opRecords截取到并同步到cache中
        /* const { exec } = aspectWrapper;
        aspectWrapper.exec = async <T extends keyof AD>(
            name: T,
            params: any
        ) => {
            const { result, opRecords } = await exec(name, params);
            this.sync(opRecords);
            return {
                result,
                opRecords,
            };
        }; */
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
        callback?: (result: Awaited<ReturnType<AD[K]>>, opRecords?: OpRecord<ED>[]) => void
    ) {
        try {
            const { result, opRecords, message } = await this.aspectWrapper.exec(name, params);
            this.refreshing = false;
            callback && callback(result, opRecords);
            if (opRecords) {
                this.sync(opRecords);
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
                }
            }
            throw e;
        }
    }

    async refresh<T extends keyof ED, OP extends SelectOption>(
        entity: T,
        selection: ED[T]['Selection'],
        option?: OP,
        getCount?: true,
        callback?: (result: Awaited<ReturnType<AD['select']>>) => void,
    ) {
        this.refreshing = true;
        const { result: { ids, count } } = await this.exec('select', {
            entity,
            selection,
            option,
            getCount,
        }, callback);

        const selection2 = Object.assign({}, selection, {
            filter: {
                id: {
                    $in: ids,
                }
            }
        });
        const data = this.get(entity, selection2);
        return {
            data: data as Partial<ED[T]['Schema']>[],
            count,
        };
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
        this.publish();
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
            return err as Error;
        }
    }

    checkOperation<T extends keyof ED>(entity: T, action: ED[T]['Action'], data?: ED[T]['Update']['data'], filter?: ED[T]['Update']['filter'], checkerTypes?: CheckerType[]) {
        const context = this.contextBuilder!();
        context.begin();
        const operation = {
            action,
            filter,
            data,
        } as ED[T]['Update'];
        try {
            this.cacheStore!.check(entity, operation, context, checkerTypes);
            context.rollback();
            return true;
        }
        catch (err) {
            context.rollback();
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
        const context2 = context ||  this.contextBuilder!();

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
        return this.cacheStore!.getFullData();
    }

    resetInitialData() {
        return this.cacheStore!.resetInitialData();
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
