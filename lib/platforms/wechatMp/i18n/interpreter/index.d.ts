declare type Element = string | any;
declare type AST = Array<Element>;
export declare function interpret(message: AST, params?: Record<string, any>): string;
export {};