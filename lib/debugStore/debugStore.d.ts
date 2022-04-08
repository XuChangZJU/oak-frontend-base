import { EntityDict, OperationResult, SelectionResult } from "oak-domain/lib/types/Entity";
import { TreeStore } from 'oak-memory-tree-store';
import { DebugContext } from './context';
import { TriggerExecutor } from 'oak-domain/lib/store/TriggerExecutor';
import { Trigger } from "oak-domain/lib/types/Trigger";
import { StorageSchema } from "oak-domain/lib/types/Storage";
export declare class DebugStore<ED extends EntityDict> extends TreeStore<ED> {
    private executor;
    constructor(executor: TriggerExecutor<ED>, storageSchema: StorageSchema<ED>, initialData?: {
        [T in keyof ED]?: {
            [ID: string]: ED[T]['OpSchema'];
        };
    });
    operate<T extends keyof ED>(entity: T, operation: ED[T]['Operation'], context: DebugContext<ED>, params?: Object): Promise<OperationResult>;
    select<T extends keyof ED>(entity: T, selection: ED[T]['Selection'], context: DebugContext<ED>, params?: Object): Promise<SelectionResult<ED, T>>;
    count<T extends keyof ED>(entity: T, selection: Omit<ED[T]['Selection'], 'data' | 'sorter' | 'action'>, context: DebugContext<ED>, params?: Object): Promise<number>;
    registerTrigger<T extends keyof ED>(trigger: Trigger<ED, T>): void;
}
