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
        sourceRelation: {
            id: 1,
            name: 1,
            display: 1,
            entity: 1,
            entityId: 1,
        },
        path: 1,
        destRelationId: 1,
        destRelation: {
            id: 1,
            entity: 1,
            name: 1,
            display: 1,
            entityId: 1,
        },
    },
    isList: true,
    properties: {
        relationId: '',
        entity: '',
    },
    filters: [
        {
            filter: function () {
                var relationId = this.props.relationId;
                (0, assert_1.default)(relationId);
                return {
                    sourceRelationId: relationId,
                };
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
        var _b = this.props, entity = _b.entity, relationId = _b.relationId;
        var _c = tslib_1.__read(this.features.cache.get('relation', {
            data: {
                id: 1,
                name: 1,
                display: 1,
            },
            filter: {
                id: relationId,
            },
        }), 1), relation = _c[0];
        var name = (relation || {}).name;
        var cascadeEntities = this.features.relationAuth.getCascadeRelationAuthsBySource(entity);
        var cascadeEntityRelations = cascadeEntities.map(function (ele) {
            var _a = tslib_1.__read(ele, 3), de = _a[0], p = _a[1], se = _a[2];
            // 可能的relations只查询系统规定的relation，不考虑定制的relation
            var relations = _this.features.cache.get('relation', {
                data: {
                    id: 1,
                    entity: 1,
                    name: 1,
                    entityId: 1,
                    display: 1,
                },
                filter: {
                    entity: de,
                    entityId: {
                        $exists: false,
                    },
                    $not: {
                        entity: entity,
                        id: relationId,
                    }, // 自己不能管自己的权限
                },
            });
            //已授权的relation中可能有定制的relationId
            var authedRelations = data ? data.filter(function (ele) { return ele.path === p; }) : [];
            return {
                entity: de,
                path: p,
                relations: relations,
                authedRelations: authedRelations,
            };
        }).filter(function (ele) { return ele.relations.length > 0 || ele.authedRelations.length > 0; });
        return {
            relationName: name,
            cascadeEntityRelations: cascadeEntityRelations,
        };
    },
    lifetimes: {
        ready: function () {
            var entity = this.props.entity;
            var cascadeRelationEntities = this.features.relationAuth.getCascadeRelationAuthsBySource(entity);
            var cascadeEntities = (0, lodash_1.uniq)(cascadeRelationEntities.map(function (ele) { return ele[0]; }));
            if (cascadeEntities.length > 0) {
                this.features.cache.refresh('relation', {
                    data: {
                        id: 1,
                        entity: 1,
                        name: 1,
                        entityId: 1,
                    },
                    filter: {
                        entity: {
                            $in: cascadeEntities,
                        },
                        entityId: {
                            $exists: false,
                        },
                    },
                });
            }
        },
    },
    methods: {
        onChange: function (relationId, checked, relationAuthId, path) {
            if (checked) {
                if (relationAuthId) {
                    this.recoverItem(relationAuthId);
                }
                else {
                    this.addItem({
                        sourceRelationId: this.props.relationId,
                        path: path,
                        destRelationId: relationId,
                    });
                }
            }
            else {
                (0, assert_1.default)(relationAuthId);
                this.removeItem(relationAuthId);
            }
        },
        confirm: function () {
            this.execute();
        }
    }
});
