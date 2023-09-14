import { EntityDict, Aspect, OpRecord, SubDataDef } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { CommonAspectDict } from 'oak-common-aspect';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { Cache } from './cache';
import { Message } from './message';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import { Feature } from '../types/Feature';
type SubscribeEvent = 'connect' | 'disconnect';
export declare class SubScriber<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends CommonAspectDict<ED, Cxt> & Record<string, Aspect<ED, Cxt>>> extends Feature {
    private cache;
    private message;
    private getSubscribePointFn;
    private subDataMap;
    private url?;
    private path?;
    private socket?;
    private socketState;
    private eventCallbackMap;
    constructor(cache: Cache<ED, Cxt, FrontCxt, AD>, message: Message, getSubscribePointFn: () => Promise<{
        url: string;
        path: string;
    }>);
    on(event: SubscribeEvent, callback: () => void): void;
    off(event: SubscribeEvent, callback: () => void): void;
    private emit;
    private initSocketPoint;
    private connect;
    sub(data: SubDataDef<ED, keyof ED>[], callback?: (records: OpRecord<ED>[], ids: string[]) => void): Promise<void>;
    unsub(ids: string[]): Promise<void>;
}
export {};
