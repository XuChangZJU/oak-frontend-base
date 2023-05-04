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
    },
    filters: [
        {
            filter: function () {
                var entity = this.props.entity;
                var action = this.state.action;
                (0, assert_1.default)(entity);
                if (!action) {
                    return {
                        destEntity: entity,
                    };
                }
                else {
                    return {
                        destEntity: entity,
                        deActions: {
                            $contains: action,
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
    data: {
        action: '',
    },
    formData: function (_a) {
        var _this = this;
        var data = _a.data;
        var entity = this.props.entity;
        var actions = this.features.relationAuth.getActions(entity);
        var cascadeEntities = this.features.relationAuth.getCascadeActionEntities(entity);
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
            actions: actions,
            cascadeEntityActions: cascadeEntityActions,
        };
    },
    lifetimes: {
        ready: function () {
            var entity = this.props.entity;
            var cascadeEntities = this.features.relationAuth.getCascadeActionEntities(entity);
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
        onChange: function (actions, path, actionAuth) {
        },
        confirm: function () {
            this.execute();
        },
        onActionSelected: function (action) {
            this.setState({
                action: action,
            });
            // 不用refresh，所有destEntity等同于entity的行都已经被取出来了
            // this.refresh();
            this.reRender();
        }
    }
});
