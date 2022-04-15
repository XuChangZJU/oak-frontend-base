import { EntityDict, OperationResult, Context } from "oak-domain/lib/types";
import { TreeStore } from 'oak-memory-tree-store';
import { StorageSchema, Trigger, Checker } from "oak-domain/lib/types";
import { TriggerExecutor } from 'oak-domain/lib/store/TriggerExecutor';

export class DebugStore<ED extends EntityDict> extends TreeStore<ED> {

    private executor: TriggerExecutor<ED>;

    constructor(executor: TriggerExecutor<ED>, storageSchema: StorageSchema<ED>, initialData?: {
        [T in keyof ED]?: {
            [ID: string]: ED[T]['OpSchema'];
        };
    }) {
        super(storageSchema, true, initialData);
        this.executor = executor;
    }

    async operate<T extends keyof ED>(
        entity: T,
        operation: ED[T]['Operation'],
        context: Context<ED>,
        params?: Object
    ): Promise<OperationResult> {
        const autoCommit = !context.getCurrentTxnId();
        let result;
        if (autoCommit) {
            await context.begin();
        }
        try {
            await this.executor.preOperation(entity, operation, context);
            result = await super.operate(entity, operation, context, params);
            await this.executor.postOperation(entity, operation, context);
        }
        catch (err) {
            await context.rollback();
            throw err;
        }
        if (autoCommit) {
            await context.commit();
        }
        return result;
    }

    async select<T extends keyof ED, S extends ED[T]['Selection']>(
        entity: T,
        selection: S,
        context: Context<ED>,
        params?: Object
    ) {
        
        const autoCommit = !context.getCurrentTxnId();
        if (autoCommit) {
            await context.begin();
        }
        let result;

        const selection2 = Object.assign({
            action: 'select',
        }, selection) as ED[T]['Operation'];
        try {
            await this.executor.preOperation(entity, selection2, context);
            result = await super.select(entity, selection, context, params);
            await this.executor.postOperation(entity, selection2, context);
        }
        catch (err) {
            await context.rollback();
            throw err;
        }
        if (autoCommit) {
            await context.commit();
        }
        return result;
    }

    async count<T extends keyof ED>(
        entity: T,
        selection: Omit<ED[T]['Selection'], 'data' | 'sorter' | 'action'>,
        context: Context<ED>,
        params?: Object
    ): Promise<number> {
        throw new Error("Method not implemented.");
    }

    registerTrigger<T extends keyof ED>(trigger: Trigger<ED, T>) {
        this.executor.registerTrigger(trigger);
    }

    registerChecker<T extends keyof ED>(checker: Checker<ED, T>) {
        this.executor.registerChecker(checker);
    }
}

