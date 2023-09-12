import { assert } from 'oak-domain/lib/utils/assert';
import { pull, omit } from 'oak-domain/lib/utils/lodash';
import io from '../utils/socket.io/socket.io';
import { Feature } from '../types/Feature';
export class SubScriber extends Feature {
    cache;
    getSubscribePointFn;
    subDataMap = {};
    url;
    path;
    socket;
    socketState = 'unconnected';
    eventCallbackMap = {
        connect: [],
        disconnect: [],
    };
    constructor(cache, getSubscribePointFn) {
        super();
        this.cache = cache;
        this.getSubscribePointFn = getSubscribePointFn;
    }
    on(event, callback) {
        this.eventCallbackMap[event].push(callback);
    }
    off(event, callback) {
        pull(this.eventCallbackMap[event], callback);
    }
    emit(event) {
        this.eventCallbackMap[event].forEach((ele) => ele());
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
        context.commit();
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
                if (Object.keys(this.subDataMap).length > 0) {
                    socket.emit('sub', this.subDataMap, (success) => {
                    });
                }
                else {
                    socket.disconnect();
                }
                resolve(undefined);
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
            this.connect();
        }
        else if (this.socketState === 'connected') {
            this.socket?.emit('sub', data);
        }
    }
    async unsub(ids) {
        ids.forEach((id) => omit(this.subDataMap, id));
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
