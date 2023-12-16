import { assert } from 'oak-domain/lib/utils/assert';
import { pull } from 'oak-domain/lib/utils/lodash';
import io from '../utils/socket.io/socket.io';
import { Feature } from '../types/Feature';
export class SubScriber extends Feature {
    cache;
    message;
    getSubscribePointFn;
    events = [];
    url;
    path;
    socket;
    socketState = 'unconnected';
    eventCallbackMap = {
        connect: [],
        disconnect: [],
    };
    constructor(cache, message, getSubscribePointFn) {
        super();
        this.cache = cache;
        this.message = message;
        this.getSubscribePointFn = getSubscribePointFn;
    }
    on(event, callback) {
        this.eventCallbackMap[event].push(callback);
    }
    off(event, callback) {
        pull(this.eventCallbackMap[event], callback);
    }
    emit(event, ...data) {
        this.eventCallbackMap[event].forEach((ele) => ele(data));
    }
    async initSocketPoint() {
        const { url, path } = await this.getSubscribePointFn();
        this.url = url;
        this.path = path;
    }
    async connect() {
        this.socketState = 'connecting';
        let optionInited = false;
        if (!this.url) {
            await this.initSocketPoint();
            optionInited = true;
        }
        const url = this.url;
        const path = this.path;
        this.socket = io(url, {
            path,
        });
        const socket = this.socket;
        return new Promise((resolve, reject) => {
            /**
             * https://socket.io/zh-CN/docs/v4/client-socket-instance/
             */
            socket.on('connect', async () => {
                this.socketState = 'connected';
                this.emit('connect');
                socket.off('connect');
                socket.on('disconnect', () => {
                    this.socketState = 'unconnected';
                    this.emit('disconnect');
                    socket.removeAllListeners();
                    if (this.events.length > 0) {
                        this.connect();
                    }
                });
                socket.on('data', (opRecords, ids) => {
                    this.cache.sync(opRecords);
                });
                socket.on('error', (errString) => {
                    console.error(errString);
                    this.message.setMessage({
                        type: 'error',
                        title: '服务器subscriber抛出异常',
                        content: errString,
                    });
                });
                if (this.events.length > 0) {
                    socket.emit('sub', this.events);
                    resolve(undefined);
                }
                else {
                    resolve(undefined);
                    socket.disconnect();
                }
            });
            if (!optionInited) {
                let count = 0;
                socket.on('connect_error', async () => {
                    count++;
                    if (count > 10) {
                        // 可能socket地址改变了，刷新重连
                        socket.removeAllListeners();
                        socket.disconnect();
                        this.url = undefined;
                        await this.connect();
                        resolve(undefined);
                    }
                });
            }
            socket.connect();
        });
    }
    async sub(events) {
        events.forEach((event) => {
            assert(!this.events.includes(event), `[subscriber]注册回调的id${event}发生重复`);
            this.events.push(event);
        });
        if (this.socketState === 'unconnected') {
            return this.connect();
        }
        else if (this.socketState === 'connected') {
            return new Promise((resolve, reject) => {
                this.socket.emit('sub', events, (result) => {
                    if (result) {
                        this.message.setMessage({
                            type: 'error',
                            title: 'sub data error',
                            content: result,
                        });
                        reject();
                    }
                    else {
                        resolve(undefined);
                    }
                });
            });
        }
    }
    async unsub(events) {
        events.forEach((event) => pull(this.events, event));
        if (this.socketState === 'connected') {
            this.socket.emit('unsub', events);
            if (this.events.length === 0) {
                this.socket.disconnect();
                this.socket.removeAllListeners();
                this.socketState = 'unconnected';
            }
        }
    }
    getSubscriberId() {
        if (this.socket) {
            return this.socket.id;
        }
    }
}
