"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeAttrDefForTable = exports.makeDataTransformer = exports.resolutionPath = exports.getAttributes = void 0;
var tslib_1 = require("tslib");
var assert_1 = tslib_1.__importDefault(require("assert"));
var relation_1 = require("oak-domain/lib/store/relation");
var lodash_1 = require("oak-domain/lib/utils/lodash");
function getAttributes(attributes) {
    return Object.assign({}, attributes, {
        id: {
            type: 'char',
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
            type: 'datetime',
        },
    });
}
exports.getAttributes = getAttributes;
function resolutionPath(dataSchema, entity, path) {
    (0, assert_1.default)(!path.includes('['), '数组索引不需要携带[],请使用arr.0.value');
    var attrs = path.split('.');
    var idx = 0;
    var _entity = entity;
    var attr;
    var attrType;
    var attribute;
    while (idx <= attrs.length - 1) {
        attr = attrs[idx];
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
exports.resolutionPath = resolutionPath;
function getLabelI18(dataSchema, entity, path, t) {
    var _a = resolutionPath(dataSchema, entity, path), attr = _a.attr, entityI8n = _a.entity;
    return t("".concat(entityI8n, ":attr.").concat(attr));
}
var tableWidthMap = {
    1: 100,
    2: 200,
    3: 300,
    4: 400
};
function makeDataTransformer(dataSchema, entity, attrDefs, t) {
    return function (data) {
        // 因为attrDefs里每一项可能是string可能是attrbute, 这里对其每一项进行判断，得到一个都是string类型得pathArr
        var renderArr = attrDefs.map(function (ele) {
            var path = typeof ele === 'string' ? ele : ele.path;
            var _a = resolutionPath(dataSchema, entity, path), attrType = _a.attrType, attr = _a.attr, attribute = _a.attribute, entityI8n = _a.entity;
            var label = t("".concat(entityI8n, ":attr.").concat(attr));
            var type = attrType;
            var value = (0, lodash_1.get)(data, path);
            if (typeof ele !== 'string' && ele.label) {
                label = ele.label;
            }
            if (typeof ele !== 'string' && ele.type) {
                type = ele.type;
            }
            var renderObj = {
                label: label,
                value: value,
                type: type,
                params: attribute.params,
            };
            if (typeof ele !== 'string' && ele.width) {
                Object.assign(ele, {
                    width: ele.width
                });
            }
            return renderObj;
        });
        return renderArr;
    };
}
exports.makeDataTransformer = makeDataTransformer;
function analyzeAttrDefForTable(dataSchema, entity, attrDefs, t, mobileAttrDef) {
    // web使用
    var columnDef = attrDefs.map(function (ele) {
        var path = typeof ele === 'string' ? ele : ele.path;
        var _a = resolutionPath(dataSchema, entity, path), attrType = _a.attrType, attr = _a.attr, attribute = _a.attribute, entityI8n = _a.entity;
        var title = t("".concat(entityI8n, ":attr.").concat(attr));
        var width = tableWidthMap[1];
        var renderType = 'text';
        // 枚举类型长度一般不超过200
        if (attrType === 'enum') {
            width = tableWidthMap[2];
            renderType = 'tag';
        }
        if (typeof ele !== 'string' && ele.label) {
            title = ele.label;
        }
        if (typeof ele !== 'string' && ele.type) {
            renderType = ele.type;
        }
        return {
            title: title,
            width: width,
            renderType: renderType,
        };
    });
    // 移动端使用
    var dataConverter;
    if (mobileAttrDef) {
        dataConverter = function (data) {
            var coverData = data.map(function (row) {
                var title = (0, lodash_1.get)(row, mobileAttrDef.titlePath);
                var rows = mobileAttrDef.rowsPath.map(function (attrbute) {
                    var label = typeof attrbute === 'string'
                        ? getLabelI18(dataSchema, entity, attrbute, t) : attrbute.label;
                    var path = typeof attrbute === 'string' ? attrbute : attrbute.path;
                    var value = (0, lodash_1.get)(row, path);
                    return {
                        label: label,
                        value: value,
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
