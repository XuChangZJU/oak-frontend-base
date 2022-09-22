import { EntityDict, Aspect, Context } from 'oak-domain/lib/types';
import { Action, Feature } from '../types/Feature';
import { CommonAspectDict } from 'oak-common-aspect';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';


export class Locales<ED extends EntityDict & BaseEntityDict, Cxt extends Context<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Feature<ED, Cxt, AD> {
    async get(namespace: string | string[], locale: string, scene: string) {
        const { result } = await this.getAspectWrapper().exec('getTranslations',
            { namespace, locale },
        );

        return {
            translations: result,
        };
    }
}
