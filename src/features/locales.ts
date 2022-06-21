import { EntityDict, Aspect, Context } from 'oak-domain/lib/types';
import { Action, Feature } from '../types/Feature';
import { AspectDict } from 'oak-common-aspect/src/aspectDict';

export class Locales<ED extends EntityDict, Cxt extends Context<ED>, AD extends AspectDict<ED, Cxt>> extends Feature<ED, Cxt, AD> {
    async get(namespace: string | string[], locale: string, scene: string) {
        const { result } = await this.getAspectWrapper().exec('getTranslations',
            { namespace, locale },
        );

        return {
            translations: result,
        };
    }
}
