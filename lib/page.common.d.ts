/// <reference types="wechat-miniprogram" />
import { CommonAspectDict } from 'oak-common-aspect';
import { Aspect, Context, EntityDict } from 'oak-domain/lib/types';
import { BasicFeatures } from './features';
import { ExceptionHandler } from './types/ExceptionRoute';
import { Feature } from './types/Feature';
import { OakCommonComponentMethods, OakComponentData, OakComponentProperties, OakHiddenComponentMethods, OakListComponentMethods, OakPageMethods, OakPageOption } from './types/Page';
export declare type ComponentProps<TProperty extends WechatMiniprogram.Component.PropertyOption> = WechatMiniprogram.Component.PropertyOptionToData<OakComponentProperties & TProperty>;
export declare type ComponentData<ED extends EntityDict, T extends keyof ED, FormedData extends WechatMiniprogram.Component.DataOption, TData extends WechatMiniprogram.Component.DataOption> = TData & FormedData & OakComponentData<ED, T>;
export declare type ComponentThisType<ED extends EntityDict, T extends keyof ED, FormedData extends WechatMiniprogram.Component.DataOption, IsList extends boolean, TData extends WechatMiniprogram.Component.DataOption, TProperty extends WechatMiniprogram.Component.PropertyOption, TMethod extends WechatMiniprogram.Component.MethodOption> = ThisType<{
    state: ComponentData<ED, T, FormedData, TData>;
    props: ComponentProps<TProperty>;
    setState: (data: any, callback?: () => void) => Promise<void>;
    triggerEvent: <DetailType = any>(name: string, detail?: DetailType, options?: WechatMiniprogram.Component.TriggerEventOption) => void;
} & TMethod & OakCommonComponentMethods<ED, T> & OakHiddenComponentMethods & (IsList extends true ? OakListComponentMethods<ED, T> : {})>;
export declare function makeHiddenComponentMethods<ED extends EntityDict, T extends keyof ED, FormedData extends WechatMiniprogram.Component.DataOption, IsList extends boolean, TData extends WechatMiniprogram.Component.DataOption, TProperty extends WechatMiniprogram.Component.PropertyOption, TMethod extends WechatMiniprogram.Component.MethodOption>(): OakHiddenComponentMethods & ComponentThisType<ED, T, FormedData, IsList, TData, TProperty, TMethod>;
export declare function makeCommonComponentMethods<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>, FormedData extends WechatMiniprogram.Component.DataOption, Proj extends ED[T]['Selection']['data'], IsList extends boolean, TData extends WechatMiniprogram.Component.DataOption = {}, TProperty extends WechatMiniprogram.Component.PropertyOption = {}, TMethod extends WechatMiniprogram.Component.MethodOption = {}>(features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD, exceptionRouterDict: Record<string, ExceptionHandler>, formData: OakPageOption<ED, T, Cxt, AD, FD, Proj, FormedData, IsList, TData, TProperty, TMethod>['formData']): Omit<OakCommonComponentMethods<ED, T>, 'navigateTo' | 'navigateBack' | 'resolveInput' | 'redirectTo'> & ComponentThisType<ED, T, FormedData, IsList, TData, TProperty, TMethod>;
export declare function makeListComponentMethods<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>, FormedData extends WechatMiniprogram.Component.DataOption, IsList extends boolean, TData extends WechatMiniprogram.Component.DataOption = {}, TProperty extends WechatMiniprogram.Component.PropertyOption = {}, TMethod extends WechatMiniprogram.Component.MethodOption = {}>(features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD): OakListComponentMethods<ED, T> & ComponentThisType<ED, T, FormedData, IsList, TData, TProperty, TMethod>;
export declare function makePageMethods<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>, FormedData extends WechatMiniprogram.Component.DataOption, Proj extends ED[T]['Selection']['data'], IsList extends boolean, TData extends WechatMiniprogram.Component.DataOption = {}, TProperty extends WechatMiniprogram.Component.PropertyOption = {}, TMethod extends WechatMiniprogram.Component.MethodOption = {}>(features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD, options: OakPageOption<ED, T, Cxt, AD, FD, Proj, FormedData, IsList, TData, TProperty, TMethod>): OakPageMethods & ComponentThisType<ED, T, FormedData, IsList, TData, TProperty, TMethod>;