import { EntityDict, SelectOption, Context, RowStore, DeduceCreateOperation, DeduceRemoveOperation, DeduceUpdateOperation, OperateOption, SelectionResult, SelectRowShape } from "oak-domain/lib/types";
import { TreeStore } from 'oak-memory-tree-store';
import { StorageSchema, Trigger, Checker } from "oak-domain/lib/types";
import { TriggerExecutor } from 'oak-domain/lib/store/TriggerExecutor';
import { RWLock } from 'oak-domain/lib/utils/concurrent';

interface DebugStoreOperateOption extends OperateOption {
    noLock?: true;
};

interface DebugStoreSelectOption extends SelectOption {
    noLock?: true;
    ignoreTrigger?: true;
};

export class DebugStore<ED extends EntityDict, Cxt extends Context<ED>> extends TreeStore<ED, Cxt> {
    private executor: TriggerExecutor<ED, Cxt>;
    private rwLock: RWLock;
    constructor(storageSchema: StorageSchema<ED>, contextBuilder: (cxtString?: string) => (store: RowStore<ED, Cxt>) => Cxt, initialData?: {
        [T in keyof ED]?: ED[T]['OpSchema'][];
    }, initialStat?: { create: number, update: number, remove: number, commit: number }) {
        super(storageSchema, initialData, initialStat);
        this.executor = new TriggerExecutor(async (cxtString) => contextBuilder(cxtString)(this));
        this.rwLock = new RWLock();
    }

    protected async cascadeUpdate<T extends keyof ED, OP extends DebugStoreOperateOption>(entity: T, operation: DeduceCreateOperation<ED[T]["Schema"]> | DeduceUpdateOperation<ED[T]["Schema"]> | DeduceRemoveOperation<ED[T]["Schema"]>, context: Cxt, option?: OP) {        
        await this.executor.preOperation(entity, operation, context, option);
        const result = super.cascadeUpdate(entity, operation, context, option);
        await this.executor.postOperation(entity, operation, context, option);
        return result;
    }

    protected async cascadeSelect<T extends keyof ED, S extends ED[T]["Selection"], OP extends DebugStoreSelectOption>(entity: T, selection: S, context: Cxt, option?: OP): Promise<SelectRowShape<ED[T]['Schema'], S['data']>[]> {
        const selection2 = Object.assign({
            action: 'select',
        }, selection) as ED[T]['Operation'];

        if (!option?.ignoreTrigger) {
            await this.executor.preOperation(entity, selection2, context, option);
        }
        const result = await super.cascadeSelect(entity, selection2 as any, context, option);
        if (!option?.ignoreTrigger) {
            await this.executor.postOperation(entity, selection2, context, option, result);
        }
        return result;
    }

    async operate<T extends keyof ED, OP extends DebugStoreOperateOption>(
        entity: T,
        operation: ED[T]['Operation'],
        context: Cxt,
        option?: OP
    ) {
        if (!option || !option.noLock) {
            await this.rwLock.acquire('S');
        }

        const autoCommit = !context.getCurrentTxnId();
        let result;
        if (autoCommit) {
            await context.begin();
        }
        try {
            result = await super.operate(entity, operation, context, option);
        }
        catch (err) {
            await context.rollback();
            throw err;
        }
        if (autoCommit) {
            await context.commit();
        }
        if (!option || !option.noLock) {
            this.rwLock.release();
        }
        return result;
    }

    async select<T extends keyof ED, S extends ED[T]['Selection'], OP extends DebugStoreSelectOption>(
        entity: T,
        selection: S,
        context: Cxt,
        option?: OP
    ) {
        if (!option || !option.noLock) {
            await this.rwLock.acquire('S');
        }
        const autoCommit = !context.getCurrentTxnId();
        if (autoCommit) {
            await context.begin();
        }
        let result: SelectionResult<ED[T]['Schema'], S['data']>;

        try {
            result = await super.select(entity, selection, context, option);
        }
        catch (err) {
            await context.rollback();
            throw err;
        }
        if (autoCommit) {
            await context.commit();
        }
        if (!option || !option.noLock) {
            this.rwLock.release();
        }
        return result;
    }

    registerTrigger<T extends keyof ED>(trigger: Trigger<ED, T, Cxt>) {
        this.executor.registerTrigger(trigger);
    }

    registerChecker<T extends keyof ED>(checker: Checker<ED, T, Cxt>) {
        this.executor.registerChecker(checker);
    }

    startInitializing() {
        this.rwLock.acquire('X');
    }

    endInitializing() {
        this.rwLock.release();
    }
}

