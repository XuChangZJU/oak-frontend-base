import { EntityDict, OpRecord } from 'oak-domain/lib/types/Entity';
import { Aspect } from 'oak-general-business/lib/types/Aspect';
import { Action, Feature } from '../types/Feature';

export class Location extends Feature<EntityDict, Record<string, Aspect<EntityDict>>> {
    get() {
        throw new Error('Method not implemented.');
    }

    @Action
    refresh() {
        throw new Error('Method not implemented.');
    }   
}
