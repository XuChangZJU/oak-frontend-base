import assert from "assert";
import { uniq } from 'oak-domain/lib/utils/lodash';
export default OakComponent({
    entity: 'relationAuth',
    projection: {
        id: 1,
        sourceRelationId: 1,
        sourceRelation: {
            id: 1,
            name: 1,
            display: 1,
            entity: 1,
            entityId: 1,
        },
        paths: 1,
        destRelationId: 1,
        destRelation: {
            id: 1,
            entity: 1,
            name: 1,
            display: 1,
            entityId: 1,
        },
    },
    isList: true,
    properties: {
        relationId: '',
        entity: '',
    },
    filters: [
        {
            filter() {
                const { relationId } = this.props;
                assert(relationId);
                return {
                    sourceRelationId: relationId,
                };
            }
        }
    ],
    pagination: {
        pageSize: 1000,
        currentPage: 0,
    },
    formData({ data }) {
        const { entity, relationId } = this.props;
        const [relation] = this.features.cache.get('relation', {
            data: {
                id: 1,
                name: 1,
                display: 1,
            },
            filter: {
                id: relationId,
            },
        });
        const { name } = relation || {};
        const cascadeEntities = this.features.relationAuth.getCascadeRelationAuthsBySource(entity);
        const cascadeEntityRelations = cascadeEntities.map((ele) => {
            const [de, p, se] = ele;
            // 可能的relations只查询系统规定的relation，不考虑定制的relation
            const relations = this.features.cache.get('relation', {
                data: {
                    id: 1,
                    entity: 1,
                    name: 1,
                    entityId: 1,
                    display: 1,
                },
                filter: {
                    entity: de,
                    entityId: {
                        $exists: false,
                    },
                    $not: {
                        entity: entity,
                        id: relationId,
                    }, // 自己不能管自己的权限
                },
            });
            //已授权的relation中可能有定制的relationId
            const authedRelations = data ? data.filter((ele) => ele.path === p) : [];
            return {
                entity: de,
                path: p,
                relations,
                authedRelations,
            };
        }).filter((ele) => ele.relations.length > 0 || ele.authedRelations.length > 0);
        return {
            relationName: name,
            cascadeEntityRelations,
        };
    },
    lifetimes: {
        ready() {
            const { entity } = this.props;
            const cascadeRelationEntities = this.features.relationAuth.getCascadeRelationAuthsBySource(entity);
            const cascadeEntities = uniq(cascadeRelationEntities.map(ele => ele[0]));
            if (cascadeEntities.length > 0) {
                this.features.cache.refresh('relation', {
                    data: {
                        id: 1,
                        entity: 1,
                        name: 1,
                        entityId: 1,
                    },
                    filter: {
                        entity: {
                            $in: cascadeEntities,
                        },
                        entityId: {
                            $exists: false,
                        },
                    },
                });
            }
        },
    },
    methods: {
        onChange(relationId, checked, relationAuthId, path) {
            if (checked) {
                if (relationAuthId) {
                    this.recoverItem(relationAuthId);
                }
                else {
                    this.addItem({
                        sourceRelationId: this.props.relationId,
                        path,
                        destRelationId: relationId,
                    });
                }
            }
            else {
                assert(relationAuthId);
                this.removeItem(relationAuthId);
            }
        },
        confirm() {
            this.execute();
        }
    }
});
