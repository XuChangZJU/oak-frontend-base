/// <reference types="wechat-miniprogram" />
import './polyfill';
import { Aspect, Checker, Context, DeduceFilter, EntityDict, RowStore, StorageSchema, Trigger } from "oak-domain/lib/types";
import { Feature } from '../../types/Feature';
import { Pagination } from "../../types/Pagination";
import { BasicFeatures } from "../../features";
declare type OakComponentOption<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD>>> = {
    entity: T;
    formData: ($rows: Partial<ED[T]['Schema']>[], features: BasicFeatures<ED, Cxt, AD> & FD) => WechatMiniprogram.Component.DataOption;
};
interface OakPageOption<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD>>> {
    entity: T;
    path: string;
    isList: boolean;
    projection: ED[T]['Selection']['data'];
    parent?: string;
    append?: boolean;
    pagination?: Pagination;
    filters?: Array<DeduceFilter<ED[T]['Schema']>>;
    sorter?: ED[T]['Selection']['sorter'];
    formData: ($rows: Partial<ED[T]['Schema']>[], features: BasicFeatures<ED, Cxt, AD> & FD) => WechatMiniprogram.Component.DataOption;
}
declare type OakComponentMethods<ED extends EntityDict, T extends keyof ED> = {
    setUpdateData: (input: WechatMiniprogram.Input) => void;
    callPicker: (touch: WechatMiniprogram.Touch) => void;
    setFilters: (filters: DeduceFilter<ED[T]['Schema']>[]) => void;
    execute: (touch: WechatMiniprogram.Touch) => void;
    navigateTo: (...options: Parameters<typeof wx.navigateTo>) => ReturnType<typeof wx.navigateTo>;
};
declare type OakPageMethods<ED extends EntityDict, T extends keyof ED> = OakComponentMethods<ED, T> & {
    reRender: (extra?: any) => Promise<void>;
    refresh: (extra?: any) => Promise<void>;
    onPullDownRefresh: () => Promise<void>;
    subscribed?: () => void;
    subscribe: () => void;
    unsubscribe: () => void;
    setForeignKey: (id: string, goBackDelta?: number) => Promise<void>;
    onForeignKeyPicked: (touch: WechatMiniprogram.Touch) => void;
};
declare type OakComponentInstanceInnerProperties<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD>>> = {
    features: BasicFeatures<ED, Cxt, AD> & FD;
};
declare type OakPageInstanceProperties<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD>>> = OakPageMethods<ED, T> & OakComponentInstanceInnerProperties<ED, Cxt, AD, FD>;
export declare function initialize<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD>>>(storageSchema: StorageSchema<ED>, createFeatures: (basicFeatures: BasicFeatures<ED, Cxt, AD>) => FD, createContext: (store: RowStore<ED>) => Cxt, triggers?: Array<Trigger<ED, keyof ED>>, checkers?: Array<Checker<ED, keyof ED>>, aspectDict?: AD, initialData?: {
    [T in keyof ED]?: Array<ED[T]['OpSchema']>;
}): {
    OakPage: <T extends keyof ED, D extends WechatMiniprogram.Component.DataOption, P extends WechatMiniprogram.Component.PropertyOption, M extends WechatMiniprogram.Component.MethodOption, IS extends WechatMiniprogram.IAnyObject = {}>(options: OakPageOption<ED, T, Cxt, AD, FD>, componentOptions?: WechatMiniprogram.Component.Options<D, P, M, IS & OakComponentMethods<ED, T> & {
        reRender: (extra?: any) => Promise<void>;
        refresh: (extra?: any) => Promise<void>;
        onPullDownRefresh: () => Promise<void>;
        subscribed?: (() => void) | undefined;
        subscribe: () => void;
        unsubscribe: () => void;
        setForeignKey: (id: string, goBackDelta?: number | undefined) => Promise<void>;
        onForeignKeyPicked: (touch: WechatMiniprogram.Touch<WechatMiniprogram.IAnyObject, WechatMiniprogram.TouchDetail, WechatMiniprogram.IAnyObject, WechatMiniprogram.IAnyObject, WechatMiniprogram.IAnyObject>) => void;
    } & OakComponentInstanceInnerProperties<ED, Cxt, AD, FD>, true>) => string;
    OakComponent: <T_1 extends string | number, D_1 extends WechatMiniprogram.Component.DataOption, P_1 extends WechatMiniprogram.Component.PropertyOption, M_1 extends WechatMiniprogram.Component.MethodOption, IS_1 extends WechatMiniprogram.IAnyObject = {}>(options: OakComponentOption<ED, T_1, Cxt, AD, FD>, componentOptions?: WechatMiniprogram.Component.Options<D_1, P_1, M_1, IS_1, false>) => string;
};
export declare type MakeOakPage<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD>>> = <T extends keyof ED, D extends WechatMiniprogram.Component.DataOption, P extends WechatMiniprogram.Component.PropertyOption, M extends WechatMiniprogram.Component.MethodOption, IS extends WechatMiniprogram.IAnyObject = {}>(options: OakPageOption<ED, T, Cxt, AD, FD>, componentOptions: WechatMiniprogram.Component.Options<D, P, M, IS & OakPageInstanceProperties<ED, T, Cxt, AD, FD>, true>) => string;
export declare type MakeOakComponent<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD>>> = <T extends keyof ED, D extends WechatMiniprogram.Component.DataOption, P extends WechatMiniprogram.Component.PropertyOption, M extends WechatMiniprogram.Component.MethodOption, IS extends WechatMiniprogram.IAnyObject = {}>(options: OakComponentOption<ED, T, Cxt, AD, FD>, componentOptions: WechatMiniprogram.Component.Options<D, P, M, IS>) => string;
export {};
