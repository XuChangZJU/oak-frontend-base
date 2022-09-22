import { EntityDict, Context } from 'oak-domain/lib/types';
import { Feature } from '../types/Feature';
import { CommonAspectDict } from 'oak-common-aspect';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
export declare class EventBus<ED extends EntityDict & BaseEntityDict, Cxt extends Context<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Feature<ED, Cxt, AD> {
    private EventTable;
    sub(type: string, callback: Function): void;
    unsub(type: string, callback: Function): void;
    unsubAll(type: string): void;
    pub(type: string, options?: any): void;
}
