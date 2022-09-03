import { EntityDict, OperateOption, SelectOption, OpRecord, Context, AspectWrapper } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { reinforceSelection } from 'oak-domain/lib/store/selection';
import { CommonAspectDict } from 'oak-common-aspect';
import { Action, Feature } from '../types/Feature';
import { pull } from 'oak-domain/lib/utils/lodash';
import { CacheStore } from '../cacheStore/CacheStore';
import { RWLock } from 'oak-domain/lib/utils/concurrent';
import { OakRowUnexistedException } from 'oak-domain/lib/types/Exception';

export class Cache<
    ED extends EntityDict & BaseEntityDict,
    Cxt extends Context<ED>,
    AD extends CommonAspectDict<ED, Cxt>
> extends Feature<ED, Cxt, AD> {
    cacheStore: CacheStore<ED, Cxt>;
    context: Cxt;
    private syncEventsCallbacks: Array<
        (opRecords: OpRecord<ED>[]) => Promise<void>
    >;
    private contextBuilder: () => Cxt;
    private syncLock: RWLock;

    constructor(
        aspectWrapper: AspectWrapper<ED, Cxt, AD>,
        context: Cxt,
        cacheStore: CacheStore<ED, Cxt>,
        contextBuilder: () => Cxt
    ) {
        super(aspectWrapper);
        this.cacheStore = cacheStore;
        this.context = context;
        this.syncEventsCallbacks = [];
        this.contextBuilder = contextBuilder;
        this.syncLock = new RWLock();

        // 在这里把wrapper的返回opRecords截取到并同步到cache中
        const { exec } = aspectWrapper;
        aspectWrapper.exec = async <T extends keyof AD>(
            name: T,
            params: any
        ) => {
            const { result, opRecords } = await exec(name, params);
            await this.sync(opRecords);
            return {
                result,
                opRecords,
            };
        };
    }

    @Action
    async refresh<T extends keyof ED, OP extends SelectOption>(
        entity: T,
        selection: ED[T]['Selection'],
        option?: OP,
        getCount?: true
    ) {
        reinforceSelection(this.cacheStore.getSchema() ,entity, selection);
        const { result } = await this.getAspectWrapper().exec('select', {
            entity,
            selection,
            option,
            getCount,
        });
        return result;
    }

    @Action
    async operate<T extends keyof ED, OP extends OperateOption>(
        entity: T,
        operation: ED[T]['Operation'],
        option?: OP,        
    ) {
        const { result } = await this.getAspectWrapper().exec('operate', {
            entity,
            operation,
            option,
        });
        
        return result;
    }

    private async sync(records: OpRecord<ED>[]) {
        // sync会异步并发的调用，不能用this.context;
        const context = this.contextBuilder();
        await this.syncLock.acquire('X');
        await this.cacheStore.sync(records, context);
        this.syncLock.release();

        // 唤起同步注册的回调
        const result = this.syncEventsCallbacks.map((ele) => ele(records));
        await Promise.all(result);
    }

    /**
     * 前端缓存做operation只可能是测试权限，必然回滚
     * @param entity
     * @param operation
     * @param scene
     * @param commit
     * @param option
     * @returns
     */
    async testOperation<T extends keyof ED>(
        entity: T,
        operation: ED[T]['Operation'],
    ) {
        let result: Awaited<ReturnType<typeof this.cacheStore.operate>>;
        await this.context.begin();
        try {
            result = await this.cacheStore.operate(
                entity,
                operation,
                this.context,
                {
                    dontCollect: true,
                    dontCreateOper: true,
                }
            );

            await this.context.rollback();
        } catch (err) {
            await this.context.rollback();
            throw err;
        }
        return result;
    }

    /**
     * 尝试在cache中重做一些动作，然后选择重做后的数据（为了实现modi）
     * @param entity 
     * @param projection 
     * @param opers 
     */
    async tryRedoOperations<T extends keyof ED, S extends ED[T]['Selection']>(entity: T, selection: S, opers: Array<{
        entity: keyof ED,
        operation: ED[keyof ED]['Operation']
    }>) {
        let result: Awaited<ReturnType<typeof this.cacheStore.select>>;
        await this.context.begin();
        for (const oper of opers) {
            await this.cacheStore.operate(
                oper.entity,
                oper.operation,
                this.context,
                {
                    dontCollect: true,
                    dontCreateOper: true,
                }
            );
        }
        while (true) {
            try {
                result = await this.cacheStore.select(entity, selection, this.context, {
                    dontCollect: true,
                });
    
                await this.context.rollback();
                return result;
            } catch (err) {
                if (err instanceof OakRowUnexistedException) {
                    const missedRows = err.getRows();
                    await this.getAspectWrapper().exec('fetchRows', missedRows);
                }
                else {
                    await this.context.rollback();
                    throw err;
                }
            }
        }
    }

    async get<T extends keyof ED, S extends ED[T]['Selection']>(
        entity: T,
        selection: S,
        params?: SelectOption
    ) {
        const { result } = await this.cacheStore.select(
            entity,
            selection,
            this.context,
            {}
        );
        return result;
    }

    judgeRelation(entity: keyof ED, attr: string) {
        return this.cacheStore.judgeRelation(entity, attr);
    }

    bindOnSync(callback: (opRecords: OpRecord<ED>[]) => Promise<void>) {
        this.syncEventsCallbacks.push(callback);
    }

    unbindOnSync(callback: (opRecords: OpRecord<ED>[]) => Promise<void>) {
        pull(this.syncEventsCallbacks, callback);
    }

    getCachedData() {
        return this.cacheStore;
    }

    getFullData() {
        return this.cacheStore.getFullData();
    }

    resetInitialData() {
        return this.cacheStore.resetInitialData();
    }
}
