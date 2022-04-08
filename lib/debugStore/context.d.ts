import { EntityDict } from "oak-domain/lib/types/Entity";
import { Context as BaseContext } from 'oak-memory-tree-store';
export declare class DebugContext<ED extends EntityDict> extends BaseContext<ED> {
    txn?: {
        events: {
            commit: Array<(context: DebugContext<ED>) => Promise<void>>;
            rollback: Array<(context: DebugContext<ED>) => Promise<void>>;
        };
    };
    on(event: "commit" | "rollback", callback: (context: any) => Promise<void>): void;
    begin(options?: object): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
}
