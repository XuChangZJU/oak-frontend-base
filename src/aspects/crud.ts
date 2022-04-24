import { OperateParams, EntityDict, Context } from 'oak-domain/lib/types';

export async function operate<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>>(
    options: { entity: T, operation: ED[T]['Operation'] | ED[T]['Operation'][], params?: OperateParams }, context: Cxt) {
    const { entity, operation, params } = options;
    if (operation instanceof Array) {
        return operation.map(
            (oper) => context.rowStore.operate(entity, oper, context, params)
        );
    }
    return context.rowStore.operate(entity, operation, context, params);
}

export async function select<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>>(
    options: { entity: T, selection: ED[T]['Selection'], params?: object }, context: Cxt) {
        const { entity, selection, params } = options;
    return context.rowStore.select(entity, selection, context, params);
}

/* 
export type AspectDict<ED extends EntityDict> = {
    operation: <T extends keyof ED>(options: { entity: T, operation: ED[T]['Operation'], params?: OperateParams }, context: Context<ED>) => Promise<OperationResult>;
    select: <T extends keyof ED, S extends ED[T]['Selection']>( options: { entity: T, selection: S, params?: object }, context: Context<ED>) => Promise<SelectionResult2<ED[T]['Schema'], S>>;
}; */
