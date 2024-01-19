import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict, Aspect } from 'oak-domain/lib/types';
import { CommonAspectDict } from 'oak-common-aspect';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import { Cache } from './cache';
import { Feature } from '../types/Feature';
import { RelationAuth } from './relationAuth';
interface IMenu<ED extends EntityDict & BaseEntityDict, T extends keyof ED> {
    name: string;
    entity: T;
    action: ED[T]['Action'] | ED[T]['Action'][];
    paths: string[];
}
export declare class ContextMenuFactory<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends CommonAspectDict<ED, Cxt> & Record<string, Aspect<ED, Cxt>>> extends Feature {
    cache: Cache<ED, Cxt, FrontCxt, AD>;
    menus?: IMenu<ED, keyof ED>[];
    relationAuth: RelationAuth<ED, Cxt, FrontCxt, AD>;
    constructor(cache: Cache<ED, Cxt, FrontCxt, AD>, relationAuth: RelationAuth<ED, Cxt, FrontCxt, AD>);
    setMenus(menus: IMenu<ED, keyof ED>[]): void;
    makeMenuFilters(destEntity: keyof ED, paths: string[], entity: keyof ED, entityId: string): (true | ED[keyof ED]["Selection"]["filter"])[];
    getMenusByContext<OMenu extends IMenu<ED, keyof ED>>(entity: keyof ED, entityId: string): OMenu[];
}
export {};
