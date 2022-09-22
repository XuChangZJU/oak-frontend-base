import { EntityDict, Context } from 'oak-domain/lib/types';
import { Feature } from '../types/Feature';
import { CommonAspectDict } from 'oak-common-aspect';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
export declare class Locales<ED extends EntityDict & BaseEntityDict, Cxt extends Context<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Feature<ED, Cxt, AD> {
    get(namespace: string | string[], locale: string, scene: string): Promise<{
        translations: Awaited<ReturnType<AD["getTranslations"]>>;
    }>;
}
