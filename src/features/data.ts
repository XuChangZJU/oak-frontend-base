import { EntityDict } from 'oak-domain/lib/types/Entity';
import { Aspect } from 'oak-domain/lib/types/Aspect';
import { Feature } from '../types/Feature';
import { FrontContext } from '../FrontContext';

export class Data<ED extends EntityDict, AD extends Record<string, Aspect<ED>>> extends Feature<ED, AD> {
    async get<T extends keyof ED>(context: FrontContext<ED, AD>, params: { entity: T, selection: ED[T]['Selection'] }) {
        const { result } = await context.rowStore.select(params.entity, params.selection, context);
        return result;
    }
    async action(context: FrontContext<ED, AD>, type: string, payload?: any) {
        throw new Error('Method not implemented.');
    }
}
