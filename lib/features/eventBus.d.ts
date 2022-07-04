import { EntityDict, Context } from 'oak-domain/lib/types';
import { Feature } from '../types/Feature';
import { CommonAspectDict } from 'oak-common-aspect';
export declare class EventBus<ED extends EntityDict, Cxt extends Context<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Feature<ED, Cxt, AD> {
    private EventTable;
    sub(type: string, callback: Function): void;
    unsub(type: string, callback: Function): void;
    pub(type: string, options?: any): void;
}
