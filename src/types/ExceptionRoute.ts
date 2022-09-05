import { OakException } from "oak-domain/lib/types";

export interface ExceptionHandler {
    hidden?: true; // 异常不显示警告
    level?: 'warning' | 'error'; // 警告提示程度
    handler?: (error: OakException) => void; // 如果是route则跳转，是函数则回调
    router?: string;
    disableNamespace?: boolean; //禁用路由前缀
};

export type ExceptionRouters = Array<[new (...args: any) => OakException, ExceptionHandler]>;
