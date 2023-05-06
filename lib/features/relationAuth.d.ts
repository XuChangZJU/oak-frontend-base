import { EntityDict, AspectWrapper, Aspect, AuthCascadePath } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { CommonAspectDict } from 'oak-common-aspect';
import { Feature } from '../types/Feature';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import { Cache } from './cache';
export declare class RelationAuth<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends CommonAspectDict<ED, Cxt> & Record<string, Aspect<ED, Cxt>>> extends Feature {
    private cache;
    private aspectWrapper;
    private actionCascadePathGraph;
    private actionCascadePathMap;
    private relationCascadePathGraph;
    private baseRelationAuth;
    static IgnoredActions: string[];
    constructor(aspectWrapper: AspectWrapper<ED, Cxt, AD>, cache: Cache<ED, Cxt, FrontCxt, AD>, actionCascadePathGraph: AuthCascadePath<ED>[], relationCascadePathGraph: AuthCascadePath<ED>[]);
    private judgeRelation;
    getHasRelationEntities(): string[];
    getAllEntities(): string[];
    getActions(entity: keyof ED): string[];
    getCascadeActionEntitiesBySource(entity: keyof ED): {
        path: AuthCascadePath<ED>;
        actions: string[];
    }[];
    getCascadeActionAuths(entity: keyof ED, ir: boolean): AuthCascadePath<ED>[];
    getCascadeRelationAuthsBySource(entity: keyof ED): AuthCascadePath<ED>[];
    getCascadeRelationAuths(entity: keyof ED, ir: boolean): AuthCascadePath<ED>[];
    checkRelation<T extends keyof ED>(entity: T, operation: ED[T]['Operation'] | ED[T]['Selection'], context: FrontCxt): void;
    /**
     * 对目标对象的free和direct访问权限，每次需要的时候去后台取到缓存中
     * @param entity
     */
    private tryGetFreeAndDirectActionAuthInfo;
    /**
     * 根据对目标对象可能的action，去获取相关可能的relation结构的数据
     * @param entity
     * @param userId
     * @param actions
     */
    getRelationalProjection<T extends keyof ED>(entity: T, userId: string, actions: ED[T]['Action'][]): ED[T]["Selection"]["data"] | undefined;
}
