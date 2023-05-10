import assert from "assert";
import { AuthCascadePath } from "oak-domain/lib/types";
import { uniq, pull, union } from 'oak-domain/lib/utils/lodash';
import { ED } from "../../../types/AbstractComponent";

export default OakComponent({
    entity: 'actionAuth',
    projection: {
        id: 1,
        relationId: 1,
        path: 1,
        deActions: 1,
        destEntity: 1,
        relation: {
            id: 1,
            entity: 1,
        },
    },
    isList: true,
    properties: {
        entity: '' as keyof ED,
        actions: [] as string[],
    },
    filters: [
        {
            filter() {
                const { entity, actions } = this.props;
                assert(entity);
                if (!actions || actions.length === 0) {
                    return {
                        destEntity: entity as string,
                    };
                }
                else {
                    return {
                        destEntity: entity as string,
                        deActions: {
                            $overlaps: actions,
                        },
                    };
                }
            }
        }
    ],
    pagination: {
        pageSize: 1000,
        currentPage: 0,
    },
    formData({ data }) {
        const { entity } = this.props;
        const cascadeEntities = this.features.relationAuth.getCascadeActionAuths(entity!, true);
        const cascadeEntityActions = cascadeEntities.map(
            (ele) => {
                const [de, p, se] = ele;

                const actionAuths = data?.filter(
                    ele => ele.path === p && ele.destEntity === de
                );
                const relations = this.features.cache.get('relation', {
                    data: {
                        id: 1,
                        entity: 1,
                        entityId: 1,
                        name: 1,
                        display: 1,
                    },
                    filter: {
                        entity: se as string,
                        entityId: {
                            $exists: false,
                        },
                    },
                });
                return {
                    actionAuths,
                    relations,
                    path: ele,
                };
            }
        );
        return {
            cascadeEntityActions,
        };
    },
    lifetimes: {
        ready() {
            const { entity } = this.props;
            const cascadeEntities = this.features.relationAuth.getCascadeActionAuths(entity!, true);
            const destEntities = uniq(cascadeEntities.map(ele => ele[2])) as string[];
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
                        $in: destEntities,
                    },
                    entityId: {
                        $exists: false,
                    },
                },
            });
        }
    },
    methods: {
        onChange(checked: boolean, relationId: string, path: string, actionAuth?: ED['actionAuth']['OpSchema']) {
            const { actions } = this.props;
            assert(actions && actions.length > 0);
            if (actionAuth) {
                const { deActions } = actionAuth;
                if (checked) {
                    const deActions2 = union(deActions, actions);
                    this.updateItem({
                        deActions: deActions2,
                    }, actionAuth.id);
                }
                else {
                    actions.forEach(
                        action => pull(deActions, action)
                    );
                    this.updateItem({
                        deActions,
                    }, actionAuth.id);
                }
            }
            else {
                // 新增actionAuth
                assert(checked);
                this.addItem({
                    path,
                    relationId,
                    destEntity: this.props.entity as string,
                    deActions: actions,
                });
            }            
        },
        confirm() {
            this.execute();
        },
    }
})