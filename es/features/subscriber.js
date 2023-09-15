import { assert } from 'oak-domain/lib/utils/assert';
import { pull, omit, unset } from 'oak-domain/lib/utils/lodash';
import io from '../utils/socket.io/socket.io';
import { Feature } from '../types/Feature';
export class SubScriber extends Feature {
    cache;
    message;
    getSubscribePointFn;
    subDataMap = {};
    url;
    path;
    socket;
    socketState = 'unconnected';
    eventCallbackMap = {
        connect: [],
        disconnect: [],
        data: [],
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
        let optionInited = false;
        if (!this.url) {
            await this.initSocketPoint();
            optionInited = true;
        }
        const url = this.url;
        const path = this.path;
        const context = this.cache.begin();
        this.cache.commit();
        this.socket = io(url, {
            path,
            extraHeaders: {
                'oak-cxt': context.toString(),
            },
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
                    if (Object.keys(this.subDataMap).length > 0) {
                        this.connect();
                    }
                });
                socket.on('data', (opRecords, ids) => {
                    this.cache.sync(opRecords);
                    this.emit('data', {
                        ids,
                        opRecords,
                    });
                });
                if (Object.keys(this.subDataMap).length > 0) {
                    const data = Object.values(this.subDataMap).map(ele => omit(ele, 'callback'));
                    socket.emit('sub', data, (result) => {
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
    async sub(data, callback) {
        data.forEach(({ entity, id, filter }) => {
            assert(!this.subDataMap[id], `[subscriber]注册回调的id${id}发生重复`);
            this.subDataMap[id] = {
                callback,
                entity,
                id,
                filter,
            };
        });
        if (this.socketState === 'unconnected') {
            return this.connect();
        }
        else if (this.socketState === 'connected') {
            return new Promise((resolve, reject) => {
                this.socket.emit('sub', data, (result) => {
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
    async unsub(ids) {
        ids.forEach((id) => unset(this.subDataMap, id));
        if (this.socketState === 'connected') {
            this.socket.emit('unsub', ids);
        }
        if (this.socketState !== 'unconnected') {
            if (Object.keys(this.subDataMap).length === 0) {
                this.socket.disconnect();
                this.socket.removeAllListeners();
                this.socketState = 'unconnected';
            }
        }
    }
}
