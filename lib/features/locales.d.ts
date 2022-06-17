import { EntityDict, Aspect, Context } from 'oak-domain/lib/types';
import { Feature } from '../types/Feature';
export declare class Locales extends Feature<EntityDict, Context<EntityDict>, Record<string, Aspect<EntityDict, Context<EntityDict>>>> {
    get(namespace: string | string[], locale: string, scene: string): Promise<{
        translations: {
            common: {
                action: {
                    confirm: string;
                };
            };
        };
    }>;
}
