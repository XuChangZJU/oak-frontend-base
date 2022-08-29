import { EntityDict, OperateOption, OperationResult, OpRecord, SelectOption } from 'oak-domain/lib/types/Entity';
import { StorageSchema } from "oak-domain/lib/types/Storage";
import { TriggerExecutor } from 'oak-domain/lib/store/TriggerExecutor';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { Checker, Context, Trigger } from 'oak-domain/lib/types';
import { TreeStore } from 'oak-memory-tree-store';

export class CacheStore<
    ED extends EntityDict & BaseEntityDict,
    Cxt extends Context<ED>
> extends TreeStore<ED, Cxt> {
    private executor: TriggerExecutor<ED, Cxt>;
    private getFullDataFn?: () => any;
    private resetInitialDataFn?: () => void;

    constructor(
        storageSchema: StorageSchema<ED>,
        contextBuilder: (
            cxtString: string
        ) => (store: CacheStore<ED, Cxt>) => Cxt,
        getFullDataFn?: () => any,
        resetInitialDataFn?: () => void
    ) {
        super(storageSchema);
        this.executor = new TriggerExecutor(async (cxtStr) =>
            contextBuilder(cxtStr)(this)
        );
        this.getFullDataFn = getFullDataFn;
        this.resetInitialDataFn = resetInitialDataFn;
    }

    async operate<T extends keyof ED, OP extends OperateOption>(
        entity: T,
        operation: ED[T]['Operation'],
        context: Cxt,
        option: OP
    ): Promise<OperationResult<ED>> {
        const autoCommit = !context.getCurrentTxnId();
        let result;
        if (autoCommit) {
            await context.begin();
        }
        try {
            if (!option.blockTrigger) {
                await this.executor.preOperation(entity, operation, context, option);
            }
            result = await super.operate(entity, operation, context, option);
            if (!option.blockTrigger) {
                await this.executor.postOperation(entity, operation, context, option);
            }
        } catch (err) {
            await context.rollback();
            throw err;
        }
        if (autoCommit) {
            await context.commit();
        }
        return result;
    }

    async sync(opRecords: Array<OpRecord<ED>>, context: Cxt) {
        const autoCommit = !context.getCurrentTxnId();
        if (autoCommit) {
            await context.begin();
        }
        let result;

        try {
            result = await super.sync(opRecords, context);
        } catch (err) {
            await context.rollback();
            throw err;
        }
        if (autoCommit) {
            await context.commit();
        }
        return result;
    }

    async select<
        T extends keyof ED,
        S extends ED[T]['Selection'],
        OP extends SelectOption
    >(entity: T, selection: S, context: Cxt, option: OP) {
        const autoCommit = !context.getCurrentTxnId();
        if (autoCommit) {
            await context.begin();
        }
        let result;

        try {
            result = await super.select(entity, selection, context, option);
        } catch (err) {
            await context.rollback();
            throw err;
        }
        if (autoCommit) {
            await context.commit();
        }
        return result;
    }

    registerChecker<T extends keyof ED>(checker: Checker<ED, T, Cxt>) {
        this.executor.registerChecker(checker);
    }

    /**
     * 这个函数是在debug下用来获取debugStore的数据，release下不能使用
     * @returns
     */
    getFullData() {
        return this.getFullDataFn!();
    }

    /**
     * 这个函数是在debug下用来初始化debugStore的数据，release下不能使用
     * @returns
     */
    resetInitialData() {
        return this.resetInitialDataFn!();
    }
}
