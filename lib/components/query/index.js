"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var relation_1 = require("oak-domain/lib/store/relation");
var utils_1 = require("./utils");
exports.default = OakComponent({
    entity: function () {
        var entity = this.props.entity;
        return entity;
    },
    isList: true,
    data: {
        open: false,
    },
    properties: {
        entity: String,
        column: Object,
    },
    methods: {
        getNamedFilter: function (name) {
            if (this.state.oakFullpath) {
                var filter = this.getFilterByName(name);
                return filter;
            }
        },
        getRefByAttr: function (entity, field) {
            if (!this.state.oakFullpath) {
                return;
            }
            var dataSchema = this.features.cache.getSchema();
            var attrs = field.split('.');
            var idx = 0;
            var _entity = entity;
            var attr;
            var attrType;
            var attribute;
            var entityI18n = entity;
            var attrI18n;
            while (idx <= attrs.length - 1) {
                attr = attrs[idx];
                attrI18n = attr;
                if (attr.startsWith('$text')) {
                    // 全文的话
                    attrType = '$text';
                }
                else {
                    var relation = (0, relation_1.judgeRelation)(dataSchema, _entity, attr);
                    if (relation === 1) {
                        var attributes = (0, utils_1.getAttributes)(dataSchema[_entity].attributes);
                        attribute = attributes[attr];
                        attrType = attribute.type;
                        if (attrType === 'ref') {
                            attrI18n = attribute.ref;
                        }
                    }
                    else if (relation === 2) {
                        // entity entityId
                        var ref = attr;
                        _entity = ref;
                        entityI18n = ref;
                    }
                    else if (typeof relation === 'string') {
                        var ref = relation;
                        _entity = ref;
                        entityI18n = ref;
                    }
                }
                idx++;
            }
            return {
                entity: _entity,
                attr: attr,
                attrType: attrType,
                entityI18n: entityI18n,
                attrI18n: attrI18n,
                attribute: attribute,
            };
        },
    },
});
