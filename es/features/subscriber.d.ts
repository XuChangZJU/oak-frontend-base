import { EntityDict, Aspect, OpRecord } from 'oak-domain/lib/types';
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
    private eventMap;
    private url?;
    private path?;
    private socket?;
    private socketState;
    private eventCallbackMap;
    constructor(cache: Cache<ED, Cxt, FrontCxt, AD>, message: Message, getSubscribePointFn: () => Promise<{
        url: string;
        path: string;
    }>);
    on(event: SubscribeEvent, callback: (...data: any) => void): void;
    off(event: SubscribeEvent, callback: () => void): void;
    private emit;
    private initSocketPoint;
    private connect;
    sub(events: string[], callback?: (event: string, opRecords: OpRecord<ED>[]) => void): Promise<void>;
    unsub(events: string[]): Promise<void>;
    getSubscriberId(): string | undefined;
}
export {};
