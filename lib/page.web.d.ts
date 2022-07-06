/// <reference types="wechat-miniprogram" />
/// <reference types="react" />
import { CommonAspectDict } from 'oak-common-aspect';
import { Aspect, Context, EntityDict } from 'oak-domain/lib/types';
import { BasicFeatures } from './features';
import { ExceptionHandler } from './types/ExceptionRoute';
import { Feature } from './types/Feature';
import { OakComponentOption, OakPageOption } from './types/Page';
export declare function createPage<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>, Proj extends ED[T]['Selection']['data'], FormedData extends WechatMiniprogram.Component.DataOption, IsList extends boolean, TData extends WechatMiniprogram.Component.DataOption = {}, TProperty extends WechatMiniprogram.Component.PropertyOption = {}, TMethod extends WechatMiniprogram.Component.MethodOption = {}>(options: OakPageOption<ED, T, Cxt, AD, FD, Proj, FormedData, IsList, TData, TProperty, TMethod>, features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD, exceptionRouterDict: Record<string, ExceptionHandler>, context: Cxt): (props: any) => JSX.Element;
export declare function createComponent<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>, FormedData extends WechatMiniprogram.Component.DataOption, IsList extends boolean, TData extends WechatMiniprogram.Component.DataOption = {}, TProperty extends WechatMiniprogram.Component.PropertyOption = {}, TMethod extends WechatMiniprogram.Component.MethodOption = {}>(options: OakComponentOption<ED, T, Cxt, AD, FD, FormedData, IsList, TData, TProperty, TMethod>, features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD, exceptionRouterDict: Record<string, ExceptionHandler>, context: Cxt): (props: any) => JSX.Element;
export declare type MakeOakPage<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>> = <T extends keyof ED, Proj extends ED[T]['Selection']['data'], FormedData extends WechatMiniprogram.Component.DataOption, IsList extends boolean, TData extends WechatMiniprogram.Component.DataOption, TProperty extends WechatMiniprogram.Component.PropertyOption, TMethod extends WechatMiniprogram.Component.MethodOption>(options: OakPageOption<ED, T, Cxt, AD, FD, Proj, FormedData, IsList, TData, TProperty, TMethod>) => JSX.Element;
export declare type MakeOakComponent<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>> = <T extends keyof ED, FormedData extends WechatMiniprogram.Component.DataOption, IsList extends boolean, TData extends WechatMiniprogram.Component.DataOption, TProperty extends WechatMiniprogram.Component.PropertyOption, TMethod extends WechatMiniprogram.Component.MethodOption>(options: OakComponentOption<ED, T, Cxt, AD, FD, FormedData, IsList, TData, TProperty, TMethod>) => JSX.Element;