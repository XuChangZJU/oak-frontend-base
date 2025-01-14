import { EntityDict } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { OakComponentOption, ComponentFullThisType, OakComponentData } from './types/Page';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { MessageProps } from './types/Message';
export declare function onPathSet<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>>(this: ComponentFullThisType<ED, T, any, Cxt, FrontCxt> & {
    addFeatureSub: (name: string, callback: (args?: any) => void) => void;
}, option: OakComponentOption<any, ED, T, Cxt, FrontCxt, any, any, any, {}, {}, {}>): Partial<OakComponentData<ED, T>>;
export declare function reRender<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>>(this: ComponentFullThisType<ED, T, any, Cxt, FrontCxt>, option: OakComponentOption<any, ED, T, Cxt, FrontCxt, any, any, any, {}, {}, {}>, extra?: Record<string, any>): void;
export declare function refresh<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>>(this: ComponentFullThisType<ED, T, any, Cxt, FrontCxt>): Promise<void>;
export declare function loadMore<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>>(this: ComponentFullThisType<ED, T, any, Cxt, FrontCxt>): Promise<void>;
export declare function execute<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>>(this: ComponentFullThisType<ED, T, any, Cxt, FrontCxt>, action?: ED[T]['Action'], path?: string, messageProps?: boolean | MessageProps, //默认true
opers?: Array<{
    entity: T;
    operation: ED[T]['Operation'];
}>): Promise<void>;
export declare function destroyNode<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>>(this: ComponentFullThisType<ED, T, any, Cxt, FrontCxt>): void;
