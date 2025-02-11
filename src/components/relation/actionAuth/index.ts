import assert from "assert";
import { uniq, pull, union, difference } from 'oak-domain/lib/utils/lodash';
import { ED } from "../../../types/AbstractComponent";
import { groupBy } from "oak-domain/lib/utils/lodash";
import { StorageSchema } from "oak-domain/lib/types";

export default OakComponent({
    entity: 'actionAuth',
    projection: {
        id: 1,
        relationId: 1,
        paths: 1,
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
                const { entity, actions } = this.props!;
                assert(entity);
                return {
                    destEntity: entity as string,
                    relation: {
                        entityId: {
                            $exists: false,
                        }
                    }
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
        const schema = this.features.cache.getSchema();
        const cascadeEntities = this.features.relationAuth.getCascadeActionAuths(entity!, true);
        const actionAuthGroup = {} as any; //  for compile groupBy(data, (ele) => ele.paths?.join(','));
        const actionAuthList = Object.keys(actionAuthGroup).map(
            (key) => {
                let result = {};
                const row = actionAuthGroup[key][0];
                const { paths } = row;
                const path = paths![0];
                if (path.includes('$')) {
                    const relationEntity = this.resolveP(schema, path, row.destEntity);
                    const relations = this.features.cache.get('relation', {
                        data: {
                            id: 1,
                            entity: 1,
                            entityId: 1,
                            name: 1,
                            display: 1,
                        },
                        filter: {
                            entity: relationEntity,
                            entityId: {
                                $exists: false,
                            },
                        },
                    });
                    Object.assign(result, {
                        sourceEntity: relationEntity,
                        relationSelections: relations,
                    })
                } else {
                    const cascadeEntity = cascadeEntities.find((ele) =>
                        ele[1] === path
                    )
                    const relations = this.features.cache.get('relation', {
                        data: {
                            id: 1,
                            entity: 1,
                            entityId: 1,
                            name: 1,
                            display: 1,
                        },
                        filter: {
                            entity: cascadeEntity![2] as string,
                            entityId: {
                                $exists: false,
                            },
                        },
                    });
                    Object.assign(result, {
                        sourceEntity: cascadeEntity![2],
                        relationSelections: relations,
                    })
                }
                Object.assign(result, {
                    paths,
                    relations: actionAuthGroup[key],
                })
                return result;
            }
        )
        console.log(actionAuthList);
        // const cascadeEntityActions = cascadeEntities.map(
        //     (ele) => {
        //         const [de, p, se] = ele;
        //         const actionAuths = data?.filter(
        //             ele => ele.destEntity === de
        //         );
        //         const relations = this.features.cache.get('relation', {
        //             data: {
        //                 id: 1,
        //                 entity: 1,
        //                 entityId: 1,
        //                 name: 1,
        //                 display: 1,
        //             },
        //             filter: {
        //                 entity: se as string,
        //                 entityId: {
        //                     $exists: false,
        //                 },
        //             },
        //         });
        //         return {
        //             actionAuths,
        //             relations,
        //             path: ele,
        //         };
        //     }
        // );
        // // path里含有$
        // const $pathActionAuths: (RowWithActions<ED, 'actionAuth'> & { path: string })[] = [];
        // data.forEach((ele) => {
        //     if (ele.paths?.join('').includes('$')) {
        //         ele.paths.forEach((path) => {
        //             if (path.includes('$')) {
        //                 $pathActionAuths.push({
        //                     ...ele,
        //                     path,
        //                 })
        //             }
        //         })
        //     }
        // })
        // // groupBy
        // // 分解groupBy 的key
        // const $actionAuthsObject = groupBy($pathActionAuths, 'path');
        // // 含有反向指针的路径，其所对应实体的请求放在了onChange方法
        // Object.keys($actionAuthsObject).forEach((ele) => {
        //     const entities = ele.split('.');
        //     const slicePath = entities[entities.length - 1];
        //     const se = entities[entities.length - 1].split('$')[0];
        //     const relationEntity = this.resolveP(schema, ele, entity);
        //     const p = ele;
        //     const de = entity!;
        //     // 初始时 relation先用{name: relationName}表示
        //     let relations = [];
        //     if (relationEntity === 'user') {
        //         relations = [{ id: '', name: '当前用户' }];
        //     }
        //     else {
        //         relations = this.features.cache.get('relation', {
        //             data: {
        //                 id: 1,
        //                 entity: 1,
        //                 entityId: 1,
        //                 name: 1,
        //                 display: 1,
        //             },
        //             filter: {
        //                 entity: relationEntity as string,
        //                 entityId: {
        //                     $exists: false,
        //                 },
        //             },
        //         });
        //     }
        //     cascadeEntityActions.push({
        //         path: [de, p, se, true],
        //         relations: relations,
        //         actionAuths: $actionAuthsObject[ele],
        //     })
        // })

        // // relationId为空字符串 表示为user的actionAuth 也要特殊处理
        // const hasUserActionAuths: (RowWithActions<ED, 'actionAuth'> & { path: string })[] = [];
        // data.forEach((ele) => {
        //     if (ele.relationId === '') {
        //         ele.paths?.forEach((path) => {
        //             hasUserActionAuths.push({
        //                 ...ele,
        //                 path
        //             })
        //         })
        //     }
        // })
        // // const hasUserActionAuths = data.filter((ele) => ele.relationId === '');
        // const $actionAuthsObject2 = groupBy(hasUserActionAuths, 'path');
        // Object.keys($actionAuthsObject2).forEach((ele) => {
        //     const entities = ele.split('.');
        //     const se = entities[entities.length - 1].split('$')[0];
        //     const p = ele;
        //     const de = entity!;
        //     cascadeEntityActions.push({
        //         path: [de, p, se, true],
        //         relations: [{ id: '', name: '当前用户' }],
        //         actionAuths: $actionAuthsObject2[ele],
        //     })
        // })
        return {
            actionAuthList,
            actionAuths: data,
            // cascadeEntityActions,
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
                    // entity: {
                    //     $in: destEntities,
                    // },
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
        async onChange(checked: boolean, relationId: string, path: string, actionAuths?: ED['actionAuth']['Schema'][], relationName?: string) {
            const { actions } = this.props;
            assert(actions && actions.length > 0);
            // 排除user这种情况
            if (!relationId && (relationName && relationName !== '当前用户')) {
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
            if (actionAuths && actionAuths.length) {
                // const { deActions } = actionAuth;
                if (checked) {
                    const dASameActionAuth = actionAuths.find((ele) => difference(actions, ele.deActions).length === 0);
                    // 存在deActions相同，paths push并做去重处理
                    if (dASameActionAuth) {
                        if (dASameActionAuth.$$deleteAt$$ && dASameActionAuth.$$deleteAt$$ === 1) {
                            this.recoverItem(dASameActionAuth.id);
                        }
                        /* this.updateItem({
                            paths: dASameActionAuth.paths.concat(path),
                        }, dASameActionAuth.id) */
                    }
                    else {
                        /* this.addItem({
                            paths: [path],
                            relationId,
                            destEntity: this.props.entity as string,
                            deActions: actions,
                        }); */
                    }
                }
                else {
                    // 将path从paths中删除
                   /*  actionAuths.forEach((ele) => {
                        const pathIndex = ele.paths.findIndex((pathE) => pathE === path);
                        if (pathIndex !== -1) {
                            const newPaths = [...ele.paths];
                            newPaths.splice(pathIndex, 1);
                            if (!newPaths.length) {
                                this.removeItem(ele.id);
                            }
                            else {
                                this.updateItem({
                                    paths: newPaths
                                }, ele.id);
                            }
                        }
                    }) */
                }
                // if (checked) {
                //     const deActions2 = union(deActions, actions);
                //     this.updateItem({
                //         deActions: deActions2,
                //     }, actionAuth.id);
                // }
                // else {
                //     actions.forEach(
                //         action => pull(deActions, action)
                //     );
                //     this.updateItem({
                //         deActions,
                //     }, actionAuth.id);
                // }
            }
            else {
                // 新增actionAuth
                assert(checked);
                /* this.addItem({
                    paths: [path],
                    relationId,
                    destEntity: this.props.entity as string,
                    deActions: actions,
                }); */
            }
        },
        async onChange2(checked: boolean, relationId: string, paths: string[], actionAuths: ED['actionAuth']['Schema'][]) {
            console.log(checked);
            const { actions } = this.props;
            if (checked) {
                const dASameActionAuth = (actionAuths as ED['actionAuth']['Schema'][]).find((ele) => ele.relationId === relationId);
                if (dASameActionAuth) {
                    if (dASameActionAuth.$$deleteAt$$ && dASameActionAuth.$$deleteAt$$ === 1) {
                        this.recoverItem(dASameActionAuth.id);
                        this.updateItem({
                            deActions: actions,
                        }, dASameActionAuth.id)
                    }
                    else {
                        this.updateItem({
                            deActions: uniq((actions || []).concat(dASameActionAuth.deActions)),
                        }, dASameActionAuth.id)
                    }
                } else {
                    /* this.addItem({
                        paths,
                        relationId,
                        destEntity: this.props.entity as string,
                        deActions: actions,
                    }) */
                }
            } else {
                const dASameActionAuth = (actionAuths as ED['actionAuth']['Schema'][]).find((ele) => ele.relationId === relationId && !ele.$$deleteAt$$);
                assert(dASameActionAuth);
                const newActions = difference(dASameActionAuth.deActions, actions!);
                if (newActions.length === 0) {
                    this.removeItem(dASameActionAuth.id);
                } else {
                    this.updateItem({
                        deActions: newActions,
                    }, dASameActionAuth.id)
                }
            }
        },
        confirm() {
            this.execute();
        },
        resolveP(schema: StorageSchema<ED>, path: string, destEntity: string) {
            if (path === '') {
                return destEntity;
            }
            const splitArr = path.split('.');
            splitArr.unshift(destEntity);
            for (let i = 1; i < splitArr.length; i++) {
                if (splitArr[i].includes('$')) {
                    splitArr[i] = splitArr[i].split('$')[0];
                    continue;
                }
                // 用已解析的前项来解析后项
                const { attributes } = schema[splitArr[i - 1]];
                const { ref } = attributes[`${splitArr[i]}Id`];
                splitArr[i] = ref as string;
            }
            return splitArr[splitArr.length - 1];
        }
    }
})