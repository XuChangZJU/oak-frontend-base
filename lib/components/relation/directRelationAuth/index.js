"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
// attention! 这个组件没有测试过，因为jichuang项目没有存在directRelationAuth的entity. by Xc 2023.05.06
var assert_1 = tslib_1.__importDefault(require("assert"));
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
        onChange: function (checked, path, directRelationAuth) {
            if (checked) {
                if (directRelationAuth) {
                    (0, assert_1.default)(directRelationAuth.$$deleteAt$$);
                    this.recoverItem(directRelationAuth.id);
                }
                else {
                    this.addItem({
                        path: path[1],
                        destRelationId: this.props.relationId,
                    });
                }
            }
            else {
                (0, assert_1.default)(directRelationAuth && !directRelationAuth.$$deleteAt$$);
                this.removeItem(directRelationAuth.id);
            }
        },
        confirm: function () {
            this.execute();
        },
    }
});
