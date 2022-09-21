import { EntityDict, Context, AspectWrapper } from 'oak-domain/lib/types';
import { Feature } from '../types/Feature';
import { CommonAspectDict } from 'oak-common-aspect';
export declare class LocalStorage<ED extends EntityDict, Cxt extends Context<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Feature<ED, Cxt, AD> {
    keys: Record<string, boolean>;
    constructor(aspectWrapper: AspectWrapper<ED, Cxt, AD>);
    setKey(key: string): void;
    unsetKey(key: string): void;
    save(key: string, item: any): void;
    load(key: string): any;
    clear(): void;
    remove(key: string): void;
    loadAll(): Record<string, any>;
    resetAll(data: Record<string, any>): void;
}
