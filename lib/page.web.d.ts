/// <reference types="wechat-miniprogram" />
/// <reference types="wechat-miniprogram" />
import React from 'react';
import { CommonAspectDict } from 'oak-common-aspect';
import { Aspect, EntityDict } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { BasicFeatures } from './features';
import { Feature } from './types/Feature';
import { OakComponentOption } from './types/Page';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
export declare function createComponent<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature>, FormedData extends Record<string, any>, IsList extends boolean, TData extends Record<string, any> = {}, TProperty extends WechatMiniprogram.Component.PropertyOption = {}, TMethod extends Record<string, Function> = {}>(option: OakComponentOption<ED, T, Cxt, FrontCxt, AD, FD, FormedData, IsList, TData, TProperty, TMethod>, features: BasicFeatures<ED, Cxt, FrontCxt, AD & CommonAspectDict<ED, Cxt>> & FD): React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
