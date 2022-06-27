/// <reference types="wechat-miniprogram" />
/// <reference types="wechat-miniprogram" />
/// <reference types="wechat-miniprogram" />
/// <reference types="wechat-miniprogram" />
/// <reference types="wechat-miniprogram" />
/// <reference types="wechat-miniprogram" />
/// <reference types="wechat-miniprogram" />
import './polyfill';
import { Aspect, Checker, Context, EntityDict, RowStore, StorageSchema, Trigger, ActionDictOfEntityDict, Watcher, AspectWrapper } from 'oak-domain/lib/types';
import { Feature } from '../../types/Feature';
import { BasicFeatures } from '../../features';
import { ExceptionRouters } from '../../types/ExceptionRoute';
import { CommonAspectDict } from 'oak-common-aspect';
import { OakComponentOption, OakPageData, OakPageInstanceProperties, OakPageMethods, OakPageOption, OakPageProperties, OakWechatMpOptions } from './index';
export { initI18nWechatMp, I18nWechatMpRuntimeBase, getI18nInstanceWechatMp, } from './i18n';
export declare function initialize<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>>(storageSchema: StorageSchema<ED>, createFeatures: (aspectWrapper: AspectWrapper<ED, Cxt, AD>, basicFeatures: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>, context: Cxt) => FD, contextBuilder: (cxtString?: string) => (store: RowStore<ED, Cxt>) => Cxt, contextCreator: (store: RowStore<ED, Cxt>) => Cxt, aspectDict: AD, exceptionRouters?: ExceptionRouters, triggers?: Array<Trigger<ED, keyof ED, Cxt>>, checkers?: Array<Checker<ED, keyof ED, Cxt>>, watchers?: Array<Watcher<ED, keyof ED, Cxt>>, initialData?: {
    [T in keyof ED]?: Array<ED[T]['OpSchema']>;
}, actionDict?: ActionDictOfEntityDict<ED>): {
    OakPage: <T extends keyof ED, D extends WechatMiniprogram.Component.DataOption, P extends WechatMiniprogram.Component.PropertyOption, M extends WechatMiniprogram.Component.MethodOption, IsList extends boolean, Proj extends ED[T]["Selection"]["data"], IS extends WechatMiniprogram.IAnyObject = {}, FormedData extends WechatMiniprogram.Component.DataOption = {}>(options: OakPageOption<ED, T, Cxt, AD, FD, Proj, FormedData, IsList>, componentOptions?: WechatMiniprogram.Component.Options<D, P, M, IS & OakPageInstanceProperties<ED, Cxt, AD, FD>, true>) => string;
    OakComponent: <T_1 extends string | number, D_1 extends WechatMiniprogram.Component.DataOption, P_1 extends WechatMiniprogram.Component.PropertyOption, M_1 extends WechatMiniprogram.Component.MethodOption, IsList_1 extends boolean, IS_1 extends WechatMiniprogram.IAnyObject = {}, FormedData_1 extends WechatMiniprogram.Component.DataOption = {}>(options: OakComponentOption<ED, T_1, Cxt, AD, FD, FormedData_1, IsList_1>, componentOptions?: OakWechatMpOptions<D_1, P_1, M_1, OakPageProperties, OakPageMethods<ED, T_1>, OakPageData, OakPageInstanceProperties<ED, Cxt, AD, FD>, IS_1, true>) => string;
    features: BasicFeatures<ED, Cxt, {
        operate: typeof import("oak-common-aspect/src/crud").operate;
        select: typeof import("oak-common-aspect/src/crud").select;
        amap: typeof import("oak-common-aspect/src/amap").amap;
        getTranslations: typeof import("oak-common-aspect/src/locales").getTranslations;
    } & AD> & FD;
};
