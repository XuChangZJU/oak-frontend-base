"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.select = exports.operate = void 0;
async function operate(options, context) {
    const { entity, operation, params } = options;
    if (operation instanceof Array) {
        return operation.map((oper) => context.rowStore.operate(entity, oper, context, params));
    }
    return context.rowStore.operate(entity, operation, context, params);
}
exports.operate = operate;
async function select(options, context) {
    const { entity, selection, params } = options;
    return context.rowStore.select(entity, selection, context, params);
}
exports.select = select;
/*
export type AspectDict<ED extends EntityDict> = {
    operation: <T extends keyof ED>(options: { entity: T, operation: ED[T]['Operation'], params?: OperateParams }, context: Context<ED>) => Promise<OperationResult>;
    select: <T extends keyof ED, S extends ED[T]['Selection']>( options: { entity: T, selection: S, params?: object }, context: Context<ED>) => Promise<SelectionResult2<ED[T]['Schema'], S>>;
}; */
