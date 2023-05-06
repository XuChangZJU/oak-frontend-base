import { EntityDict, OperateOption, SelectOption, OpRecord, AspectWrapper, CheckerType, Aspect, SelectOpResult, AuthCascadePath } from 'oak-domain/lib/types';
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
    static IgnoredActions = ['download', 'aggregate', 'count', 'stat'];

    constructor(
        aspectWrapper: AspectWrapper<ED, Cxt, AD>,
        cache: Cache<ED, Cxt, FrontCxt, AD>,
        actionCascadePathGraph: AuthCascadePath<ED>[],
        relationCascadePathGraph: AuthCascadePath<ED>[]
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
        this.baseRelationAuth = new BaseRelationAuth(actionCascadePathGraph, relationCascadePathGraph, cache.getSchema());
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

    getAllEntities() {
        return Object.keys(this.cache.getSchema());
    }

    getActions(entity: keyof ED) {
        return this.cache.getSchema()[entity].actions.filter(
            ele => !RelationAuth.IgnoredActions.includes(ele)
        );
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

    /**
     * 对目标对象的free和direct访问权限，每次需要的时候去后台取到缓存中
     * @param entity 
     */
    private tryGetFreeAndDirectActionAuthInfo<T extends keyof ED>(entity: T) {
        const freeActionAuths = this.cache.get('freeActionAuth', {
            data: {
                id: 1,
            },
            filter: {
                destEntity: entity as string,
            },
        });
        if (freeActionAuths.length === 0) {
            this.cache.refresh('freeActionAuth', {
                data: {
                    id: 1,
                    deActions: 1,
                    destEntity: 1,
                },
                filter: {
                    destEntity: entity as string,
                },
            });
        }

        const directActionAuths = this.cache.get('directActionAuth', {
            data: {
                id: 1,
            },
            filter: {
                destEntity: entity as string,
            },
        });
        if (directActionAuths.length === 0) {
            this.cache.refresh('directActionAuth', {
                data: {
                    id: 1,
                    path: 1,
                    deActions: 1,
                    destEntity: 1,
                },
                filter: {
                    destEntity: entity as string,
                },
            })
        }
    }

    /**
     * 根据对目标对象可能的action，去获取相关可能的relation结构的数据
     * @param entity 
     * @param userId 
     * @param actions 
     */
    getRelationalProjection<T extends keyof ED>(entity: T, userId: string, actions: ED[T]['Action'][]) {
        const paths = this.actionCascadePathMap[entity as string];
        const irurProjection = {
            $entity: 'userRelation',
            data: {
                id: 1,
                relationId: 1,
                relation: {
                    id: 1,
                    name: 1,
                    display: 1,
                    actionAuth$relation: {
                        $entity: 'actionAuth',
                        data: {
                            id: 1,
                            path: 1,
                            destEntity: 1,
                            deActions: 1,
                            relationId: 1,
                        },
                        filter: {
                            path: '',
                            destEntity: entity,
                            deActions: {
                                $overlaps: actions,
                            }
                        }
                    }
                }
            },
            filter: {
                userId,
            },
        };
        
        this.tryGetFreeAndDirectActionAuthInfo(entity);

        if (paths) {
            const projection: ED[T]['Selection']['data'] = {};
            paths.forEach(
                ([e, p, r, ir]) => {
                    const ps = p.split('.');
                    if (ps.length === 0) {
                        assert(ir);
                        Object.assign(projection, {
                            userRelation$entity: irurProjection
                        });
                    }
                    else if (ir){
                        set(projection, `p.userRelation$entity`, irurProjection);
                    }
                    else {
                        // 这里最好不要产生user: { id: 1 }的格式，在倒数第二层进行处理
                        const entity = r;
                        const attr = ps.pop();
                        const rel = this.judgeRelation(entity, attr!);
                        if (rel === 2) {
                            set(projection, `${ps.join('.')}.entity`, 1);
                            set(projection, `${ps.join('.')}.entityId`, 1);
                        }
                        else {
                            set(projection, `${ps.join('.')}.${attr}Id`, 1);
                        }
                    }
                }
            );
            return projection;
        }
    }
}