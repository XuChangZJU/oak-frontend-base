import { EntityDict, Context } from 'oak-domain/lib/types';
import { Feature } from '../types/Feature';
import { CommonAspectDict } from 'oak-common-aspect';
export declare class LocalStorage<ED extends EntityDict, Cxt extends Context<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Feature<ED, Cxt, AD> {
    save(key: string, item: any): void;
    load(key: string): any;
    clear(): void;
    remove(key: string): void;
}
