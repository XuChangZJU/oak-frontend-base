import { Feature } from '../types/Feature';
export declare class Location extends Feature {
    private latitude?;
    private longitude?;
    private lastTimestamp?;
    private acceptableLatency;
    constructor(acceptableLatency?: number);
    get(): {
        latitude: number;
        longitude: number;
        lastTimestamp: number;
    };
    refresh(): Promise<void>;
}
