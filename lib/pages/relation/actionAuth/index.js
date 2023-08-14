"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var assert_1 = tslib_1.__importDefault(require("assert"));
var lodash_1 = require("oak-domain/lib/utils/lodash");
var lodash_2 = require("oak-domain/lib/utils/lodash");
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
            filter: function () {
                var _a = this.props, entity = _a.entity, actions = _a.actions;
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
    formData: function (_a) {
        var _this = this;
        var data = _a.data;
        var entity = this.props.entity;
        var cascadeEntities = this.features.relationAuth.getCascadeActionAuths(entity, true);
        var cascadeEntityActions = cascadeEntities.map(function (ele) {
            var _a = tslib_1.__read(ele, 3), de = _a[0], p = _a[1], se = _a[2];
            var actionAuths = data === null || data === void 0 ? void 0 : data.filter(function (ele) { return ele.destEntity === de; });
            var relations = _this.features.cache.get('relation', {
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
                actionAuths: actionAuths,
                relations: relations,
                path: ele,
            };
        });
        // path里含有$
        var $pathActionAuths = [];
        data.forEach(function (ele) {
            var _a;
            if ((_a = ele.paths) === null || _a === void 0 ? void 0 : _a.join('').includes('$')) {
                ele.paths.forEach(function (path) {
                    if (path.includes('$')) {
                        $pathActionAuths.push(tslib_1.__assign(tslib_1.__assign({}, ele), { path: path }));
                    }
                });
            }
        });
        // groupBy
        // 分解groupBy 的key
        var $actionAuthsObject = (0, lodash_2.groupBy)($pathActionAuths, 'path');
        // 含有反向指针的路径，其所对应实体的请求放在了onChange方法
        Object.keys($actionAuthsObject).forEach(function (ele) {
            var _a;
            var entities = ele.split('.');
            var se = entities[entities.length - 1].split('$')[0];
            var p = ele;
            var de = entity;
            // 初始时 relation先用{name: relationName}表示 
            var relations = (_a = _this.features.relationAuth.getRelations(se)) === null || _a === void 0 ? void 0 : _a.map(function (ele) { return ({ name: ele }); });
            var relations2 = _this.features.cache.get('relation', {
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
            cascadeEntityActions.push({
                path: [de, p, se, true],
                relations: relations2 || relations,
                actionAuths: $actionAuthsObject[ele],
            });
        });
        // relationId为空字符串 表示为user的actionAuth 也要特殊处理
        var hasUserActionAuths = [];
        data.forEach(function (ele) {
            var _a;
            if (ele.relationId === '') {
                (_a = ele.paths) === null || _a === void 0 ? void 0 : _a.forEach(function (path) {
                    hasUserActionAuths.push(tslib_1.__assign(tslib_1.__assign({}, ele), { path: path }));
                });
            }
        });
        // const hasUserActionAuths = data.filter((ele) => ele.relationId === '');
        var $actionAuthsObject2 = (0, lodash_2.groupBy)(hasUserActionAuths, 'path');
        Object.keys($actionAuthsObject2).forEach(function (ele) {
            var entities = ele.split('.');
            var se = entities[entities.length - 1].split('$')[0];
            var p = ele;
            var de = entity;
            cascadeEntityActions.push({
                path: [de, p, se, true],
                relations: [{ id: '', name: '当前用户' }],
                actionAuths: $actionAuthsObject2[ele],
            });
        });
        return {
            cascadeEntityActions: cascadeEntityActions,
        };
    },
    lifetimes: {
        ready: function () {
            var entity = this.props.entity;
            var cascadeEntities = this.features.relationAuth.getCascadeActionAuths(entity, true);
            var destEntities = (0, lodash_1.uniq)(cascadeEntities.map(function (ele) { return ele[2]; }));
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
        relations2: [],
    },
    listeners: {
        actions: function (prev, next) {
            var _this = this;
            var actionAuths = this.features.runningTree.getFreshValue(this.state.oakFullpath);
            if (actionAuths) {
                actionAuths.forEach(function (actionAuth) {
                    if (actionAuth.$$createAt$$ === 1) {
                        var id = actionAuth.id, deActions = actionAuth.deActions;
                        _this.updateItem({
                            deActions: next.actions,
                        }, id);
                    }
                });
            }
            this.reRender();
        },
    },
    methods: {
        onChange: function (checked, relationId, path, actionAuths, relationName) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var actions, se, relations, dASameActionAuth;
                var _this = this;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            actions = this.props.actions;
                            (0, assert_1.default)(actions && actions.length > 0);
                            if (!(!relationId && (relationName && relationName !== '当前用户'))) return [3 /*break*/, 2];
                            se = path.split('$')[0];
                            return [4 /*yield*/, this.features.cache.refresh('relation', {
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
                                })];
                        case 1:
                            relations = (_a.sent()).data;
                            if (!relations || !relations.length) {
                                this.setMessage({
                                    content: '数据缺失！',
                                    type: 'error',
                                });
                                return [2 /*return*/];
                            }
                            relationId = relations[0].id;
                            _a.label = 2;
                        case 2:
                            if (actionAuths && actionAuths.length) {
                                // const { deActions } = actionAuth;
                                if (checked) {
                                    dASameActionAuth = actionAuths.find(function (ele) { return (0, lodash_1.difference)(actions, ele.deActions).length === 0; });
                                    // 存在deActions相同，paths push并做去重处理
                                    if (dASameActionAuth) {
                                        this.updateItem({
                                            paths: dASameActionAuth.paths.concat(path),
                                        }, dASameActionAuth.id);
                                    }
                                    else {
                                        this.addItem({
                                            paths: [path],
                                            relationId: relationId,
                                            destEntity: this.props.entity,
                                            deActions: actions,
                                        });
                                    }
                                }
                                else {
                                    // 将path从paths中删除
                                    actionAuths.forEach(function (ele) {
                                        var pathIndex = ele.paths.findIndex(function (pathE) { return pathE === path; });
                                        if (pathIndex !== -1) {
                                            var newPaths = tslib_1.__spreadArray([], tslib_1.__read(ele.paths), false);
                                            newPaths.splice(pathIndex, 1);
                                            if (!newPaths.length) {
                                                _this.removeItem(ele.id);
                                            }
                                            else {
                                                _this.updateItem({
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
                                    relationId: relationId,
                                    destEntity: this.props.entity,
                                    deActions: actions,
                                });
                            }
                            return [2 /*return*/];
                    }
                });
            });
        },
        confirm: function () {
            this.execute();
        },
    }
});
