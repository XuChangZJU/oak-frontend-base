import { Feature } from '../types/Feature';
export declare class LocalStorage extends Feature {
    keys: Record<string, boolean>;
    constructor();
    setKey(key: string): void;
    unsetKey(key: string): void;
    save(key: string, item: any): void;
    load(key: string): any;
    clear(): void;
    remove(key: string): void;
    loadAll(): Record<string, any>;
    resetAll(data: Record<string, any>): void;
}
