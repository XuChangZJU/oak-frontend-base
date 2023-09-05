import { Feature } from '../types/Feature';
export declare class EventBus extends Feature {
    private EventTable;
    sub(type: string, callback: Function): void;
    unsub(type: string, callback: Function): void;
    unsubAll(type: string): void;
    pub(type: string, options?: any): void;
}
