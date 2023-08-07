"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
exports.default = OakComponent({
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
            name: 1,
        },
    },
    isList: true,
    properties: {
        path: '',
        openTip: false,
        entity: '',
        onClose: (function () { return undefined; }),
    },
    filters: [
        {
            filter: function () {
                var _a = this.props, path = _a.path, entity = _a.entity;
                return {
                    destEntity: entity,
                    path: path,
                };
            },
            '#name': 'path',
        }
    ],
    pagination: {
        pageSize: 1000,
        currentPage: 0,
    },
    formData: function (_a) {
        var rows = _a.data;
        // console.log(this.props.path);
        return {
            rows: rows
        };
    },
    data: {
        relations: [],
        actions: [],
    },
    listeners: {
        path: function (prev, next) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _a, path, entity;
                return tslib_1.__generator(this, function (_b) {
                    if (prev.path !== next.path) {
                        _a = this.props, path = _a.path, entity = _a.entity;
                        this.getRelationAndActions();
                        this.addNamedFilter({
                            filter: {
                                path: path,
                                destEntity: entity,
                            },
                            '#name': 'path'
                        }, true);
                    }
                    return [2 /*return*/];
                });
            });
        }
    },
    lifetimes: {
        ready: function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    this.getRelationAndActions();
                    return [2 /*return*/];
                });
            });
        }
    },
    methods: {
        getRelationAndActions: function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _a, path, entity, entities, sourceEntity, source, actions, relations;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = this.props, path = _a.path, entity = _a.entity;
                            entities = path.split('.');
                            sourceEntity = entities[(entities === null || entities === void 0 ? void 0 : entities.length) - 1];
                            source = sourceEntity.includes('$') ? sourceEntity.split('$')[0] : sourceEntity;
                            actions = this.features.relationAuth.getActions(entity);
                            // 获取relation
                            // user 没有relation
                            if (source.includes('(user)')) {
                                this.setState({
                                    relations: [{ id: '', name: '当前用户' }],
                                    actions: actions,
                                });
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, this.features.cache.refresh('relation', {
                                    data: {
                                        id: 1,
                                        entity: 1,
                                        entityId: 1,
                                        name: 1,
                                        display: 1,
                                    },
                                    filter: {
                                        entity: source,
                                        entityId: {
                                            $exists: false,
                                        },
                                    },
                                })];
                        case 1:
                            relations = (_b.sent()).data;
                            this.setState({
                                relations: relations,
                                actions: actions,
                            });
                            return [2 /*return*/];
                    }
                });
            });
        }
    }
});
