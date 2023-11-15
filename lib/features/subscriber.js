"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubScriber = void 0;
const tslib_1 = require("tslib");
const assert_1 = require("oak-domain/lib/utils/assert");
const lodash_1 = require("oak-domain/lib/utils/lodash");
const socket_io_1 = tslib_1.__importDefault(require("../utils/socket.io/socket.io"));
const Feature_1 = require("../types/Feature");
class SubScriber extends Feature_1.Feature {
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
        (0, lodash_1.pull)(this.eventCallbackMap[event], callback);
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
        const context = this.cache.begin();
        this.cache.commit();
        this.socket = (0, socket_io_1.default)(url, {
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
                    ids.forEach((id) => {
                        this.subDataMap[id] && this.subDataMap[id].callback && this.subDataMap[id].callback(opRecords, ids);
                    });
                });
                socket.on('error', (errString) => {
                    console.error(errString);
                    this.message.setMessage({
                        type: 'error',
                        title: '服务器subscriber抛出异常',
                    });
                });
                if (Object.keys(this.subDataMap).length > 0) {
                    const data = Object.values(this.subDataMap).map(ele => (0, lodash_1.omit)(ele, 'callback'));
                    socket.emit('sub', data);
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
    async sub(data, callback) {
        data.forEach(({ entity, id, filter }) => {
            (0, assert_1.assert)(!this.subDataMap[id], `[subscriber]注册回调的id${id}发生重复`);
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
        ids.forEach((id) => (0, lodash_1.unset)(this.subDataMap, id));
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
    getSubscriberId() {
        if (this.socket) {
            return this.socket.id;
        }
    }
}
exports.SubScriber = SubScriber;
