import { EntityDict, Aspect, Context } from 'oak-domain/lib/types';
import { Feature } from '../types/Feature';
export declare class Location extends Feature<EntityDict, Context<EntityDict>, Record<string, Aspect<EntityDict, Context<EntityDict>>>> {
    private latitude?;
    private longitude?;
    private lastTimestamp?;
    get(acceptableLatency?: number): Promise<{
        latitude: number;
        longitude: number;
    }>;
    refresh(): void;
}
