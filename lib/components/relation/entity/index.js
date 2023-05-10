"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
exports.default = OakComponent({
    isList: false,
    properties: {
        entity: '',
    },
    data: {
        checkedActions: [],
        relationIds: [],
    },
    formData: function () {
        var entity = this.props.entity;
        var actions = this.features.relationAuth.getActions(entity);
        var daas = this.features.relationAuth.getCascadeActionAuths(entity, false);
        var relations = this.features.cache.get('relation', {
            data: {
                id: 1,
                entity: 1,
                entityId: 1,
                name: 1,
                display: 1,
            },
            filter: {
                entity: entity,
                entityId: {
                    $exists: false,
                },
            }
        });
        var dras = this.features.relationAuth.getCascadeRelationAuths(entity, false);
        var deduceRelationAttr = this.features.relationAuth.getDeduceRelationAttribute(entity);
        return {
            relations: relations,
            actions: actions,
            hasDirectActionAuth: daas.length > 0,
            hasDirectRelationAuth: dras.length > 0,
            deduceRelationAttr: deduceRelationAttr,
        };
    },
    lifetimes: {
        ready: function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var entity;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            entity = this.props.entity;
                            if (!this.features.relationAuth.hasRelation(entity)) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.features.cache.refresh('relation', {
                                    data: {
                                        id: 1,
                                        entity: 1,
                                        entityId: 1,
                                        name: 1,
                                        display: 1,
                                    },
                                    filter: {
                                        entity: entity,
                                        entityId: {
                                            $exists: false,
                                        },
                                    }
                                })];
                        case 1:
                            _a.sent();
                            // 没定义entity，显式的reRender
                            this.reRender();
                            _a.label = 2;
                        case 2: return [2 /*return*/];
                    }
                });
            });
        }
    },
    methods: {
        onActionsSelected: function (checkedActions) {
            this.setState({ checkedActions: checkedActions });
        },
        onRelationsSelected: function (relationIds) {
            this.setState({ relationIds: relationIds });
        }
    }
});
