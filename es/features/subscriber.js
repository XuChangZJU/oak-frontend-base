import { assert } from 'oak-domain/lib/utils/assert';
import { pull, omit } from 'oak-domain/lib/utils/lodash';
import io from '../utils/socket.io/socket.io';
import { Feature } from '../types/Feature';
export class SubScriber extends Feature {
    cache;
    getSubscribePointFn;
    callbackMap = {};
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
    async initSocketOption() {
        const { url, path } = await this.getSubscribePointFn();
        const socket = io(url, {
            path,
        });
        this.socket = socket;
    }
    async login() { }
    async connect() {
        let optionInited = false;
        if (!this.socket) {
            await this.initSocketOption();
            optionInited = true;
        }
        const socket = this.socket;
        return new Promise((resolve, reject) => {
            /**
             * https://socket.io/zh-CN/docs/v4/client-socket-instance/
             */
            socket.on('connect', async () => {
                // 验证身份
                this.socketState = 'connected';
                this.emit('connect');
                socket.off('connect');
                socket.on('disconnect', () => {
                    this.socketState = 'unconnected';
                    this.emit('disconnect');
                    socket.removeAllListeners();
                    if (Object.keys(this.callbackMap).length > 0) {
                        this.connect();
                    }
                });
                await this.login();
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
                        this.socket = undefined;
                        await this.connect();
                        resolve(undefined);
                    }
                });
            }
            socket.connect();
        });
    }
    async sub(data, callback) {
        const ids = data.map((ele) => ele.id);
        if (callback) {
            ids.forEach((id) => {
                assert(!this.callbackMap[id], `[subscriber]注册回调的id${id}发生重复`);
                this.callbackMap[id] = callback;
            });
        }
        if (this.socketState === 'unconnected') {
            this.connect();
        }
        else if (this.socketState === 'connected') {
            this.socket?.emit('sub', data);
        }
    }
    async unsub(ids) {
        ids.forEach((id) => omit(this.callbackMap, id));
        if (this.socketState === 'connected') {
            this.socket.emit('unsub', ids);
        }
        if (this.socketState !== 'unconnected') {
            if (Object.keys(this.callbackMap).length === 0) {
                this.socket.disconnect();
                this.socket.removeAllListeners();
                this.socketState = 'unconnected';
            }
        }
    }
}
