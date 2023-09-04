import assert from "assert";
import { EntityDict, Aspect, OpRecord, SubDataDef } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { CommonAspectDict } from 'oak-common-aspect';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { pull, omit } from 'oak-domain/lib/utils/lodash';
import { Cache } from './cache';
import { SyncContext } from "oak-domain/lib/store/SyncRowStore";
import io, { Socket } from '../utils/socket.io/socket.io';
import { Feature } from "../types/Feature";

type SubscribeEvent = 'connect' | 'disconnect';

export class SubScriber<
    ED extends EntityDict & BaseEntityDict,
    Cxt extends AsyncContext<ED>,
    FrontCxt extends SyncContext<ED>,
    AD extends CommonAspectDict<ED, Cxt> & Record<string, Aspect<ED, Cxt>>
> extends Feature {
    private cache: Cache<ED, Cxt, FrontCxt, AD>;
    private getSubscribePointFn: () => Promise<{
        url: string;
        path: string;
    }>;
    private callbackMap: Record<string, (records: OpRecord<ED>[], ids: string[]) => void> = {};
    private socket?: Socket;
    private socketState: 'connecting' | 'connected' | 'unconnected' = 'unconnected';

    private eventCallbackMap: Record<SubscribeEvent, Array<() => void>> = {
        connect: [],
        disconnect: [],        
    };

    constructor(cache: Cache<ED, Cxt, FrontCxt, AD>, getSubscribePointFn: () => Promise<{
        url: string;
        path: string;
    }>) {
        super();
        this.cache = cache;
        this.getSubscribePointFn = getSubscribePointFn;
    }

    on(event: SubscribeEvent, callback: () => void) {
        this.eventCallbackMap[event].push(callback);
    }

    off(event: SubscribeEvent, callback: () => void) {
        pull(this.eventCallbackMap[event], callback);
    }

    private emit(event: SubscribeEvent) {
        this.eventCallbackMap[event].forEach(
            ele => ele()
        );
    }

    private async initSocketOption() {
        const { url, path } = await this.getSubscribePointFn();
        
        const socket = io(url, {
            path,
        });
        this.socket = socket;
    }

    private async login() {

    }

    private async connect() {
        let optionInited = false;
        if (!this.socket)  {
            await this.initSocketOption();
            optionInited = true;
        }

        const socket = this.socket!;
        return new Promise(
            (resolve, reject) => {
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
                        count ++;
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
            }
        );
    }

    async sub(data: SubDataDef<ED, keyof ED>[], callback?: (records: OpRecord<ED>[], ids: string[]) => void) {
        const ids = data.map(ele => ele.id);

        if (callback) {
            ids.forEach(
                (id) => {
                    assert(!this.callbackMap[id], `[subscriber]注册回调的id${id}发生重复`);
                    this.callbackMap[id] = callback;
                }
            );
        }

        if (this.socketState === 'unconnected') {
            this.connect();
        }
        else if (this.socketState === 'connected') {
            this.socket?.emit('sub', data);
        }
    }

    async unsub(ids: string[]) {
        ids.forEach(
            (id) => omit(this.callbackMap, id)
        );

        if (this.socketState === 'connected') {
            this.socket!.emit('unsub', ids);
        }

        if (this.socketState !== 'unconnected') {
            if (Object.keys(this.callbackMap).length === 0) {
                this.socket!.disconnect();
                this.socket!.removeAllListeners();
                this.socketState = 'unconnected';
            }
        }
    }
}