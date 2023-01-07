import { EntityDict, OperateOption, SelectOption, OpRecord, AspectWrapper, CheckerType, Aspect } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { CommonAspectDict } from 'oak-common-aspect';
import { Feature } from '../types/Feature';
import { cloneDeep, pull } from 'oak-domain/lib/utils/lodash';
import { CacheStore } from '../cacheStore/CacheStore';
import { OakRowUnexistedException } from 'oak-domain/lib/types/Exception';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';

export class Cache<
    ED extends EntityDict & BaseEntityDict,
    Cxt extends AsyncContext<ED>,
    FrontCxt extends SyncContext<ED>,
    AD extends CommonAspectDict<ED, Cxt> & Record<string, Aspect<ED, Cxt>>
    > extends Feature {
    cacheStore?: CacheStore<ED, FrontCxt>;
    private aspectWrapper: AspectWrapper<ED, Cxt, AD>;
    private syncEventsCallbacks: Array<
        (opRecords: OpRecord<ED>[]) => void
    >;
    private contextBuilder?: () => FrontCxt;

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

    async exec<K extends keyof AD>(
        name: K,
        params: Parameters<AD[K]>[0],
        callback?: (result: Awaited<ReturnType<AD[K]>>) => void
    ) {
        const { result, opRecords } = await this.aspectWrapper.exec(name, params);
        callback && callback(result);
        this.sync(opRecords);
        return result;
    }

    async refresh<T extends keyof ED, OP extends SelectOption>(
        entity: T,
        selection: ED[T]['Selection'],
        option?: OP,
        getCount?: true,
        callback?: (result: Awaited<ReturnType<AD['select']>>) => void,
    ) {
        const result = await this.exec('select', {
            entity,
            selection,
            option,
            getCount,
        }, callback);
        return result as {
            data: Partial<ED[T]['Schema']>[];
            count?: number;
        };
    }

    
    async aggregate<T extends keyof ED, OP extends SelectOption>(
        entity: T,
        aggregation: ED[T]['Aggregation'],
        option?: OP,
    ) {
        const result = await this.exec('aggregate', {
            entity,
            aggregation,
            option,
        });
        return result;
    }

    async operate<T extends keyof ED, OP extends OperateOption>(
        entity: T,
        operation: ED[T]['Operation'],
        option?: OP,
        callback?: (result: Awaited<ReturnType<AD['operate']>>) => void,
    ) {
        return await this.exec('operate', {
            entity,
            operation,
            option,
        }, callback);
    }

    async count<T extends keyof ED, OP extends SelectOption>(
        entity: T,
        selection: Pick<ED[T]['Selection'], 'filter'>,
        option?: OP,
        callback?: (result: Awaited<ReturnType<AD['count']>>) => void,
    ) {
        return await this.exec('count', {
            entity,
            selection,
            option,
        }, callback);
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

    checkOperation<T extends keyof ED>(entity: T, action: ED[T]['Action'], filter?: ED[T]['Update']['filter'], checkerTypes?: CheckerType[]) {
        const context = this.contextBuilder!();
        context.begin();
        const operation = {
            action,
            filter,
            data: {},
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

    /**
     * 尝试在cache中重做一些动作，然后选择重做后的数据（为了实现modi）
     * @param entity
     * @param selection
     * @param opers
     */
    tryRedoOperationsThenSelect<T extends keyof ED>(
        entity: T,
        selection: ED[T]['Selection'],
        opers: Array<{
            entity: keyof ED;
            operation: ED[keyof ED]['Operation'];
        }>,
        allowMiss?: boolean
    ) {
        const context = this.contextBuilder!();
        context.begin();
        try {
            for (const oper of opers) {
                this.cacheStore!.operate(
                    oper.entity,
                    cloneDeep(oper.operation),
                    context,
                    {
                        dontCollect: true,
                        dontCreateOper: true,
                        blockTrigger: true,
                        dontCreateModi: true,
                    }
                );
            }

            // 这个场景下要把可能刚刚delete的行返回
            const result = this.getInner(entity, selection, context, allowMiss, true);
            context.rollback();
            return result;
        }
        catch (err) {
            context.rollback();
            throw err;
        }
    }

    private getInner<T extends keyof ED>(entity: T, selection: ED[T]['Selection'], context: SyncContext<ED>, allowMiss?: boolean, includedDeleted?: boolean): Partial<ED[T]['Schema']>[] {
        try {
            const result = this.cacheStore!.select(
                entity,
                selection,
                context,
                {
                    dontCollect: true,
                    includedDeleted: includedDeleted || undefined,
                }
            );
            return result;
        } catch (err) {
            if (err instanceof OakRowUnexistedException) {
                if (!allowMiss) {
                    const missedRows = err.getRows();
                    this.exec('fetchRows', missedRows);
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
        params?: SelectOption
    ) {
        const context = this.contextBuilder!();

        return this.getInner(entity, selection, context);
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
}
