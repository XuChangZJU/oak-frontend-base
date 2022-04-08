import { EntityDict } from 'oak-domain/lib/types/Entity';
import { Aspect } from 'oak-general-business/lib/types/Aspect';
import { Feature } from '../types/Feature';
export declare class Location extends Feature<EntityDict, Record<string, Aspect<EntityDict>>> {
    get(): void;
    refresh(): void;
}
