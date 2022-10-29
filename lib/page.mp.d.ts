/// <reference types="wechat-miniprogram" />
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { CommonAspectDict } from 'oak-common-aspect';
import { Aspect, Context, EntityDict } from 'oak-domain/lib/types';
import { BasicFeatures } from './features';
import { Feature } from './types/Feature';
import { OakComponentOption, OakPageOption } from './types/Page';
export declare function createPage<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature>, Proj extends ED[T]['Selection']['data'], FormedData extends WechatMiniprogram.Component.DataOption, IsList extends boolean, TData extends WechatMiniprogram.Component.DataOption = {}, TProperty extends WechatMiniprogram.Component.PropertyOption = {}, TMethod extends WechatMiniprogram.Component.MethodOption = {}>(options: OakPageOption<ED, T, Cxt, AD, FD, Proj, FormedData, IsList, TData, TProperty, TMethod>, features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD): string;
export declare function createComponent<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature>, FormedData extends WechatMiniprogram.Component.DataOption, IsList extends boolean, TData extends WechatMiniprogram.Component.DataOption = {}, TProperty extends WechatMiniprogram.Component.PropertyOption = {}, TMethod extends WechatMiniprogram.Component.MethodOption = {}>(options: OakComponentOption<ED, T, Cxt, AD, FD, FormedData, IsList, TData, TProperty, TMethod>, features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD): string;
