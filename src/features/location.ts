import { EntityDict, Aspect, Context } from 'oak-domain/lib/types';
import { Action, Feature } from '../types/Feature';

export class Location extends Feature<EntityDict, Context<EntityDict>, Record<string, Aspect<EntityDict, Context<EntityDict>>>> {
    get() {
        throw new Error('Method not implemented.');
    }

    @Action
    refresh() {
        throw new Error('Method not implemented.');
    }   
}
