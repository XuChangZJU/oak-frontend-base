"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = require("oak-domain/lib/utils/assert");
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
                (0, assert_1.assert)(ele.entityId === _this.props.entityId);
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
                        $or: [
                            {
                                entityId: {
                                    $exists: false,
                                },
                            },
                            {
                                entityId: entityId,
                            },
                        ],
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
            },
        },
    ],
    properties: {
        entity: '',
        entityId: '',
    },
    features: ['relationAuth'],
    methods: {
        onActionClicked: function (id, entity) {
            this.features.navigator.navigateTo({
                url: '/relation/actionAuthBySource',
            }, {
                relationId: id,
                entity: entity,
            });
        },
        onRelationClicked: function (id, entity) {
            this.features.navigator.navigateTo({
                url: '/relation/relationAuthBySource',
            }, {
                relationId: id,
                entity: entity,
            });
        },
    },
});