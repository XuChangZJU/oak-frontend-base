import { EntityDict } from 'oak-domain/lib/types';
import { Feature } from '../types/Feature';
import { CommonAspectDict } from 'oak-common-aspect';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { Cache } from './cache';
import { LocalStorage } from './localStorage';
import { Environment } from './environment';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
export declare class Locales<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Feature {
    private cache;
    private localStorage;
    private environment;
    private makeBridgeUrlFn?;
    private language;
    constructor(cache: Cache<ED, Cxt, FrontCxt, AD>, localStorage: LocalStorage, environment: Environment, makeBridgeUrlFn?: (url: string, headers?: Record<string, string>) => string);
    private detectLanguange;
    t(namespace: string | string[], key: string, params?: object): void;
    makeBridgeUrl(url: string, headers?: Record<string, string>): string;
}
