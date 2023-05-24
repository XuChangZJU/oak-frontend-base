import { EntityDict, OperateOption, SelectOption, OpRecord, AspectWrapper, CheckerType, Aspect, SelectOpResult, AuthCascadePath, AuthDeduceRelationMap } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { CommonAspectDict } from 'oak-common-aspect';
import { Feature } from '../types/Feature';
import { set } from 'oak-domain/lib/utils/lodash';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import { RelationAuth as BaseRelationAuth } from 'oak-domain/lib/store/RelationAuth';
import assert from 'assert';
import { Cache } from './cache';
import { judgeRelation } from 'oak-domain/lib/store/relation';

export class RelationAuth<
    ED extends EntityDict & BaseEntityDict,
    Cxt extends AsyncContext<ED>,
    FrontCxt extends SyncContext<ED>,
    AD extends CommonAspectDict<ED, Cxt> & Record<string, Aspect<ED, Cxt>>
    > extends Feature {
    private cache: Cache<ED, Cxt, FrontCxt, AD>;
    private aspectWrapper: AspectWrapper<ED, Cxt, AD>;
    private actionCascadePathGraph: AuthCascadePath<ED>[];
    private actionCascadePathMap: Record<string, AuthCascadePath<ED>[]>;
    private relationCascadePathGraph: AuthCascadePath<ED>[];
    private baseRelationAuth: BaseRelationAuth<ED>;
    private authDeduceRelationMap: AuthDeduceRelationMap<ED>;
    static IgnoredActions = ['download', 'aggregate', 'count', 'stat'];

    constructor(
        aspectWrapper: AspectWrapper<ED, Cxt, AD>,
        cache: Cache<ED, Cxt, FrontCxt, AD>,
        actionCascadePathGraph: AuthCascadePath<ED>[],
        relationCascadePathGraph: AuthCascadePath<ED>[],
        authDeduceRelationMap: AuthDeduceRelationMap<ED>,
        selectFreeEntities: (keyof ED)[],
    ) {
        super();
        this.aspectWrapper = aspectWrapper,
            this.cache = cache;
        this.actionCascadePathGraph = actionCascadePathGraph;
        this.relationCascadePathGraph = relationCascadePathGraph;
        this.actionCascadePathMap = {};
        actionCascadePathGraph.forEach(
            (ele) => {
                const [entity] = ele;
                if (this.actionCascadePathMap[entity as string]) {
                    this.actionCascadePathMap[entity as string].push(ele);
                }
                else {
                    this.actionCascadePathMap[entity as string] = [ele];
                }
            }
        );
        this.authDeduceRelationMap = authDeduceRelationMap;
        this.baseRelationAuth = new BaseRelationAuth(cache.getSchema(), actionCascadePathGraph, relationCascadePathGraph, authDeduceRelationMap, selectFreeEntities);
    }

    private judgeRelation(entity: keyof ED, attr: string) {
        return judgeRelation(this.cache.getSchema(), entity, attr);
    }

    getHasRelationEntities() {
        const schema = this.cache.getSchema();
        const entities = Object.keys(schema).filter(
            (ele) => !!schema[ele].relation
        );
        return entities;
    }

    getDeduceRelationAttribute(entity: keyof ED) {
        return this.authDeduceRelationMap[entity] as string | undefined;
    }

    getAllEntities() {
        return Object.keys(this.cache.getSchema());
    }

    getActions(entity: keyof ED) {
        return this.cache.getSchema()[entity].actions.filter(
            ele => !RelationAuth.IgnoredActions.includes(ele)
        );
    }

    hasRelation(entity: keyof ED) {
        const schema = this.cache.getSchema();
        return !!schema[entity].relation;
    }

    getCascadeActionEntitiesBySource(entity: keyof ED) {
        const paths = this.actionCascadePathGraph.filter(
            ele => ele[2] === entity && ele[3]
        );

        return paths.map(
            (ele) => ({
                path: ele,
                actions: this.cache.getSchema()[ele[0]].actions.filter(
                    ele => !RelationAuth.IgnoredActions.includes(ele)
                ),
            })
        );
    }

    getCascadeActionAuths(entity: keyof ED, ir: boolean) {
        const paths = this.actionCascadePathGraph.filter(
            ele => ele[0] === entity && ir === ele[3]
        );

        return paths;
    }

    getCascadeRelationAuthsBySource(entity: keyof ED) {
        const relationAuths = this.relationCascadePathGraph.filter(
            ele => ele[2] === entity && ele[3]
        );
        return relationAuths;
    }

    getCascadeRelationAuths(entity: keyof ED, ir: boolean) {
        const relationAuths = this.relationCascadePathGraph.filter(
            ele => ele[0] === entity && ir === ele[3]
        );
        return relationAuths;
    }

    checkRelation<T extends keyof ED>(entity: T, operation: ED[T]['Operation'] | ED[T]['Selection'], context: FrontCxt) {
        this.baseRelationAuth.checkRelationSync(entity, operation, context);
    }
}