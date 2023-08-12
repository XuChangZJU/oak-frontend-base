import { EntityDict, Aspect, Context, AspectWrapper } from 'oak-domain/lib/types';
import { Feature } from '../types/Feature';
import { CommonAspectDict } from 'oak-common-aspect';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { Cache } from './cache';
import { LocalStorage } from './localStorage';
import { Environment } from './environment';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import assert from 'assert';

const LS_LNG_KEY = 'ofb-feature-locale-lng';

export class Locales<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Feature {
    private cache: Cache<ED, Cxt, FrontCxt, AD>;
    private localStorage: LocalStorage;
    private makeBridgeUrlFn?: (url: string, headers?: Record<string, string>) => string
    private lng: string;

    constructor(
        cache: Cache<ED, Cxt, FrontCxt, AD>,
        localStorage: LocalStorage,
        environment: Environment,
        makeBridgeUrlFn?: (url: string, headers?: Record<string, string>) => string
    ) {
        super();
        this.cache = cache;
        this.localStorage = localStorage;
        const savedLng = localStorage.load(LS_LNG_KEY);
        if (savedLng) {
            this.lng = savedLng;
        }
        else {
            this.lng = 'zh_CN';
            this.detectLanguange();
        }
        this.makeBridgeUrlFn = makeBridgeUrlFn;
    }

    private detectLanguange() {
    }

    async get(namespace: string | string[], locale: string, scene: string) {
        const { result } = await this.cache.exec('getTranslations',
            { namespace, locale },
        );

        return {
            translations: result,
        };
    }

    // 这个是临时的代码，等和auth线合并了再移到合适的feature里去
    makeBridgeUrl(url: string, headers?: Record<string, string>) {
        if (this.makeBridgeUrlFn) {
            return this.makeBridgeUrlFn(url, headers);
        }

        console.warn('development模式下无法使用bridge，直接使用原始url', url);
        return url;
    }
}
