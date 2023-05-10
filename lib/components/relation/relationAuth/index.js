"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var assert_1 = tslib_1.__importDefault(require("assert"));
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
        relationId: '',
    },
    filters: [
        {
            filter: function () {
                var _a = this.props, entity = _a.entity, relationId = _a.relationId;
                if (relationId) {
                    return {
                        destRelationId: relationId,
                    };
                }
                else {
                    return {
                        destRelation: {
                            entity: entity,
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
    formData: function (_a) {
        var data = _a.data;
        var entity = this.props.entity;
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
        onChange: function (checked, sourceRelationId, path, relationAuth) {
            if (checked) {
                if (relationAuth) {
                    (0, assert_1.default)(relationAuth.$$deleteAt$$);
                    this.recoverItem(relationAuth.id);
                }
                else {
                    this.addItem({
                        sourceRelationId: sourceRelationId,
                        path: path,
                        destRelationId: this.props.relationId,
                    });
                }
            }
            else {
                (0, assert_1.default)(relationAuth);
                this.removeItem(relationAuth.id);
            }
        },
        confirm: function () {
            this.execute();
        },
    }
});
