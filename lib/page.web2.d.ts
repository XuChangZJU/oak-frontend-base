/// <reference types="wechat-miniprogram" />
/// <reference types="wechat-miniprogram" />
import React from 'react';
import { CommonAspectDict } from 'oak-common-aspect';
import { Aspect, Context, EntityDict } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { BasicFeatures } from './features';
import { ExceptionHandler } from './types/ExceptionRoute';
import { Feature } from './types/Feature';
import { OakComponentOption } from './types/Page2';
export declare function createComponent<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>, Proj extends ED[T]['Selection']['data'], FormedData extends Record<string, any>, IsList extends boolean, TData extends Record<string, any> = {}, TProperty extends WechatMiniprogram.Component.PropertyOption = {}, TMethod extends Record<string, Function> = {}>(option: OakComponentOption<ED, T, Cxt, AD, FD, Proj, FormedData, IsList, TData, TProperty, TMethod>, features: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> & FD, exceptionRouterDict: Record<string, ExceptionHandler>): React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
