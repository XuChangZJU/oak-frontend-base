import { EntityDict, AspectWrapper } from 'oak-domain/lib/types';
import { Feature } from '../types/Feature';
import { CommonAspectDict } from 'oak-common-aspect';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
export declare class Locales<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Feature {
    private aspectWrapper;
    private makeBridgeUrlFn?;
    constructor(aspectWrapper: AspectWrapper<ED, Cxt, AD>, makeBridgeUrlFn?: (url: string, headers?: Record<string, string>) => string);
    get(namespace: string | string[], locale: string, scene: string): Promise<{
        translations: Awaited<ReturnType<AD["getTranslations"]>>;
    }>;
    makeBridgeUrl(url: string, headers?: Record<string, string>): string;
}
