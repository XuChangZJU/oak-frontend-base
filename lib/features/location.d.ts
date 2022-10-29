import { Feature } from '../types/Feature';
export declare class Location extends Feature {
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
