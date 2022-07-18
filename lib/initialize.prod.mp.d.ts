import './utils/wx.polyfill';
import { Aspect, AspectWrapper, Checker, StorageSchema, Context, RowStore, Connector } from 'oak-domain/lib/types';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { Feature } from './types/Feature';
import { BasicFeatures } from './features';
import { ActionDictOfEntityDict } from 'oak-domain/lib/types/Action';
import { CommonAspectDict } from 'oak-common-aspect';
import { ExceptionRouters } from './types/ExceptionRoute';
export declare function initialize<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>>(storageSchema: StorageSchema<ED>, createFeatures: (aspectWrapper: AspectWrapper<ED, Cxt, AD>, basicFeatures: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>, context: Cxt) => FD, contextBuilder: (cxtString?: string) => (store: RowStore<ED, Cxt>) => Cxt, exceptionRouters: ExceptionRouters | undefined, connector: Connector<ED, Cxt>, checkers?: Array<Checker<ED, keyof ED, Cxt>>, actionDict?: ActionDictOfEntityDict<ED>, translations?: Record<string, any>): {
    i18n: import("./platforms/wechatMp/i18n").I18nWechatMpRuntimeBase;
};
