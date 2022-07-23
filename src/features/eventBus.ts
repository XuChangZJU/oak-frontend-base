import { EntityDict, Context } from 'oak-domain/lib/types';
import { Feature } from '../types/Feature';
import { CommonAspectDict } from 'oak-common-aspect';
import { pull, unset } from 'oak-domain/lib/utils/lodash';

export class EventBus<ED extends EntityDict, Cxt extends Context<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Feature<ED, Cxt, AD> {
    private EventTable: Record<string, Function[]> = {};

    sub(type: string, callback: Function) {
        if (this.EventTable[type]) {
            this.EventTable[type].push(callback);
        }
        else {
            Object.assign(this.EventTable, {
                [type]: [callback],
            });
        }
    }

    unsub(type: string, callback: Function) {
        pull(this.EventTable[type], callback);
    }

    unsubAll(type: string) {
        unset(this.EventTable, type);
    }

    pub(type: string, options?: any) {
        if (this.EventTable[type]) {
            for (const f of this.EventTable[type]) {
                f(options);
            }
        }
    }
}
