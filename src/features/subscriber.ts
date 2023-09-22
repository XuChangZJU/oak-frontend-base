import { assert } from 'oak-domain/lib/utils/assert';
import { EntityDict, Aspect, OpRecord, SubDataDef } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { CommonAspectDict } from 'oak-common-aspect';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { pull, omit, unset } from 'oak-domain/lib/utils/lodash';
import { Cache } from './cache';
import { Message } from './message';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import io, { Socket } from '../utils/socket.io/socket.io';
import { Feature } from '../types/Feature';

type SubscribeEvent = 'connect' | 'disconnect';

export class SubScriber<
    ED extends EntityDict & BaseEntityDict,
    Cxt extends AsyncContext<ED>,
    FrontCxt extends SyncContext<ED>,
    AD extends CommonAspectDict<ED, Cxt> & Record<string, Aspect<ED, Cxt>>
> extends Feature {
    private cache: Cache<ED, Cxt, FrontCxt, AD>;
    private message: Message;
    private getSubscribePointFn: () => Promise<{
        url: string;
        path: string;
    }>;
    private subDataMap: Record<
        string,
        {
            callback?: (records: OpRecord<ED>[], ids: string[]) => void,
        } & SubDataDef<ED, keyof ED>
    > = {};
    
    private url?: string;
    private path?: string;
    private socket?: Socket;

    private socketState: 'connecting' | 'connected' | 'unconnected' = 'unconnected';

    private eventCallbackMap: Record<SubscribeEvent, Array<(...data: any) => void>> = {
        connect: [],
        disconnect: [],
    };

    constructor(
        cache: Cache<ED, Cxt, FrontCxt, AD>,
        message: Message,
        getSubscribePointFn: () => Promise<{
            url: string;
            path: string;
        }>
    ) {
        super();
        this.cache = cache;
        this.message = message;
        this.getSubscribePointFn = getSubscribePointFn;
    }

    on(event: SubscribeEvent, callback: (...data: any) => void) {
        this.eventCallbackMap[event].push(callback);
    }

    off(event: SubscribeEvent, callback: () => void) {
        pull(this.eventCallbackMap[event], callback);
    }

    private emit(event: SubscribeEvent, ...data: any) {
        this.eventCallbackMap[event].forEach((ele) => ele(data));
    }

    private async initSocketPoint() {
        const { url, path } = await this.getSubscribePointFn();
        this.url = url;
        this.path = path;
    }

    private async connect(): Promise<void> {
        let optionInited = false;
        if (!this.url) {
            await this.initSocketPoint();
            optionInited = true;
        }

        const url = this.url!;
        const path = this.path!;
        const context = this.cache.begin();
        this.cache.commit();
        
        this.socket = io(url, {
            path,
            extraHeaders: {
                'oak-cxt': context.toString(),
            },
        });
        const socket = this.socket!;
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

                socket.on('data', (opRecords: OpRecord<ED>[], ids: string[]) => {
                    this.cache.sync(opRecords);
                    ids.forEach(
                        (id) => {
                            this.subDataMap[id] && this.subDataMap[id].callback && this.subDataMap[id].callback!(opRecords, ids)
                        }
                    );
                });

                socket.on('error', (errString) => {
                    console.error(errString);
                    this.message.setMessage({
                        type: 'error',
                        title: '服务器subscriber抛出异常',
                    });
                })

                if (Object.keys(this.subDataMap).length > 0) {
                    const data = Object.values(this.subDataMap).map(
                        ele => omit(ele, 'callback')
                    );
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

    async sub(
        data: SubDataDef<ED, keyof ED>[],
        callback?: (records: OpRecord<ED>[], ids: string[]) => void
    ): Promise<void> {
        data.forEach(({ entity, id, filter }) => {
            assert(
                !this.subDataMap[id],
                `[subscriber]注册回调的id${id}发生重复`
            );
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
            return new Promise(
                (resolve, reject) => {
                    this.socket!.emit('sub', data, (result: string) => {
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
            );
        }
    }

    async unsub(ids: string[]) {
        ids.forEach((id) => unset(this.subDataMap, id));

        if (this.socketState === 'connected') {
            this.socket!.emit('unsub', ids);
        }

        if (this.socketState !== 'unconnected') {
            if (Object.keys(this.subDataMap).length === 0) {
                this.socket!.disconnect();
                this.socket!.removeAllListeners();
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
