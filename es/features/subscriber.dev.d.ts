import { EntityDict, Aspect, OpRecord, SubDataDef } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { CommonAspectDict } from 'oak-common-aspect';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { Cache } from './cache';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import { Feature } from '../types/Feature';
declare type SubscribeEvent = 'connect' | 'disconnect';
export declare class SubScriber<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends CommonAspectDict<ED, Cxt> & Record<string, Aspect<ED, Cxt>>> extends Feature {
    private eventCallbackMap;
    constructor(cache: Cache<ED, Cxt, FrontCxt, AD>, getSubscribePointFn: () => Promise<{
        url: string;
        path: string;
    }>);
    on(event: SubscribeEvent, callback: () => void): void;
    off(event: SubscribeEvent, callback: () => void): void;
    sub(data: SubDataDef<ED, keyof ED>[], callback: (records: OpRecord<ED>[], ids: string[]) => void): Promise<void>;
    unsub(ids: string[]): Promise<void>;
}
export {};
