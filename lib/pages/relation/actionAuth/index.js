"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const assert_1 = tslib_1.__importDefault(require("assert"));
const lodash_1 = require("oak-domain/lib/utils/lodash");
const lodash_2 = require("oak-domain/lib/utils/lodash");
exports.default = OakComponent({
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
        entity: '',
        actions: [],
    },
    filters: [
        {
            filter() {
                const { entity, actions } = this.props;
                (0, assert_1.default)(entity);
                return {
                    destEntity: entity,
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
        const cascadeEntities = this.features.relationAuth.getCascadeActionAuths(entity, true);
        const cascadeEntityActions = cascadeEntities.map((ele) => {
            const [de, p, se] = ele;
            const actionAuths = data?.filter(ele => ele.destEntity === de);
            const relations = this.features.cache.get('relation', {
                data: {
                    id: 1,
                    entity: 1,
                    entityId: 1,
                    name: 1,
                    display: 1,
                },
                filter: {
                    entity: se,
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
        });
        // path里含有$
        const $pathActionAuths = [];
        data.forEach((ele) => {
            if (ele.paths?.join('').includes('$')) {
                ele.paths.forEach((path) => {
                    if (path.includes('$')) {
                        $pathActionAuths.push({
                            ...ele,
                            path,
                        });
                    }
                });
            }
        });
        // groupBy
        // 分解groupBy 的key
        const $actionAuthsObject = (0, lodash_2.groupBy)($pathActionAuths, 'path');
        // 含有反向指针的路径，其所对应实体的请求放在了onChange方法
        Object.keys($actionAuthsObject).forEach((ele) => {
            const entities = ele.split('.');
            const slicePath = entities[entities.length - 1];
            const se = entities[entities.length - 1].split('$')[0];
            const relationEntity = this.resolveP(schema, ele, entity);
            const p = ele;
            const de = entity;
            // 初始时 relation先用{name: relationName}表示
            let relations = [];
            if (relationEntity === 'user') {
                relations = [{ id: '', name: '当前用户' }];
            }
            else {
                relations = this.features.cache.get('relation', {
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
            }
            /* cascadeEntityActions.push({
                path: [de, p, se, true],
                relations: relations,
                actionAuths: $actionAuthsObject[ele],
            }) */
        });
        // relationId为空字符串 表示为user的actionAuth 也要特殊处理
        const hasUserActionAuths = [];
        data.forEach((ele) => {
            if (ele.relationId === '') {
                ele.paths?.forEach((path) => {
                    hasUserActionAuths.push({
                        ...ele,
                        path
                    });
                });
            }
        });
        // const hasUserActionAuths = data.filter((ele) => ele.relationId === '');
        const $actionAuthsObject2 = (0, lodash_2.groupBy)(hasUserActionAuths, 'path');
        Object.keys($actionAuthsObject2).forEach((ele) => {
            const entities = ele.split('.');
            const se = entities[entities.length - 1].split('$')[0];
            const p = ele;
            const de = entity;
            /* cascadeEntityActions.push({
                path: [de, p, se, true],
                relations: [{ id: '', name: '当前用户' }],
                actionAuths: $actionAuthsObject2[ele],
            }) */
        });
        return {
            cascadeEntityActions,
        };
    },
    lifetimes: {
        ready() {
            const { entity } = this.props;
            const cascadeEntities = this.features.relationAuth.getCascadeActionAuths(entity, true);
            const destEntities = (0, lodash_1.uniq)(cascadeEntities.map(ele => ele[2]));
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
        relations2: [],
    },
    listeners: {
        actions(prev, next) {
            const actionAuths = this.features.runningTree.getFreshValue(this.state.oakFullpath);
            if (actionAuths) {
                actionAuths.forEach((actionAuth) => {
                    if (actionAuth.$$createAt$$ === 1) {
                        const { id, deActions } = actionAuth;
                        this.updateItem({
                            deActions: next.actions,
                        }, id);
                    }
                });
            }
            this.reRender();
        },
    },
    methods: {
        async onChange(checked, relationId, path, actionAuths, relationName) {
            const { actions } = this.props;
            (0, assert_1.default)(actions && actions.length > 0);
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
                    });
                    return;
                }
                relationId = relations[0].id;
            }
            if (actionAuths && actionAuths.length) {
                // const { deActions } = actionAuth;
                if (checked) {
                    const dASameActionAuth = actionAuths.find((ele) => (0, lodash_1.difference)(actions, ele.deActions).length === 0);
                    // 存在deActions相同，paths push并做去重处理
                    if (dASameActionAuth) {
                        if (dASameActionAuth.$$deleteAt$$ && dASameActionAuth.$$deleteAt$$ === 1) {
                            this.recoverItem(dASameActionAuth.id);
                        }
                        this.updateItem({
                            paths: dASameActionAuth.paths.concat(path),
                        }, dASameActionAuth.id);
                    }
                    else {
                        this.addItem({
                            paths: [path],
                            relationId,
                            destEntity: this.props.entity,
                            deActions: actions,
                        });
                    }
                }
                else {
                    // 将path从paths中删除
                    actionAuths.forEach((ele) => {
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
                    });
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
                (0, assert_1.default)(checked);
                this.addItem({
                    paths: [path],
                    relationId,
                    destEntity: this.props.entity,
                    deActions: actions,
                });
            }
        },
        confirm() {
            this.execute();
        },
        resolveP(schema, path, destEntity) {
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
                splitArr[i] = ref;
            }
            return splitArr[splitArr.length - 1];
        }
    }
});
