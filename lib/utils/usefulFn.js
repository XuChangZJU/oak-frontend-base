"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeAttrMobileForCard = exports.analyzeDataUpsertTransformer = exports.makeDataTransformer = exports.getType = exports.getValue = exports.getWidth = exports.getLabel = exports.getPath = exports.resolvePath = exports.getAttributes = void 0;
var tslib_1 = require("tslib");
var assert_1 = tslib_1.__importDefault(require("assert"));
var relation_1 = require("oak-domain/lib/store/relation");
var lodash_1 = require("oak-domain/lib/utils/lodash");
var dayjs_1 = tslib_1.__importDefault(require("dayjs"));
var tableWidthMap = {
    1: 140,
    2: 200,
    3: 300,
    4: 400,
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
exports.getPath = getPath;
function getLabel(attribute, entity, attr, t) {
    var label = t("".concat(entity, ":attr.").concat(attr));
    if (attr === '$$createAt$$' ||
        attr === '$$updateAt$$' ||
        attr === '$$deleteAt$$') {
        label = t("common:".concat(attr));
    }
    if (isAttrbuteType(attribute).label) {
        label = isAttrbuteType(attribute).label;
    }
    return label;
}
exports.getLabel = getLabel;
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
exports.getWidth = getWidth;
function getValue(attribute, data, path, entity, attr, attrType, t) {
    var value = (0, lodash_1.get)(data, path);
    // 枚举类型还要通过i18转一下中文
    if (attrType === 'enum' && value) {
        value = t("".concat(entity, ":v.").concat(attr, ".").concat(value));
    }
    // 如果是dateTime
    if (attrType === 'datetime' && value) {
        value = (0, dayjs_1.default)(value).format('YYYY-MM-DD HH:mm');
    }
    if (isAttrbuteType(attribute).value) {
        value = isAttrbuteType(attribute).value;
    }
    return value;
}
exports.getValue = getValue;
function getType(attribute, attrType) {
    if (attrType === 'enum') {
        return 'tag';
    }
    if (attrType === 'datetime') {
        return 'datetime';
    }
    if (isAttrbuteType(attribute).type) {
        return isAttrbuteType(attrType).type;
    }
    return attrType;
}
exports.getType = getType;
function getLabelI18(dataSchema, entity, path, t) {
    var _a = resolvePath(dataSchema, entity, path), attr = _a.attr, entityI8n = _a.entity;
    return t("".concat(entityI8n, ":attr.").concat(attr));
}
function makeDataTransformer(dataSchema, entity, attrDefs, 
// t: (k: string, params?: object) => string,
colorDict) {
    var transformerFixedPart = attrDefs.map(function (ele) {
        if (typeof ele === 'string') {
            var path = ele;
            var _a = resolvePath(dataSchema, entity, path), attrType = _a.attrType, attr = _a.attr, attribute = _a.attribute, entityI8n = _a.entity;
            var label = "".concat(entityI8n, ":attr.").concat(attr);
            var type = attrType;
            return {
                path: path,
                label: label,
                type: type,
                attr: attr,
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
    return function (data) {
        return transformerFixedPart.map(function (ele) {
            var path = ele.path;
            var value = (0, lodash_1.get)(data, path);
            return tslib_1.__assign({ value: value }, ele);
        });
    };
}
exports.makeDataTransformer = makeDataTransformer;
function analyzeDataUpsertTransformer(dataSchema, entity, attrUpsertDefs) {
    var geoDef = undefined;
    var makeNativeFixedPart = function (attr, def) {
        var attrDef = dataSchema[entity].attributes[attr]; // upsert应该不会涉及createAt这些内置属性
        var type = attrDef.type, required = attrDef.notNull, defaultValue = attrDef.default, enumeration = attrDef.enumeration, params = attrDef.params;
        (0, assert_1.default)(type !== 'ref');
        return {
            attr: attr,
            type: type,
            required: required,
            defaultValue: (def === null || def === void 0 ? void 0 : def.hasOwnProperty('defaultValue'))
                ? def.defaultValue
                : defaultValue,
            enumeration: enumeration === null || enumeration === void 0 ? void 0 : enumeration.map(function (ele) { return ({
                value: ele,
                label: "".concat(entity, ":v.").concat(attr, ".").concat(ele),
            }); }),
            min: typeof (def === null || def === void 0 ? void 0 : def.min) === 'number' ? def.min : params === null || params === void 0 ? void 0 : params.min,
            max: typeof (def === null || def === void 0 ? void 0 : def.max) === 'number' ? def.max : params === null || params === void 0 ? void 0 : params.max,
            maxLength: typeof (def === null || def === void 0 ? void 0 : def.maxLength) === 'number'
                ? def.maxLength
                : params === null || params === void 0 ? void 0 : params.length,
            get: function (data) { return data && data[attr]; },
        };
    };
    var transformerFixedPart = attrUpsertDefs
        .map(function (ele) {
        if (typeof ele === 'string') {
            var rel = (0, relation_1.judgeRelation)(dataSchema, entity, ele);
            (0, assert_1.default)(rel === 1);
            return makeNativeFixedPart(ele);
        }
        else if (ele.type === 'geo') {
            (0, assert_1.default)(!geoDef, '只能定义一个geo渲染对象');
            geoDef = ele;
        }
        else {
            var _a = ele, attr = _a.attr, rest = tslib_1.__rest(_a, ["attr"]);
            var rel = (0, relation_1.judgeRelation)(dataSchema, entity, attr);
            if (rel === 1) {
                var fixedPart = makeNativeFixedPart(attr, ele);
                return Object.assign(fixedPart, tslib_1.__assign({}, rest));
            }
            var origAttr_1 = rel === 2 ? 'entityId' : "".concat(attr, "Id");
            return tslib_1.__assign(tslib_1.__assign({ required: !!dataSchema[entity].attributes[origAttr_1].notNull }, rest), { get: function (data) { return data && data[origAttr_1]; }, attr: origAttr_1 });
        }
    })
        .filter(function (ele) { return !!ele; });
    if (geoDef) {
        // 暂时只放出poiName和coordinate
        var _a = geoDef, type = _a.type, attributes = _a.attributes, rest = tslib_1.__rest(_a, ["type", "attributes"]);
        var attr = (attributes === null || attributes === void 0 ? void 0 : attributes.coordinate) || 'coordinate';
        transformerFixedPart.push(Object.assign(makeNativeFixedPart(attr), {
            type: 'coordinate',
            extra: attributes,
        }));
        attr = (attributes === null || attributes === void 0 ? void 0 : attributes.poiName) || 'poiName';
        transformerFixedPart.push(Object.assign(makeNativeFixedPart(attr), tslib_1.__assign({ type: 'poiName' }, rest)));
    }
    return function (data) {
        return transformerFixedPart.map(function (ele) {
            var get = ele.get;
            var value = get(data);
            return tslib_1.__assign({ value: value }, ele);
        });
    };
}
exports.analyzeDataUpsertTransformer = analyzeDataUpsertTransformer;
function analyzeAttrMobileForCard(dataSchema, entity, t, mobileAttrDef, colorDict) {
    return function (data) {
        // 遍历用户传入的数据源
        var coverData = data.map(function (row) {
            var title = '';
            // title如果是path进行解析
            if (mobileAttrDef.title) {
                title =
                    typeof mobileAttrDef.title === 'string'
                        ? (0, lodash_1.get)(row, mobileAttrDef.title)
                        : mobileAttrDef.title;
            }
            // rows即卡片主体要渲染的数据
            (0, assert_1.default)(!!(mobileAttrDef.rows && mobileAttrDef.rows.length), 'attributeMb中的rows不能为空');
            var rows = mobileAttrDef.rows.map(function (attribute) {
                var path = getPath(attribute);
                var _a = resolvePath(dataSchema, entity, path), attrType = _a.attrType, attr = _a.attr, entityI8n = _a.entity;
                var label = getLabel(attribute, entity, attr, t);
                var value = getValue(attribute, row, path, entity, attr, attrType, t);
                return {
                    label: label,
                    value: value,
                };
            });
            // 处理state 卡片右上角的stateView要显示的内容
            var color = 'default';
            var state;
            if (mobileAttrDef.state &&
                typeof mobileAttrDef.state === 'string') {
                var _a = resolvePath(dataSchema, entity, mobileAttrDef.state), attr = _a.attr, entityI8n = _a.entity;
                var rowValue = (0, lodash_1.get)(row, mobileAttrDef.state);
                var value = t("".concat(String(entityI8n), ":v.").concat(attr, ".").concat(rowValue));
                if (colorDict) {
                    color = colorDict[entityI8n][attr][rowValue];
                }
                state = {
                    color: color,
                    value: value,
                };
            }
            else {
                state = mobileAttrDef.state;
            }
            return {
                title: title,
                rows: rows,
                state: state,
                record: row,
            };
        });
        return coverData;
    };
}
exports.analyzeAttrMobileForCard = analyzeAttrMobileForCard;
