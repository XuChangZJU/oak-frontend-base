"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var assert_1 = tslib_1.__importDefault(require("assert"));
var lodash_1 = require("oak-domain/lib/utils/lodash");
exports.default = OakComponent({
    entity: 'relationAuth',
    projection: {
        id: 1,
        sourceRelationId: 1,
        destRelationId: 1,
        path: 1,
    },
    isList: true,
    properties: {
        entity: '',
        relationIds: [],
    },
    filters: [
        {
            filter: function () {
                var _a = this.props, entity = _a.entity, relationIds = _a.relationIds;
                // 这里不能用relationIds过滤，否则没法处理relationId的反选
                return {
                    destRelation: {
                        entity: entity,
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
    formData: function (_a) {
        var data = _a.data;
        var _b = this.props, entity = _b.entity, relationIds = _b.relationIds;
        var auths = this.features.relationAuth.getCascadeRelationAuths(entity, true);
        var sourceEntities = auths.map(function (ele) { return ele[2]; });
        var sourceRelations = this.features.cache.get('relation', {
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
            auths: auths,
            sourceRelations: sourceRelations,
        };
    },
    listeners: {
        relationIds: function (prev, next) {
            var _this = this;
            var relationAuths = this.features.runningTree.getFreshValue(this.state.oakFullpath);
            if (relationAuths) {
                var relationIds_1 = next.relationIds;
                relationAuths.forEach(function (relationAuth) {
                    if (relationAuth.$$createAt$$ === 1 && !relationIds_1.includes(relationAuth.destRelationId)) {
                        var id = relationAuth.id;
                        _this.removeItem(id);
                    }
                });
            }
            this.reRender();
        },
    },
    lifetimes: {
        ready: function () {
            var entity = this.props.entity;
            var auths = this.features.relationAuth.getCascadeRelationAuths(entity, true);
            var sourceEntities = auths.map(function (ele) { return ele[2]; });
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
        onChange: function (checked, sourceRelationId, path, relationAuths) {
            var e_1, _a;
            var _this = this;
            var relationIds = this.props.relationIds;
            (0, assert_1.default)(relationIds);
            if (checked) {
                if (relationAuths) {
                    // 这些relationAuths可能是已经带有relationIds的，也有可能是被删除掉的，比较复杂
                    var includedRelationIds = [];
                    try {
                        for (var relationAuths_1 = tslib_1.__values(relationAuths), relationAuths_1_1 = relationAuths_1.next(); !relationAuths_1_1.done; relationAuths_1_1 = relationAuths_1.next()) {
                            var auth = relationAuths_1_1.value;
                            if (auth.$$deleteAt$$) {
                                this.recoverItem(auth.id);
                            }
                            includedRelationIds.push(auth.destRelationId);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (relationAuths_1_1 && !relationAuths_1_1.done && (_a = relationAuths_1.return)) _a.call(relationAuths_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    var restRelationIds = (0, lodash_1.difference)(relationIds, includedRelationIds);
                    restRelationIds.forEach(function (relationId) { return _this.addItem({
                        sourceRelationId: sourceRelationId,
                        path: path,
                        destRelationId: relationId,
                    }); });
                }
                else {
                    relationIds.forEach(function (relationId) { return _this.addItem({
                        sourceRelationId: sourceRelationId,
                        path: path,
                        destRelationId: relationId,
                    }); });
                }
            }
            else {
                (0, assert_1.default)(relationAuths);
                relationAuths.forEach(function (relationAuth) {
                    if (!relationAuth.$$deleteAt$$) {
                        _this.removeItem(relationAuth.id);
                    }
                });
            }
        },
        confirm: function () {
            this.execute();
        },
    }
});
