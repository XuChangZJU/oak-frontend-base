import assert from "assert";
import { AuthCascadePath } from "oak-domain/lib/types";
import { uniq, pull } from 'oak-domain/lib/utils/lodash';
import { ED } from "../../../types/AbstractComponent";

export default OakComponent({
    entity: 'relationAuth',
    projection: {
        id: 1,
        sourceRelationId: 1,
        destRelationId: 1,
        path: 1,
    },
    isList: true,
    properties: {
        entity: '' as keyof ED,
        relationId: '',
    },
    filters: [
        {
            filter() {
                const { entity, relationId } = this.props;
                if (relationId) {
                    return {
                        destRelationId: relationId,
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
                }
            },
        }
    ],
    pagination: {
        pageSize: 1000,
        currentPage: 0,
    },
    formData({ data }) {
        const { entity } = this.props;
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
        onChange(checked: boolean, sourceRelationId: string, path: string, relationAuth?: ED['relationAuth']['OpSchema']) {
            if (checked) {
                if (relationAuth) {
                    assert(relationAuth.$$deleteAt$$);
                    this.recoverItem(relationAuth.id);
                }
                else {
                    this.addItem({
                        sourceRelationId,
                        path,
                        destRelationId: this.props.relationId!,
                    });
                }
            }
            else {
                assert(relationAuth);
                this.removeItem(relationAuth.id);
            }
            
        },
        confirm() {
            this.execute();
        },
    }
})