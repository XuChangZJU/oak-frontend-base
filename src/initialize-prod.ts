import {
    Aspect,
    AspectWrapper,
    Checker,
    StorageSchema,
    Context,
    RowStore,
} from 'oak-domain/lib/types';
import { OakExternalException } from 'oak-domain/lib/types/Exception';
import { EntityDict } from 'oak-domain/lib/types/Entity';

import { Feature } from './types/Feature';

import { initialize as createBasicFeatures, BasicFeatures } from './features';
import { assign, intersection, keys } from 'lodash';
import { ActionDictOfEntityDict } from 'oak-domain/lib/types/Action';
import { analyzeActionDefDict } from 'oak-domain/lib/store/actionDef';
import { CommonAspectDict } from 'oak-common-aspect';
import { CacheStore } from './cacheStore/CacheStore';


function makeContentTypeAndBody(data: any) {
    return {
        contentType: 'application/json',
        body: JSON.stringify(data),
    };
}
/**
 * @param storageSchema
 * @param createFeatures
 * @param contextBuilder
 * @param context
 * @param triggers
 * @param checkers
 * @param watchers
 * @param aspectDict
 * @param initialData
 * @param actionDict
 * @returns
 */
export function initialize<
    ED extends EntityDict,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>
>(
    storageSchema: StorageSchema<ED>,
    createFeatures: (
        aspectWrapper: AspectWrapper<ED, Cxt, AD>,
        basicFeatures: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>,
        context: Cxt
    ) => FD,
    contextBuilder: (cxtString?: string) => (store: RowStore<ED, Cxt>) => Cxt,
    serverUrl: string,
    checkers?: Array<Checker<ED, keyof ED, Cxt>>,
    actionDict?: ActionDictOfEntityDict<ED>
) {
    const cacheStore = new CacheStore(storageSchema, contextBuilder);
    if (checkers) {
        checkers.forEach((checker) => cacheStore.registerChecker(checker));
    }
    if (actionDict) {
        const { checkers: adCheckers } = analyzeActionDefDict(
            storageSchema,
            actionDict
        );
        adCheckers.forEach((checker) => cacheStore.registerChecker(checker));
    }
    const context = contextBuilder()(cacheStore);

    const wrapper: AspectWrapper<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> = {
        exec: async (name, params) => {
            const cxtStr = await context.toString();

            const { contentType, body } = makeContentTypeAndBody(params);
            const response = await global.fetch(serverUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': contentType,
                    'oak-cxt': cxtStr,
                    'oak-aspect': name as string,
                },
                body,
            });
            if (response.status > 299) {
                const err = new OakExternalException(`网络请求返回异常，status是${response.status}`);
                throw err;
            }
            // todo 处理各种异常
            const {
                result,
                opRecords
            } = await response.json();

            return {
                result,
                opRecords,
            };
        },
    };

    const basicFeatures = createBasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>(
        wrapper,
        storageSchema,
        context,
        cacheStore
    );

    // basicFeatures.runningNode.setStorageSchema(storageSchema);

    const userDefinedfeatures = createFeatures(wrapper, basicFeatures, context);

    const intersect = intersection(keys(basicFeatures), keys(userDefinedfeatures));
    if (intersect.length > 0) {
        throw new Error(
            `用户定义的feature中不能和系统feature同名：「${intersect.join(
                ','
            )}」`
        );
    }
    const features = assign(basicFeatures, userDefinedfeatures);

    return {
        features,
        context,
    };
}
