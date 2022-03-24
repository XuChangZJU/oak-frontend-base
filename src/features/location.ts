import { EntityDict, OpRecord } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-domain/EntityDict';
import { Aspect } from 'oak-domain/lib/types/Aspect';
import { Feature } from '../types/Feature';

export class Location {
    get(params?: any): Promise<any> {
        throw new Error('Method not implemented.');
    }
    
    refresh() {

    }
}

export type Action = {
    refresh: Location['refresh'];
};
