import { EntityDict, OpRecord } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-domain/EntityDict';
import { Aspect } from 'oak-domain/lib/types/Aspect';
import { Feature } from '../types/Feature';
import { FrontContext } from '../FrontContext';

export class Location extends Feature<EntityDict, Record<string, Aspect<EntityDict>>> {
    get(context: FrontContext<EntityDict>, params: any) {
        throw new Error('Method not implemented.');
    }
    action(context: FrontContext<EntityDict>, action: { type: string; payload?: object | undefined; }) {
        throw new Error('Method not implemented.');
    }
   
}
