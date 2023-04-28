"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var assert_1 = tslib_1.__importDefault(require("assert"));
exports.default = OakComponent({
    entity: 'relation',
    isList: true,
    projection: {
        id: 1,
        name: 1,
        display: 1,
        entity: 1,
        entityId: 1,
    },
    formData: function (_a) {
        var _this = this;
        var _b = _a.data, data = _b === void 0 ? [] : _b;
        // 根据设计，这里如果同一个entity上同时存在有entityId和没有entityId的，则隐藏掉没有entityId的行
        var relations = data.filter(function (ele) { return !!ele.entityId; });
        data.forEach(function (ele) {
            if (!ele.entityId) {
                if (!relations.find(function (ele2) { return ele2.entity === ele.entity && ele2.entityId; })) {
                    relations.push(ele);
                }
            }
            else {
                (0, assert_1.default)(ele.entityId === _this.props.entityId);
            }
        });
        var hasRelationEntites = this.features.relationAuth.getHasRelationEntities();
        return {
            relations: relations,
            hasRelationEntites: hasRelationEntites,
        };
    },
    filters: [
        {
            filter: function () {
                var _a = this.props, entity = _a.entity, entityId = _a.entityId;
                var filter = {};
                if (entity) {
                    Object.assign(filter, { entity: entity });
                }
                if (entityId) {
                    Object.assign(filter, {
                        $or: [{
                                entityId: {
                                    $exists: false,
                                },
                            }, {
                                entityId: entityId,
                            }]
                    });
                }
                else {
                    Object.assign(filter, {
                        entityId: {
                            $exists: false,
                        },
                    });
                }
                return filter;
            }
        }
    ],
    properties: {
        entity: '',
        entityId: '',
        onActionClicked: function (id, entity) { return undefined; },
        onRelationClicked: function (id, entity) { return undefined; },
    },
    features: ['relationAuth'],
});
