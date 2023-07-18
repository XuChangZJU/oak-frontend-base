import { EntityDict, AspectWrapper, Aspect, AuthCascadePath, AuthDeduceRelationMap } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { CommonAspectDict } from 'oak-common-aspect';
import { Feature } from '../types/Feature';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import { Cache } from './cache';
export declare class RelationAuth<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends CommonAspectDict<ED, Cxt> & Record<string, Aspect<ED, Cxt>>> extends Feature {
    private cache;
    private contextBuilder;
    private aspectWrapper;
    private actionCascadePathGraph;
    private actionCascadePathMap;
    private relationCascadePathGraph;
    private baseRelationAuth;
    private authDeduceRelationMap;
    static IgnoredActions: string[];
    private entityGraph?;
    constructor(aspectWrapper: AspectWrapper<ED, Cxt, AD>, contextBuilder: () => FrontCxt, cache: Cache<ED, Cxt, FrontCxt, AD>, actionCascadePathGraph: AuthCascadePath<ED>[], relationCascadePathGraph: AuthCascadePath<ED>[], authDeduceRelationMap: AuthDeduceRelationMap<ED>, selectFreeEntities: (keyof ED)[]);
    private judgeRelation;
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
    getCascadeActionEntitiesBySource(entity: keyof ED): {
        path: AuthCascadePath<ED>;
        actions: string[];
    }[];
    getCascadeActionAuths(entity: keyof ED, ir: boolean): AuthCascadePath<ED>[];
    getCascadeRelationAuthsBySource(entity: keyof ED): AuthCascadePath<ED>[];
    getCascadeRelationAuths(entity: keyof ED, ir: boolean): AuthCascadePath<ED>[];
    checkRelation<T extends keyof ED>(entity: T, operation: Omit<ED[T]['Operation'] | ED[T]['Selection'], 'id'>): boolean;
    getRelationIdByName(entity: keyof ED, name: string, entityId?: string): Promise<ED["relation"]["Schema"]["id"] | undefined>;
}
