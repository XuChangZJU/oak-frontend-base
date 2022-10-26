import { Context, EntityDict } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { OakComponentOption, ComponentFullThisType } from './types/Page';
export declare function subscribe<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends Context<ED>>(this: ComponentFullThisType<ED, T, Cxt>): void;
export declare function unsubscribe<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends Context<ED>>(this: ComponentFullThisType<ED, T, Cxt>): void;
export declare function onPathSet<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends Context<ED>>(this: ComponentFullThisType<ED, T, Cxt>, option: OakComponentOption<ED, T, Cxt, any, any, any, any, any, {}, {}, {}>): Promise<void>;
export declare function reRender<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends Context<ED>>(this: ComponentFullThisType<ED, T, Cxt>, option: OakComponentOption<ED, T, Cxt, any, any, any, any, any, {}, {}, {}>, extra?: Record<string, any>): Promise<void>;
export declare function refresh<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends Context<ED>>(this: ComponentFullThisType<ED, T, Cxt>): Promise<void>;
export declare function loadMore<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends Context<ED>>(this: ComponentFullThisType<ED, T, Cxt>): Promise<void>;
export declare function execute<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends Context<ED>>(this: ComponentFullThisType<ED, T, Cxt>, operation?: ED[T]['Operation']): Promise<any[] | (ED[keyof ED]["Operation"] & {
    entity: keyof ED;
})[]>;
export declare function callPicker<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends Context<ED>>(this: ComponentFullThisType<ED, T, Cxt>, attr: string, params?: Record<string, any>): void;
export declare function setUpdateData<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends Context<ED>>(this: ComponentFullThisType<ED, T, Cxt>, attr: string, data: any): Promise<void>;
export declare function setMultiAttrUpdateData<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends Context<ED>>(this: ComponentFullThisType<ED, T, Cxt>, data: Record<string, any>): Promise<void>;
