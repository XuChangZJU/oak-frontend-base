import { EntityDict, Aspect, Context, AspectWrapper } from 'oak-domain/lib/types';
import { Feature } from '../types/Feature';
import { CommonAspectDict } from 'oak-common-aspect';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';


export class Locales<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Feature {
    private aspectWrapper: AspectWrapper<ED, Cxt, AD>;
    private makeBridgeUrlFn?: (url: string, headers?: Record<string, string>) => string

    constructor(aspectWrapper: AspectWrapper<ED, Cxt, AD>, makeBridgeUrlFn?: (url: string, headers?: Record<string, string>) => string) {
        super();
        this.aspectWrapper = aspectWrapper;
        this.makeBridgeUrlFn = makeBridgeUrlFn;
    }
    async get(namespace: string | string[], locale: string, scene: string) {
        const { result } = await this.aspectWrapper.exec('getTranslations',
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
