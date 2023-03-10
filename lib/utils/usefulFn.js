"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeAttrDefForTable = exports.makeDataTransformer = exports.resolvePath = exports.getAttributes = void 0;
var tslib_1 = require("tslib");
var assert_1 = tslib_1.__importDefault(require("assert"));
var relation_1 = require("oak-domain/lib/store/relation");
var lodash_1 = require("oak-domain/lib/utils/lodash");
var dayjs_1 = tslib_1.__importDefault(require("dayjs"));
var tableWidthMap = {
    1: 100,
    2: 200,
    3: 300,
    4: 400
};
function getAttributes(attributes) {
    return Object.assign({}, attributes, {
        id: {
            type: 'char',
            params: {
                length: 36,
            },
        },
        $$createAt$$: {
            type: 'datetime',
        },
        $$updateAt$$: {
            type: 'datetime',
        },
        $$deleteAt$$: {
            type: 'datetime',
        },
        $$seq$$: {
            type: 'varchar',
        },
    });
}
exports.getAttributes = getAttributes;
function resolvePath(dataSchema, entity, path) {
    (0, assert_1.default)(!path.includes('['), '数组索引不需要携带[],请使用arr.0.value');
    var attrs = path.split('.');
    var idx = 0;
    var _entity = entity;
    var attr;
    var attrType;
    var attribute;
    while (idx <= attrs.length - 1) {
        attr = attrs[idx];
        if (!isNaN(parseInt(attr))) {
            idx++;
            continue;
        }
        var relation = (0, relation_1.judgeRelation)(dataSchema, _entity, attr);
        if (relation === 1) {
            var attributes = getAttributes(dataSchema[_entity].attributes);
            attribute = attributes[attr];
            attrType = attribute.type;
            if (attrType === 'ref') {
                attr = attribute.ref;
            }
        }
        else if (relation === 2) {
            // entity entityId
            _entity = attr;
        }
        else if (typeof relation === 'string') {
            _entity = relation;
        }
        idx++;
    }
    return {
        entity: _entity,
        attr: attr,
        attrType: attrType,
        attribute: attribute,
    };
}
exports.resolvePath = resolvePath;
// 强制类型
function isAttrbuteType(attribute) {
    return attribute;
}
// 以下几个get方法只需要两个参数attribute和一个解析path对象，只是后者类型还没定义
function getPath(attribute) {
    if (typeof attribute === 'string') {
        return attribute;
    }
    return attribute.path;
}
function getLabel(attribute, entity, attr, t) {
    var label = t("".concat(entity, ":attr.").concat(attr));
    if (isAttrbuteType(attribute).label) {
        label = isAttrbuteType(attribute).label;
    }
    return label;
}
// 目前width属性可以是undefined，只有特殊type或用户自定义才有值，这样其余attr属性可以自适应
function getWidth(attribute, attrType, useFor) {
    var width;
    if (attrType === 'enum' && useFor === 'table') {
        width = 1;
    }
    if (isAttrbuteType(attribute).width) {
        width = isAttrbuteType(attribute).width;
    }
    if (width && useFor === 'table') {
        width = tableWidthMap[width];
    }
    return width;
}
function getValue(attribute, data, path, entity, attr, attrType, t) {
    var value = (0, lodash_1.get)(data, path);
    // 枚举类型还要通过i18转一下中文
    if (attrType === 'enum' && value) {
        value = t("".concat(entity, ":v.").concat(attr, ".").concat(value));
    }
    // 如果是dateTime
    if (attrType === 'dateTime' && value) {
        value = (0, dayjs_1.default)(value).format("YYYY-MM-DD HH:mm");
    }
    if (isAttrbuteType(attribute).value) {
        value = isAttrbuteType(attribute).value;
    }
    return value;
}
function getType(attribute, attrType) {
    var type = 'text';
    if (attrType === 'enum') {
        type = 'tag';
    }
    if (isAttrbuteType(attribute).type) {
        type = isAttrbuteType(attrType).type;
    }
    return type;
}
function getLabelI18(dataSchema, entity, path, t) {
    var _a = resolvePath(dataSchema, entity, path), attr = _a.attr, entityI8n = _a.entity;
    return t("".concat(entityI8n, ":attr.").concat(attr));
}
function makeDataTransformer(dataSchema, entity, attrDefs, t, colorDict) {
    var transformerFixedPart = attrDefs.map(function (ele) {
        if (typeof ele === 'string') {
            var path = ele;
            var _a = resolvePath(dataSchema, entity, path), attrType = _a.attrType, attr = _a.attr, attribute = _a.attribute, entityI8n = _a.entity;
            var label = t("".concat(entityI8n, ":attr.").concat(attr));
            var type = attrType;
            var ref = attribute.ref;
            var required = attribute.notNull;
            var defaultValue = attribute.default;
            var enumeration = attribute.enumeration;
            var params = attribute.params;
            return {
                path: path,
                label: label,
                type: type,
                ref: ref,
                required: required,
                defaultValue: defaultValue,
                enumeration: enumeration,
                params: params,
            };
        }
        else {
            var path = ele.path, label = ele.label, width = ele.width, type = ele.type;
            return {
                path: path,
                label: label,
                width: width,
                type: type || 'varchar',
            };
        }
    });
    return function (data) { return transformerFixedPart.map(function (ele) {
        var path = ele.path;
        var value = (0, lodash_1.get)(data, path);
        return tslib_1.__assign({ value: value }, ele);
    }); };
}
exports.makeDataTransformer = makeDataTransformer;
function analyzeAttrDefForTable(dataSchema, entity, attrDefs, t, mobileAttrDef, colorDict) {
    // web使用
    var columnDef = attrDefs.map(function (ele) {
        var path = getPath(ele);
        var _a = resolvePath(dataSchema, entity, path), attrType = _a.attrType, attr = _a.attr, attribute = _a.attribute, entityI8n = _a.entity;
        var title = getLabel(ele, entity, attr, t);
        var width = getWidth(ele, attrType, "table");
        var type = getType(ele, attrType);
        return {
            title: title,
            width: width,
            type: type,
            path: path,
            entity: entityI8n,
            attr: attr,
        };
    });
    // 移动端使用
    var dataConverter;
    if (mobileAttrDef) {
        dataConverter = function (data) {
            var coverData = data.map(function (row) {
                var title = (0, lodash_1.get)(row, mobileAttrDef.titlePath);
                var rows = mobileAttrDef.rowsPath.map(function (attribute) {
                    var path = getPath(attribute);
                    var _a = resolvePath(dataSchema, entity, path), attrType = _a.attrType, attr = _a.attr, entityI8n = _a.entity;
                    var label = getLabel(attribute, entity, attr, t);
                    var value = getValue(attribute, row, path, entity, attr, attrType, t);
                    var color = 'black';
                    if (attrType === 'enum') {
                        if (colorDict) {
                            color = colorDict[entityI8n][attr][value];
                        }
                    }
                    return {
                        label: label,
                        value: value,
                        color: color,
                    };
                });
                return {
                    title: title,
                    rows: rows,
                    iState: mobileAttrDef.statePath && (0, lodash_1.get)(row, mobileAttrDef.statePath)
                };
            });
            return coverData;
        };
    }
    return {
        columnDef: columnDef,
        converter: dataConverter,
    };
}
exports.analyzeAttrDefForTable = analyzeAttrDefForTable;
