import assert from 'assert';
import { EntityDict } from "oak-domain/lib/types/Entity";
import { Context as BaseContext } from 'oak-memory-tree-store';

export class DebugContext<ED extends EntityDict> extends BaseContext<ED> {
    txn?: {
        events: {
            commit: Array<(context: DebugContext<ED>) => Promise<void>>;
            rollback: Array<(context: DebugContext<ED>) => Promise<void>>;
        }
    };
    on (event: "commit" | "rollback", callback: (context: any) => Promise<void>): void {
        this.txn!.events[event].push(callback);
    }
    
    async begin(options?: object): Promise<void> {
        assert(!this.txn);
        await super.begin();
        this.txn = {
            events: {
                commit: [],
                rollback: [],
            },
        };
    }
    async commit(): Promise<void> {
        await super.commit();
        for (const fn of this.txn!.events.commit) {
            await fn(this);
        }
        this.txn = undefined;
    }
    async rollback(): Promise<void> {
        await super.rollback();
        for (const fn of this.txn!.events.rollback) {
            await fn(this);
        }
        this.txn = undefined;
    }
}