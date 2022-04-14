import { EntityDict, OperationResult } from 'oak-domain/lib/types/Entity';
import { StorageSchema } from "oak-domain/lib/types/Storage";
import { TriggerExecutor, Checker } from 'oak-general-business';
import { BaseEntityDict } from 'oak-general-business/lib/base-ed/EntityDict';
import { TreeStore } from 'oak-memory-tree-store';
import { CacheContext } from './context';

export class CacheStore<ED extends EntityDict & BaseEntityDict> extends TreeStore<ED> {   
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
        context: CacheContext<ED>,
        params?: Object
    ): Promise<OperationResult> {
        const autoCommit = !context.uuid;
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
        context: CacheContext<ED>,
        params?: Object
    ) {
        
        const autoCommit = !context.uuid;
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
        context: CacheContext<ED>,
        params?: Object
    ): Promise<number> {
        throw new Error("Method not implemented.");
    }

    registerChecker<T extends keyof ED>(checker: Checker<ED, T>) {
        this.executor.registerChecker(checker);
    }
}
