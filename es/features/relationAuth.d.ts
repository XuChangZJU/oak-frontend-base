import { EntityDict, Aspect, AuthDeduceRelationMap } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { CommonAspectDict } from 'oak-common-aspect';
import { Feature } from '../types/Feature';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import { Cache } from './cache';
export declare class RelationAuth<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends CommonAspectDict<ED, Cxt> & Record<string, Aspect<ED, Cxt>>> extends Feature {
    private cache;
    private baseRelationAuth;
    private authDeduceRelationMap;
    static IgnoredActions: string[];
    private entityGraph?;
    constructor(cache: Cache<ED, Cxt, FrontCxt, AD>, authDeduceRelationMap: AuthDeduceRelationMap<ED>, selectFreeEntities?: (keyof ED)[], updateFreeDict?: {
        [A in keyof ED]?: string[];
    });
    getHasRelationEntities(): string[];
    getDeduceRelationAttribute(entity: keyof ED): string | undefined;
    buildEntityGraph(): void;
    getEntityGraph(): {
        data: {
            name: string;
        }[];
        links: {
            source: string;
            target: string;
            value: number;
        }[];
    };
    getAllEntities(): string[];
    getActions(entity: keyof ED): string[];
    hasRelation(entity: keyof ED): boolean;
    getRelations(entity: keyof ED): string[] | undefined;
    getCascadeActionEntitiesBySource(entity: keyof ED): {
        path: string;
        actions: string[];
    }[];
    getCascadeActionAuths(entity: keyof ED, ir: boolean): [string, string, string, boolean][];
    getCascadeRelationAuthsBySource(entity: keyof ED): [string, string, string, boolean][];
    getCascadeRelationAuths(entity: keyof ED, ir: boolean): [string, string, string, boolean][];
    checkRelation<T extends keyof ED>(entity: T, operation: Omit<ED[T]['Operation'] | ED[T]['Selection'], 'id'>): boolean;
    getRelationIdByName(entity: keyof ED, name: string, entityId?: string): Promise<ED["relation"]["Schema"]["id"] | undefined>;
}
