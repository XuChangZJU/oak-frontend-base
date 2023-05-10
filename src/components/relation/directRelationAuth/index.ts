// attention! 这个组件没有测试过，因为jichuang项目没有存在directRelationAuth的entity. by Xc 2023.05.06
import assert from "assert";
import { difference } from 'oak-domain/lib/utils/lodash';
import { AuthCascadePath, CascadeActionAuth } from "oak-domain/lib/types";
import { ED } from "../../../types/AbstractComponent";

export default OakComponent({
    entity: 'directRelationAuth',
    isList: true,
    projection: {
        id: 1,
        path: 1,
        destRelationId: 1,
    },
    properties: {
        entity: '' as keyof ED,
        relationIds: [] as string[],
    },
    filters: [
        {
            filter() {
                const { entity, relationIds } = this.props;
                if (relationIds && relationIds.length > 0) {
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
                }
            },
        }
    ],
    formData({ data }) {
        const { entity } = this.props;
        const auths = this.features.relationAuth.getCascadeRelationAuths(entity!, false);

        return {
            auths,
            directRelationAuths: data,
        };
    },
    methods: {
        onChange(checked: boolean, path: AuthCascadePath<ED>, directRelationAuths?: ED['directRelationAuth']['OpSchema'][]) {
            const { relationIds } = this.props;
            assert(relationIds);
            if (checked) {
                if (directRelationAuths) {
                    const includedRelationIds = [] as string[];
                    directRelationAuths.forEach(
                        (dra) => {
                            if (dra.$$deleteAt$$) {
                                this.recoverItem(dra.id);
                            }
                            includedRelationIds.push(dra.destRelationId);
                        }
                    )
                    const restRelationIds = difference(relationIds, includedRelationIds);
                    restRelationIds.forEach(
                        (relationId) => this.addItem({
                            path: path[1],
                            destRelationId: relationId,
                        })
                    );
                }
                else {
                    relationIds.forEach(
                        (relationId) => this.addItem({
                            path: path[1],
                            destRelationId: relationId,
                        })
                    );;
                }
            }
            else {
                assert(directRelationAuths && directRelationAuths.length > 0);
                directRelationAuths.forEach(
                    (dra) => this.removeItem(dra.id)
                );
            }
        },
        confirm() {
            this.execute();
        },
    }
})