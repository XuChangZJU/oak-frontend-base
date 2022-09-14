import { EntityDict, Context } from 'oak-domain/lib/types';
import { Feature } from '../types/Feature';
import { CommonAspectDict } from 'oak-common-aspect';
export declare class Location<ED extends EntityDict, Cxt extends Context<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Feature<ED, Cxt, AD> {
    private latitude?;
    private longitude?;
    private lastTimestamp?;
    get(acceptableLatency?: number): Promise<{
        latitude: number;
        longitude: number;
    }>;
    refresh(): Promise<{
        latitude: number;
        longitude: number;
    }>;
}
