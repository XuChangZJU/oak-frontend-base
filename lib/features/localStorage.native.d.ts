import { Feature } from '../types/Feature';
export declare class LocalStorage extends Feature {
    keys: Record<string, boolean>;
    constructor();
    setKey(key: string): void;
    unsetKey(key: string): void;
    save(key: string, item: any): Promise<void>;
    load(key: string): Promise<any>;
    clear(): Promise<void>;
    remove(key: string): Promise<void>;
    loadAll(): Promise<Record<string, any>>;
    resetAll(data: Record<string, any>): Promise<void>;
}