"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var assert_1 = tslib_1.__importDefault(require("assert"));
var lodash_1 = require("oak-domain/lib/utils/lodash");
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
                if (!actions || actions.length === 0) {
                    return {
                        destEntity: entity,
                    };
                }
                else {
                    return {
                        destEntity: entity,
                        deActions: {
                            $overlaps: actions,
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
    formData: function (_a) {
        var _this = this;
        var data = _a.data;
        var entity = this.props.entity;
        var cascadeEntities = this.features.relationAuth.getCascadeActionAuths(entity, true);
        var cascadeEntityActions = cascadeEntities.map(function (ele) {
            var _a = tslib_1.__read(ele, 3), de = _a[0], p = _a[1], se = _a[2];
            var actionAuths = data === null || data === void 0 ? void 0 : data.filter(function (ele) { return ele.path === p && ele.destEntity === de; });
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
    methods: {
        onChange: function (checked, relationId, path, actionAuth) {
            var actions = this.props.actions;
            (0, assert_1.default)(actions && actions.length > 0);
            if (actionAuth) {
                var deActions_1 = actionAuth.deActions;
                if (checked) {
                    var deActions2 = (0, lodash_1.union)(deActions_1, actions);
                    this.updateItem({
                        deActions: deActions2,
                    }, actionAuth.id);
                }
                else {
                    actions.forEach(function (action) { return (0, lodash_1.pull)(deActions_1, action); });
                    this.updateItem({
                        deActions: deActions_1,
                    }, actionAuth.id);
                }
            }
            else {
                // 新增actionAuth
                (0, assert_1.default)(checked);
                this.addItem({
                    path: path,
                    relationId: relationId,
                    destEntity: this.props.entity,
                    deActions: actions,
                });
            }
        },
        confirm: function () {
            this.execute();
        },
    }
});
