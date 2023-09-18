import { pull } from 'oak-domain/lib/utils/lodash';
import { Feature } from '../types/Feature';
export class SubScriber extends Feature {
    eventCallbackMap = {
        connect: [],
        disconnect: [],
    };
    constructor(cache, getSubscribePointFn) {
        super();
    }
    on(event, callback) {
        this.eventCallbackMap[event].push(callback);
    }
    off(event, callback) {
        pull(this.eventCallbackMap[event], callback);
    }
    async sub(data, callback) {
        console.log('data subscribe 在dev模式下不起作用');
    }
    async unsub(ids) { }
    getSubscriberId() {
        return undefined;
    }
}
