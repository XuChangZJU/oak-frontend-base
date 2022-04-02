import { EntityDict, OpRecord } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-domain/EntityDict';
import { Aspect } from 'oak-domain/lib/types/Aspect';
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
