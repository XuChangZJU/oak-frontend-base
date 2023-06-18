import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict, AuthCascadePath, Aspect } from 'oak-domain/lib/types';
import { CommonAspectDict } from 'oak-common-aspect';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import { Cache } from './cache';
import { Feature } from '../types/Feature';
interface IMenu<ED extends EntityDict & BaseEntityDict, T extends keyof ED> {
    name: string;
    entity: T;
    action: ED[T]['Action'];
    data?: ED[T]['Update']['data'];
}
interface IMenuWrapper<ED extends EntityDict & BaseEntityDict, T extends keyof ED> extends IMenu<ED, T> {
    filtersMaker: (entity: keyof ED, entityId: string) => Array<ED[T]['Selection']['filter']>;
}
export declare class ContextMenuFactory<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends CommonAspectDict<ED, Cxt> & Record<string, Aspect<ED, Cxt>>> extends Feature {
    cache: Cache<ED, Cxt, FrontCxt, AD>;
    menuWrappers?: IMenuWrapper<ED, keyof ED>[];
    cascadePathGraph: AuthCascadePath<ED>[];
    private makeMenuWrappers;
    constructor(cache: Cache<ED, Cxt, FrontCxt, AD>, cascadePathGraph: AuthCascadePath<ED>[]);
    setMenus(menus: IMenu<ED, keyof ED>[]): void;
    getMenusByContext(entity: keyof ED, entityId: string): IMenu<ED, keyof ED>[];
}
export {};
