import { EntityDict, OperationResult, OpRecord } from 'oak-domain/lib/types/Entity';
import { StorageSchema } from "oak-domain/lib/types/Storage";
import { TriggerExecutor } from 'oak-domain/lib/store/TriggerExecutor';
import { Checker, Context, Trigger } from 'oak-domain/lib/types';
import { TreeStore } from 'oak-memory-tree-store';

export class CacheStore<ED extends EntityDict, Cxt extends Context<ED>> extends TreeStore<ED, Cxt> {
    private executor: TriggerExecutor<ED, Cxt>;

    constructor(storageSchema: StorageSchema<ED>, contextBuilder: (cxtString: string) => (store: CacheStore<ED, Cxt>) => Cxt) {
        super(storageSchema);
        this.executor = new TriggerExecutor((cxtStr) => contextBuilder(cxtStr)(this));
    }

    async operate<T extends keyof ED>(
        entity: T,
        operation: ED[T]['Operation'],
        context: Cxt,
        params?: Object
    ): Promise<OperationResult<ED>> {
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

    async sync(opRecords: Array<OpRecord<ED>>, context: Cxt) {
        const autoCommit = !context.getCurrentTxnId();
        if (autoCommit) {
            await context.begin();
        }
        let result;
        
        try {
            result = await super.sync(opRecords, context);
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
        context: Cxt,
        params?: Object
    ) {
        const autoCommit = !context.getCurrentTxnId();
        if (autoCommit) {
            await context.begin();
            console.log('cache begin', (context as any).id, context.getCurrentTxnId());
        }
        let result;

        try {
            result = await super.select(entity, selection, context, params);
        }
        catch (err) {
            console.log('cache rollback', (context as any).id, context.getCurrentTxnId());
            await context.rollback();
            throw err;
        }
        if (autoCommit) {
            console.log('cache commit', (context as any).id, context.getCurrentTxnId());
            await context.commit();
        }
        return result;
    }

    registerChecker<T extends keyof ED>(checker: Checker<ED, T, Cxt>) {
        this.executor.registerChecker(checker);
    }
}
