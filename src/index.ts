import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { Trigger } from "oak-domain/lib/types/Trigger";
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-domain/EntityDict';
import { aspectDict as basicAspectDict } from 'oak-general-business';

import { Aspect } from 'oak-domain/lib/types/Aspect';
import { Feature } from './types/Feature';

import { Token as FeatureToken } from './features/token';
import { assign, keys, mapValues } from 'lodash';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { FrontContext } from './FrontContext';
import { RunningContext } from "oak-domain/lib/types/Context";
import { DebugStore, Context } from 'oak-debug-store';
import { Schema as Application } from "oak-domain/lib/base-domain/Application/Schema";
import { Schema as Token } from 'oak-domain/lib/base-domain/Token/Schema';
import { TriggerExecutor } from "oak-trigger-executor";
import { AspectProxy, InferAspect } from './types/AspectProxy';
import { CacheStore } from './dataStore/CacheStore';


type NewFeatureClazz<ED extends EntityDict & BaseEntityDict, AD extends Record<string, Aspect<ED>>> = new <P extends EntityDict & BaseEntityDict, Q extends Record<string, Aspect<P>>>(ap: AspectProxy<ED, AD & typeof basicAspectDict>) => Feature<P, Q>

function populateFeatures<
    ED extends EntityDict & BaseEntityDict,
    AD extends Record<string, Aspect<ED>>,
    FD extends Record<string, NewFeatureClazz<ED, AD>>>(featureClazzDict: FD, aspectProxy: AspectProxy<ED, AD & typeof basicAspectDict>)
    : {
        [T in keyof FD]: InstanceType<FD[T]>;
    } {
    const result = {};
    for (const k in featureClazzDict) {
        assign(result, {
            [k]: new featureClazzDict[k]<ED, AD>(aspectProxy),
        });
    }

    return result as any;
}

class DebugRunningContext<ED extends EntityDict> extends Context<ED> implements RunningContext<ED> {
    getApplication: () => Application;
    getToken: () => Token | undefined;

    constructor(store: DebugStore<ED>, ga: () => Application, gt: () => Token | undefined) {
        super(store);
        this.getApplication = ga;
        this.getToken = gt;
    }
};


async function createAspectProxy<ED extends BaseEntityDict & EntityDict, AD extends Record<string, Aspect<ED>>>(
    frontContext: FrontContext<ED>,
    storageSchema: StorageSchema<ED>,
    triggers: Array<Trigger<ED, keyof ED>>,
    applicationId: string,
    getTokenValue: () => string | undefined,
    aspectDict?: AD,
    initialData?: {
        [T in keyof ED]?: Array<ED[T]['OpSchema']>;
    }): Promise<AspectProxy<ED, AD & typeof basicAspectDict>> {
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

        const { result: [application] } = await debugStore.select('application', {
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
        }, context);
        const getApplication = () => application as Application;

        const connectAspectToDebugStore = async (aspect: Aspect<ED>) => {
            const context2 = new Context(debugStore);

            const tokenValue = getTokenValue();
            let token: Token | undefined;
            if (tokenValue) {
                const { result } = await debugStore.select('token', {
                    data: {
                        id: 1,
                        userId: 1,
                        playerId: 1,
                    },
                    filter: {
                        id: tokenValue,
                    }
                }, context2);
                token = result[0] as Token;
                // todo 判断 token的合法性
            }
            const getToken = () => token;
            const runningContext = new DebugRunningContext(debugStore, getApplication, getToken);
            const result = (params: Parameters<typeof aspect>[0]) => aspect(params, runningContext);

            frontContext.rowStore.sync(runningContext.opRecords, frontContext);
            return result;
        };

        const aspectDict2 = assign({}, basicAspectDict, aspectDict);
        const aspectProxy = mapValues(aspectDict2, ele => connectAspectToDebugStore(ele));

        return aspectProxy as any;
    }
}

export async function initialize<ED extends EntityDict & BaseEntityDict,
    AD extends Record<string, Aspect<ED>>,
    FD extends Record<string, NewFeatureClazz<ED, AD>>>(
        storageSchema: StorageSchema<ED>,
        applicationId: string,
        triggers?: Array<Trigger<ED, keyof ED>>,
        aspectDict?: AD,
        initialData?: {
            [T in keyof ED]?: Array<ED[T]['OpSchema']>;
        }) {

    /**
     * token这个feature的aspectProxy需要后注入，属于特例
     */
    const token = new FeatureToken<ED, AD>({} as any);
    // todo default triggers
    const cacheStore = new CacheStore<ED>(storageSchema);
    const frontContext = new FrontContext<ED>(cacheStore);
    const aspectProxy = await createAspectProxy(frontContext, storageSchema, triggers!, applicationId, () => token.getTokenValue(), aspectDict, initialData);

    const featureDict = {
        token,
    };
}
