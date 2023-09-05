import { assert } from 'oak-domain/lib/utils/assert';
import { EntityDict, Aspect, OpRecord, SubDataDef } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { CommonAspectDict } from 'oak-common-aspect';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { pull, omit } from 'oak-domain/lib/utils/lodash';
import { Cache } from './cache';
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
    private eventCallbackMap: Record<SubscribeEvent, Array<() => void>> = {
        connect: [],
        disconnect: [],
    };

    constructor(
        cache: Cache<ED, Cxt, FrontCxt, AD>,
        getSubscribePointFn: () => Promise<{
            url: string;
            path: string;
        }>
    ) {
        super();
    }

    on(event: SubscribeEvent, callback: () => void) {
        this.eventCallbackMap[event].push(callback);
    }

    off(event: SubscribeEvent, callback: () => void) {
        pull(this.eventCallbackMap[event], callback);
    }

    async sub(
        data: SubDataDef<ED, keyof ED>[],
        callback: (records: OpRecord<ED>[], ids: string[]) => void
    ) {
        console.log('data subscribe 在dev模式下不起作用');
    }

    async unsub(ids: string[]) {}
}
