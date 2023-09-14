/// <reference types="wechat-miniprogram" />
export type PromisefyOption<T extends Record<string, any>> = Omit<T, 'success' | 'fail' | 'complete'>;
export type PromisefyResult<T extends WechatMiniprogram.AsyncMethodOptionLike> = Promise<Parameters<Exclude<T['success'], undefined>>[0]>;
