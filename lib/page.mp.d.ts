/// <reference types="wechat-miniprogram" />
import { CommonAspectDict } from 'oak-common-aspect';
import { Aspect, EntityDict } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { BasicFeatures } from './features';
import { Feature } from './types/Feature';
import { DataOption, OakComponentOption } from './types/Page';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
export declare function createComponent<IsList extends boolean, ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature>, FormedData extends Record<string, any>, TData extends DataOption = {}, TProperty extends DataOption = {}, TMethod extends Record<string, Function> = {}>(option: OakComponentOption<IsList, ED, T, Cxt, FrontCxt, AD, FD, FormedData, TData, TProperty, TMethod>, features: BasicFeatures<ED, Cxt, FrontCxt, AD & CommonAspectDict<ED, Cxt>> & FD): string;
