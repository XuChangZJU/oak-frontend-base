import { EntityDict } from 'oak-domain/lib/types';
import { Feature } from '../types/Feature';
import { CommonAspectDict } from 'oak-common-aspect';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { Cache } from './cache';
import { LocalStorage } from './localStorage';
import { Environment } from './environment';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import { Scope, TranslateOptions } from 'i18n-js';
export declare class Locales<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Feature {
    private cache;
    private localStorage;
    private environment;
    private makeBridgeUrlFn?;
    private language;
    private defaultLng;
    private i18n;
    constructor(cache: Cache<ED, Cxt, FrontCxt, AD>, localStorage: LocalStorage, environment: Environment, defaultLng: string, makeBridgeUrlFn?: (url: string, headers?: Record<string, string>) => string);
    private detectLanguange;
    private resetDataset;
    /**
     * 当发生key缺失时，向服务器请求最新的i18n数据，这里要注意要避免因服务器也缺失导致的无限请求
     * @param ns
     */
    private loadData;
    t(key: Scope, params?: TranslateOptions): string;
    getDataSet(): {
        lng: string;
        defaultLng: string;
        dataset: import("i18n-js").Dict;
    };
    hasKey(key: Scope, params?: TranslateOptions): string;
    makeBridgeUrl(url: string, headers?: Record<string, string>): string;
}
