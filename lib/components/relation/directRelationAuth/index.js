"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
// attention! 这个组件没有测试过，因为jichuang项目没有存在directRelationAuth的entity. by Xc 2023.05.06
var assert_1 = tslib_1.__importDefault(require("assert"));
var lodash_1 = require("oak-domain/lib/utils/lodash");
exports.default = OakComponent({
    entity: 'directRelationAuth',
    isList: true,
    projection: {
        id: 1,
        path: 1,
        destRelationId: 1,
    },
    properties: {
        entity: '',
        relationIds: [],
    },
    filters: [
        {
            filter: function () {
                var _a = this.props, entity = _a.entity, relationIds = _a.relationIds;
                if (relationIds && relationIds.length > 0) {
                    return {
                        destRelationId: {
                            $in: relationIds,
                        },
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
    formData: function (_a) {
        var data = _a.data;
        var entity = this.props.entity;
        var auths = this.features.relationAuth.getCascadeRelationAuths(entity, false);
        return {
            auths: auths,
            directRelationAuths: data,
        };
    },
    methods: {
        onChange: function (checked, path, directRelationAuths) {
            var _this = this;
            var relationIds = this.props.relationIds;
            (0, assert_1.default)(relationIds);
            if (checked) {
                if (directRelationAuths) {
                    var includedRelationIds_1 = [];
                    directRelationAuths.forEach(function (dra) {
                        if (dra.$$deleteAt$$) {
                            _this.recoverItem(dra.id);
                        }
                        includedRelationIds_1.push(dra.destRelationId);
                    });
                    var restRelationIds = (0, lodash_1.difference)(relationIds, includedRelationIds_1);
                    restRelationIds.forEach(function (relationId) { return _this.addItem({
                        path: path[1],
                        destRelationId: relationId,
                    }); });
                }
                else {
                    relationIds.forEach(function (relationId) { return _this.addItem({
                        path: path[1],
                        destRelationId: relationId,
                    }); });
                    ;
                }
            }
            else {
                (0, assert_1.default)(directRelationAuths && directRelationAuths.length > 0);
                directRelationAuths.forEach(function (dra) { return _this.removeItem(dra.id); });
            }
        },
        confirm: function () {
            this.execute();
        },
    }
});
