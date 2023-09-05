import { pull, unset } from 'oak-domain/lib/utils/lodash';
import { Feature } from '../types/Feature';
export class EventBus extends Feature {
    EventTable = {};
    sub(type, callback) {
        if (this.EventTable[type]) {
            this.EventTable[type].push(callback);
        }
        else {
            Object.assign(this.EventTable, {
                [type]: [callback],
            });
        }
    }
    unsub(type, callback) {
        pull(this.EventTable[type], callback);
    }
    unsubAll(type) {
        unset(this.EventTable, type);
    }
    pub(type, options) {
        if (this.EventTable[type]) {
            for (const f of this.EventTable[type]) {
                f(options);
            }
        }
    }
}
