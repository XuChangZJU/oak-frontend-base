"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var assert_1 = tslib_1.__importDefault(require("assert"));
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
        relationId: '',
        entity: '',
    },
    filters: [
        {
            filter: function () {
                var relationId = this.props.relationId;
                (0, assert_1.default)(relationId);
                return {
                    relationId: relationId,
                };
            }
        }
    ],
    pagination: {
        pageSize: 1000,
        currentPage: 0,
    },
    formData: function (_a) {
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
        var cascadeEntities = this.features.relationAuth.getCascadeActionEntitiesBySource(entity);
        var cascadeEntityActions = cascadeEntities.map(function (ele) {
            var path = ele.path;
            var cascadePath = path[1];
            var actionAuth = data === null || data === void 0 ? void 0 : data.find(function (ele) { return ele.path === cascadePath && ele.destEntity === path[0]; });
            return tslib_1.__assign({ actionAuth: actionAuth }, ele);
        });
        return {
            relationName: name,
            cascadeEntityActions: cascadeEntityActions,
        };
    },
    methods: {
        onChange: function (actions, path, actionAuth) {
            if (actionAuth) {
                this.updateItem({
                    deActions: actions,
                }, actionAuth.id);
            }
            else {
                this.addItem({
                    relationId: this.props.relationId,
                    path: path[1],
                    destEntity: path[0],
                    deActions: actions,
                });
            }
        },
        confirm: function () {
            this.execute();
        }
    }
});
