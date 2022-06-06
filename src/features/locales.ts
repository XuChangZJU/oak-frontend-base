import { EntityDict, Aspect, Context } from 'oak-domain/lib/types';
import { Action, Feature } from '../types/Feature';

export class Locales extends Feature<
    EntityDict,
    Context<EntityDict>,
    Record<string, Aspect<EntityDict, Context<EntityDict>>>
> {
    async get(namespace: string | string[], locale: string, scene: string) {
        const translations = await this.getAspectProxy().getTranslations(
            { namespace, locale },
            scene
        );

        return {
            translations,
        };
    }
}
