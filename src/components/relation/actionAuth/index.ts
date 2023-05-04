import assert from "assert";
import { AuthCascadePath } from "oak-domain/lib/types";
import { uniq, pull } from 'oak-domain/lib/utils/lodash';
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
    },
    filters: [
        {
            filter() {
                const { entity } = this.props;
                const { action } = this.state;
                assert(entity);
                if (!action) {
                    return {
                        destEntity: entity as string,
                    };
                }
                else {
                    return {
                        destEntity: entity as string,
                        deActions: {
                            $contains: action,
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
    data: {
        action: '',
    },
    formData({ data }) {
        const { entity } = this.props;
        const actions = this.features.relationAuth.getActions(entity!);
        const cascadeEntities = this.features.relationAuth.getCascadeActionEntities(entity!);
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
            actions,
            cascadeEntityActions,
        };
    },
    lifetimes: {
        ready() {
            const { entity } = this.props;
            const cascadeEntities = this.features.relationAuth.getCascadeActionEntities(entity!);
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
            const { action } = this.state;
            assert(action);
            if (actionAuth) {
                const { deActions } = actionAuth;
                if (checked) {
                    deActions!.push(action);
                }
                else {
                    pull(deActions!, action);
                }
                this.updateItem({
                    deActions,
                }, actionAuth.id);
            }
            else {
                // 新增actionAuth
                assert(checked);
                this.addItem({
                    path,
                    relationId,
                    destEntity: this.props.entity as string,
                    deActions: [action],
                });
            }            
        },
        confirm() {
            this.execute();
        },
        onActionSelected(action: string) {
            this.setState({
                action,
            });
            // 不用refresh，所有destEntity等同于entity的行都已经被取出来了
            // this.refresh();
            this.reRender();
        }
    }
})