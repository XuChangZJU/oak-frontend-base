import { EntityDict } from 'oak-domain/lib/types/Entity';
import { Aspect } from 'oak-domain/lib/types/Aspect';
import { Feature } from '../types/Feature';
import { FrontContext } from '../FrontContext';
export declare class Location extends Feature<EntityDict, Record<string, Aspect<EntityDict>>> {
    get(context: FrontContext<EntityDict>, params: any): void;
    action(context: FrontContext<EntityDict>, action: {
        type: string;
        payload?: object | undefined;
    }): void;
}
