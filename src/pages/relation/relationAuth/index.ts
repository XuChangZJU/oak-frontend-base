import assert from "assert";
import { uniq, pull, difference } from 'oak-domain/lib/utils/lodash';
import { ED } from "../../../types/AbstractComponent";

export default OakComponent({
    entity: 'relationAuth',
    projection: {
        id: 1,
        sourceRelationId: 1,
        destRelationId: 1,
    },
    isList: true,
    properties: {
        entity: '' as keyof ED,
        relationIds: [] as string[],
    },
    filters: [
        {
            filter() {
                const { entity, relationIds } = this.props;
                // 这里不能用relationIds过滤，否则没法处理relationId的反选
                    return {
                        destRelation: {
                            entity: entity as string,
                            entityId: {
                                $exists: false,
                            },
                        },
                    };
                /* if (relationIds && relationIds.length > 0) {
                    return {
                        destRelationId: {
                            $in: relationIds,
                        },
                    };
                }
                else {
                    return {
                        destRelation: {
                            entity: entity as string,
                            entityId: {
                                $exists: false,
                            },
                        },
                    };
                } */
            },
        }
    ],
    pagination: {
        pageSize: 1000,
        currentPage: 0,
    },
    formData({ data }) {
        const { entity, relationIds } = this.props;
        const auths = this.features.relationAuth.getCascadeRelationAuths(entity!, true);
        const sourceEntities = auths.map(
            ele => ele[2]
        ) as string[];
        const sourceRelations = this.features.cache.get('relation', {
            data: {
                id: 1,
                entity: 1,
                entityId: 1,
                name: 1,
                display: 1,
            },
            filter: {
                entity: {
                    $in: sourceEntities,
                },
                entityId: {
                    $exists: false,
                },
            },
        });
        return {
            relationAuths: data,
            auths,
            sourceRelations,
        };
    },
    listeners: {
        relationIds(prev, next) {
            const relationAuths = this.features.runningTree.getFreshValue(this.state.oakFullpath);
            if (relationAuths) {
                const { relationIds } = next;
                (relationAuths as ED['relationAuth']['OpSchema'][]).forEach(
                    (relationAuth) => {
                        if (relationAuth.$$createAt$$ === 1 && !relationIds.includes(relationAuth.destRelationId)) {
                            const { id } = relationAuth;
                            this.removeItem(id);
                        }
                    }
                );
            }
            this.reRender();
        },
    },
    lifetimes: {
        ready() {
            const { entity } = this.props;
            const auths = this.features.relationAuth.getCascadeRelationAuths(entity!, true);
            const sourceEntities = auths.map(
                ele => ele[2]
            ) as string[];
            this.features.cache.refresh('relation', {
                data: {
                    id: 1,
                    entity: 1,
                    entityId: 1,
                    name: 1,
                    display: 1,
                },
                filter: {
                    entity: {
                        $in: sourceEntities,
                    },
                    entityId: {
                        $exists: false,
                    },
                },
            });
        },
    },
    methods: {
        onChange(checked: boolean, sourceRelationId: string, path: string, relationAuths?: ED['relationAuth']['OpSchema'][]) {
            const { relationIds } = this.props;
            assert(relationIds);
            if (checked) {
                if (relationAuths) {
                    // 这些relationAuths可能是已经带有relationIds的，也有可能是被删除掉的，比较复杂
                    const includedRelationIds = [] as string[];
                    for (const auth of relationAuths) {
                        if (auth.$$deleteAt$$) {
                            this.recoverItem(auth.id);
                        }
                        includedRelationIds.push(auth.destRelationId);
                    }
                    const restRelationIds = difference(relationIds, includedRelationIds);
                    /* restRelationIds.forEach(
                        (relationId) => this.addItem({
                            sourceRelationId,
                            path,
                            destRelationId: relationId,
                        })
                    ); */
                }
                else {
                   /*  relationIds.forEach(
                        relationId => this.addItem({
                            sourceRelationId,
                            path,
                            destRelationId: relationId,
                        })
                    ); */
                }
            }
            else {
                assert(relationAuths);
                relationAuths.forEach(
                    relationAuth => {
                        if (!relationAuth.$$deleteAt$$) {
                            this.removeItem(relationAuth.id);
                        }
                    }
                );
            }
            
        },
        confirm() {
            this.execute();
        },
    }
});
