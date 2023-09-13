import { OakUserException, OakRowUnexistedException } from 'oak-domain/lib/types';
import { Feature } from '../types/Feature';
import { union } from 'oak-domain/lib/utils/lodash';
import { RelationAuth as BaseRelationAuth } from 'oak-domain/lib/store/RelationAuth';
import { judgeRelation } from 'oak-domain/lib/store/relation';
export class RelationAuth extends Feature {
    cache;
    actionCascadePathGraph;
    actionCascadePathMap;
    relationCascadePathGraph;
    baseRelationAuth;
    authDeduceRelationMap;
    static IgnoredActions = ['download', 'aggregate', 'count', 'stat'];
    entityGraph;
    constructor(cache, actionCascadePathGraph, relationCascadePathGraph, authDeduceRelationMap, selectFreeEntities, createFreeEntities, updateFreeEntities) {
        super();
        this.cache = cache;
        this.actionCascadePathGraph = actionCascadePathGraph;
        this.relationCascadePathGraph = relationCascadePathGraph;
        this.actionCascadePathMap = {};
        actionCascadePathGraph.forEach((ele) => {
            const [entity] = ele;
            if (this.actionCascadePathMap[entity]) {
                this.actionCascadePathMap[entity].push(ele);
            }
            else {
                this.actionCascadePathMap[entity] = [ele];
            }
        });
        this.authDeduceRelationMap = authDeduceRelationMap;
        this.baseRelationAuth = new BaseRelationAuth(cache.getSchema(), actionCascadePathGraph, relationCascadePathGraph, authDeduceRelationMap, selectFreeEntities, createFreeEntities, updateFreeEntities);
        this.buildEntityGraph();
    }
    judgeRelation(entity, attr) {
        return judgeRelation(this.cache.getSchema(), entity, attr);
    }
    getHasRelationEntities() {
        const schema = this.cache.getSchema();
        const entities = Object.keys(schema).filter((ele) => !!schema[ele].relation);
        return entities;
    }
    getDeduceRelationAttribute(entity) {
        return this.authDeduceRelationMap[entity];
    }
    buildEntityGraph() {
        const schema = this.cache.getSchema();
        // 构建出一张图来
        const data = [];
        const links = [];
        const nodeOutSet = {};
        const nodeInSet = {};
        const ExcludeEntities = ['modi', 'modiEntity', 'oper', 'operEntity', 'relation', 'relationAuth', 'actionAuth', 'userRelation'];
        for (const entity in schema) {
            if (ExcludeEntities.includes(entity)) {
                continue;
            }
            const { attributes } = schema[entity];
            for (const attr in attributes) {
                const { ref } = attributes[attr];
                if (ref instanceof Array) {
                    ref.forEach((reff) => {
                        if (reff === entity || ExcludeEntities.includes(reff) || nodeOutSet[entity]?.includes(reff)) {
                            return;
                        }
                        if (nodeInSet[reff]) {
                            nodeInSet[reff].push(entity);
                        }
                        else {
                            nodeInSet[reff] = [entity];
                        }
                        if (nodeOutSet[entity]) {
                            nodeOutSet[entity].push(reff);
                        }
                        else {
                            nodeOutSet[entity] = [reff];
                        }
                    });
                }
                else if (ref && ref !== entity && !ExcludeEntities.includes(ref) && !nodeOutSet[entity]?.includes(ref)) {
                    if (nodeInSet[ref]) {
                        nodeInSet[ref].push(entity);
                    }
                    else {
                        nodeInSet[ref] = [entity];
                    }
                    if (nodeOutSet[entity]) {
                        // 如果外键ref是user 使用属性名(user)以解决relation/entityList页面授权路径不对的问题
                        if (ref === "user") {
                            nodeOutSet[entity].push(`${attr.replace('Id', '')}(${ref})`);
                        }
                        else {
                            nodeOutSet[entity].push(ref);
                        }
                    }
                    else {
                        nodeOutSet[entity] = [ref];
                    }
                }
            }
        }
        // 把完全独立的对象剥离
        const entities = union(Object.keys(nodeOutSet), Object.keys(nodeInSet));
        entities.forEach((entity) => data.push({ name: entity }));
        // link上的value代表其长度。出入度越多的结点，其关联的边的value越大，以便于上层用引力布局渲染
        for (const entity in nodeOutSet) {
            const fromValue = nodeOutSet[entity].length + nodeInSet[entity]?.length || 0;
            for (const target of nodeOutSet[entity]) {
                const toValue = nodeOutSet[target]?.length || 0 + nodeInSet[target]?.length || 0;
                links.push({
                    source: entity,
                    target,
                    value: fromValue + toValue,
                });
            }
        }
        this.entityGraph = {
            data,
            links,
        };
    }
    getEntityGraph() {
        const { data, links } = this.entityGraph;
        return {
            data,
            links,
        };
    }
    getAllEntities() {
        return Object.keys(this.cache.getSchema());
    }
    getActions(entity) {
        return this.cache.getSchema()[entity].actions.filter(ele => !RelationAuth.IgnoredActions.includes(ele));
    }
    hasRelation(entity) {
        const schema = this.cache.getSchema();
        return !!schema[entity].relation;
    }
    getRelations(entity) {
        const schema = this.cache.getSchema();
        return schema[entity].relation;
    }
    getCascadeActionEntitiesBySource(entity) {
        const paths = this.actionCascadePathGraph.filter(ele => ele[2] === entity && ele[3]);
        return paths.map((ele) => ({
            path: ele,
            actions: this.cache.getSchema()[ele[0]].actions.filter(ele => !RelationAuth.IgnoredActions.includes(ele)),
        }));
    }
    getCascadeActionAuths(entity, ir) {
        const paths = this.actionCascadePathGraph.filter(ele => ele[0] === entity && ir === ele[3]);
        return paths;
    }
    getCascadeRelationAuthsBySource(entity) {
        const relationAuths = this.relationCascadePathGraph.filter(ele => ele[2] === entity && ele[3]);
        return relationAuths;
    }
    getCascadeRelationAuths(entity, ir) {
        const relationAuths = this.relationCascadePathGraph.filter(ele => ele[0] === entity && ir === ele[3]);
        return relationAuths;
    }
    checkRelation(entity, operation) {
        const context = this.cache.begin();
        try {
            this.baseRelationAuth.checkRelationSync(entity, operation, context);
        }
        catch (err) {
            this.cache.rollback();
            if (err instanceof OakRowUnexistedException) {
                // 发现缓存中缺失项的话要协助获取
                const missedRows = err.getRows();
                this.cache.fetchRows(missedRows);
                return false;
            }
            if (!(err instanceof OakUserException)) {
                throw err;
            }
            return false;
        }
        this.cache.rollback();
        return true;
    }
    async getRelationIdByName(entity, name, entityId) {
        const filter = {
            entity: entity,
            name,
        };
        if (entityId) {
            filter.$or = [
                {
                    entityId,
                },
                {
                    entityId: {
                        $exists: false,
                    },
                }
            ];
        }
        else {
            filter.entityId = {
                $exists: false,
            };
        }
        const { data: relations } = await this.cache.refresh('relation', {
            data: {
                id: 1,
                entity: 1,
                entityId: 1,
                name: 1,
                display: 1,
                actionAuth$relation: {
                    $entity: 'actionAuth',
                    data: {
                        id: 1,
                        paths: 1,
                        deActions: 1,
                        destEntity: 1,
                    },
                },
            },
            filter,
        });
        if (relations.length === 2) {
            return relations.find(ele => ele.entityId).id;
        }
        return relations[0].id;
    }
}