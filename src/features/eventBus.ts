import { pull, unset } from 'oak-domain/lib/utils/lodash';
import { Feature } from '../types/Feature';

export class EventBus extends Feature {
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
