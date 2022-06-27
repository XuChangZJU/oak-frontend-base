import { EntityDict, Context } from 'oak-domain/lib/types';
import { Feature } from '../types/Feature';
import { CommonAspectDict } from 'oak-common-aspect';
export declare class Locales<ED extends EntityDict, Cxt extends Context<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Feature<ED, Cxt, AD> {
    get(namespace: string | string[], locale: string, scene: string): Promise<{
        translations: Awaited<ReturnType<AD["getTranslations"]>>;
    }>;
}
