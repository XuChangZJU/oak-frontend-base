import { EntityDict, OperationResult } from 'oak-domain/lib/types/Entity';
import { StorageSchema } from "oak-domain/lib/types/Storage";
import { TriggerExecutor } from 'oak-domain/lib/store/TriggerExecutor';
import { Checker, Context } from 'oak-domain/lib/types';
import { TreeStore } from 'oak-memory-tree-store';

export class CacheStore<ED extends EntityDict> extends TreeStore<ED> {   
    private executor: TriggerExecutor<ED>;

    constructor(storageSchema: StorageSchema<ED>, initialData?: {
        [T in keyof ED]?: {
            [ID: string]: ED[T]['OpSchema'];
        };
    }) {
        super(storageSchema, true, initialData);
        this.executor = new TriggerExecutor();
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
        
        try {
            result = await super.select(entity, selection, context, params);
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

    registerChecker<T extends keyof ED>(checker: Checker<ED, T>) {
        this.executor.registerChecker(checker);
    }
}
