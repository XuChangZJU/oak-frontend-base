import { EntityDict } from 'oak-domain/lib/types/entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-domain/EntityDict';
import { Aspect } from 'oak-domain/lib/types/Aspect';
import { Context as BaseContext } from 'oak-memory-tree-store';
import { TriggerExecutor } from "oak-trigger-executor";
import { AspectProxy } from './types/AspectProxy';
import { CacheStore } from './dataStore/CacheStore';
import BaseAspectProxy from './aspects/index';
import { assign } from 'lodash';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { Trigger } from 'oak-domain/lib/types/Trigger';
import { RunningContext } from "oak-domain/lib/types/Context";
import { DebugStore, Context } from 'oak-debug-store';
import { Schema as Token } from 'oak-domain/lib/base-domain/Token/Schema';
import { Schema as Application } from "oak-domain/lib/base-domain/Application/Schema";


class DebugRunningContext<ED extends EntityDict> extends Context<ED> implements RunningContext<ED> {
    getApplication: () => Application;
    getToken: () => Token | undefined;

    constructor(store: DebugStore<ED>, ga: () => Application, gt: () => Token | undefined) {
        super(store);
        this.getApplication = ga;
        this.getToken = gt;
    }
};

export async function createAspectProxy<ED extends EntityDict, AD extends Record<string, Aspect<ED>>>(
    storageSchema: StorageSchema<ED>,
    triggers: Array<Trigger<ED, keyof ED>>,
    applicationId: string,
    getTokenValue: () => string | undefined,
    aspectDict?: AD,
    initialData?: {
        [T in keyof ED]?: Array<ED[T]['OpSchema']>;
    }): Promise<AspectProxy<ED, AD & typeof BaseAspectProxy>> {
    if (process.env.NODE_ENV === 'production') {
        // todo 发请求到后台获取数据
        throw new Error('method not implemented');
    }
    else {
        // todo initialData
        const executor = new TriggerExecutor<ED>();
        const debugStore = new DebugStore<ED>(executor, storageSchema);
        triggers.forEach(
            (trigger) => debugStore.registerTrigger(trigger)
        );
        const context = new Context(debugStore);

        const { result: [application] } = await (<DebugStore<BaseEntityDict>><unknown>debugStore).select('application', {
            data: {
                id: 1,
                systemId: 1,
                system: {
                    id: 1,
                },
            },
            filter: {
                id: applicationId,
            }
        }, <Context<BaseEntityDict>><unknown>context);
        const getApplication = () => application as Application;
        const FullAspectProxy = assign(BaseAspectProxy, aspectDict);

        return async (name, params) => {
            const aspect = FullAspectProxy[name];
            const context2 = new Context(debugStore);

            const tokenValue = getTokenValue();
            let token: Token | undefined;
            if (tokenValue) {
                const { result } = await (<DebugStore<BaseEntityDict>><unknown>debugStore).select('token', {
                    data: {
                        id: 1,
                        userId: 1,
                        playerId: 1,
                    },
                    filter: {
                        id: tokenValue,
                    }
                }, <Context<BaseEntityDict>><unknown>context2);
                token = result[0] as Token;
                // todo 判断 token的合法性
            }
            const getToken = () => token;
            const runningContext = new DebugRunningContext(debugStore, getApplication, getToken);
            return aspect(params, runningContext);
        }
    }
}

export class FrontContext<ED extends EntityDict, AD extends Record<string, Aspect<ED>>> extends BaseContext<ED> {
    getAspectProxy: () => Promise<AspectProxy<ED, AD & typeof BaseAspectProxy>>;

    constructor(
        storageSchema: StorageSchema<ED>,
        triggers: Array<Trigger<ED, keyof ED>>,
        applicationId: string,
        getTokenValue: () => string | undefined,
        aspectDict?: AD,
        initialData?: {
            [T in keyof ED]?: Array<ED[T]['OpSchema']>;
        }) {
        super(new CacheStore<ED>(storageSchema));

        const ap = createAspectProxy<ED, AD>(storageSchema, triggers, applicationId, getTokenValue, aspectDict, initialData);
        this.getAspectProxy = () => ap;
    }
};