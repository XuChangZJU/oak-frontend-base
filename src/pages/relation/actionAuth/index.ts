import assert from "assert";
import { uniq, pull, union } from 'oak-domain/lib/utils/lodash';
import { ED } from "../../../types/AbstractComponent";
import { groupBy } from "oak-domain/lib/utils/lodash";
import { AuthCascadePath } from "oak-domain/lib/types";
import { RowWithActions } from "../../../types/Page";

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
                return {
                    destEntity: entity as string,
                };
               /*  if (!actions || actions.length === 0) {
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
                } */
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
        // path里含有$
        const $pathActionAuths = data.filter((ele) => ele.path?.includes('$'));
        // groupBy
        // 分解groupBy 的key
        const $actionAuthsObject = groupBy($pathActionAuths, 'path');
        // 含有反向指针的路径，其所对应实体的请求放在了onChange方法
        Object.keys($actionAuthsObject).forEach((ele) => {
            const entities = ele.split('.');
            const se = entities[entities.length - 1].split('$')[0];
            const p = ele;
            const de = entity!;
            // 初始时 relation先用{name: relationName}表示 
            const relations = this.features.relationAuth.getRelations(se!)?.map((ele) => ({name: ele})) as any;
            const relations2 = this.features.cache.get('relation', {
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
            cascadeEntityActions.push({
                path: [de, p, se, true],
                relations: relations2 || relations,
                actionAuths: $actionAuthsObject[ele],
            })
        })
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
    data: {
        relations2: [] as Partial<ED['relation']['Schema']>[],
    },
    listeners: {
        actions(prev, next) {
            const actionAuths = this.features.runningTree.getFreshValue(this.state.oakFullpath);
            if (actionAuths) {
                (actionAuths as ED['actionAuth']['OpSchema'][]).forEach(
                    (actionAuth) => {
                        if (actionAuth.$$createAt$$ === 1) {
                            const { id, deActions } = actionAuth;
                            this.updateItem({
                                deActions: next.actions,
                            }, id);
                        }
                    }
                );
            }
            this.reRender();
        },
    },
    methods: {
        async onChange(checked: boolean, relationId: string, path: string, actionAuth?: ED['actionAuth']['OpSchema'], relationName?: string) {
            const { actions } = this.props;
            assert(actions && actions.length > 0);
            if (!relationId) {
                const se = path.split('$')[0];
                const { data: relations } = await this.features.cache.refresh('relation', {
                    data: {
                        id: 1,
                        entity: 1,
                        entityId: 1,
                        name: 1,
                        display: 1,
                    },
                    filter: {
                        entity: se,
                        name: relationName,
                        entityId: {
                            $exists: false,
                        },
                    },
                });
                if (!relations || !relations.length) {
                    this.setMessage({
                        content: '数据缺失！',
                        type: 'error',
                    })
                    return;
                }
                relationId = relations[0].id!;
            }
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