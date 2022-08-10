import { EntityDict, OperateOption, OperationResult, OpRecord, SelectOption } from 'oak-domain/lib/types/Entity';
import { StorageSchema } from "oak-domain/lib/types/Storage";
import { Checker, Context } from 'oak-domain/lib/types';
import { TreeStore } from 'oak-memory-tree-store';
export declare class CacheStore<ED extends EntityDict, Cxt extends Context<ED>> extends TreeStore<ED, Cxt> {
    private executor;
    private getFullDataFn?;
    constructor(storageSchema: StorageSchema<ED>, contextBuilder: (cxtString: string) => (store: CacheStore<ED, Cxt>) => Cxt, getFullDataFn?: () => any);
    operate<T extends keyof ED, OP extends OperateOption>(entity: T, operation: ED[T]['Operation'], context: Cxt, option?: OP): Promise<OperationResult<ED>>;
    sync(opRecords: Array<OpRecord<ED>>, context: Cxt): Promise<void>;
    select<T extends keyof ED, S extends ED[T]['Selection'], OP extends SelectOption>(entity: T, selection: S, context: Cxt, option?: OP): Promise<import("oak-domain/lib/types").SelectionResult<ED[T]["Schema"], S["data"]>>;
    registerChecker<T extends keyof ED>(checker: Checker<ED, T, Cxt>): void;
    /**
     * 这个函数是在debug下用来获取debugStore的数据，release下不能使用
     * @returns
     */
    getFullData(): any;
}
