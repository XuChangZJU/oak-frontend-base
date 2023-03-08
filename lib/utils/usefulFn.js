"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolutionPath = exports.getAttributes = void 0;
var tslib_1 = require("tslib");
var assert_1 = tslib_1.__importDefault(require("assert"));
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
    var _entity = entity;
    var attr;
    (0, assert_1.default)(!path.includes('['), '数组索引不需要携带[],请使用arr.0.value');
    if (!dataSchema) {
        return {
            entity: _entity,
            attr: '',
            attribute: undefined,
        };
    }
    if (!path.includes('.')) {
        attr = path;
    }
    else {
        var strs = path.split('.');
        // 最后一个肯定是属性
        attr = strs.pop();
        // 倒数第二个可能是类名可能是索引
        _entity = strs.pop();
        // 判断是否是数组索引
        if (!Number.isNaN(Number(_entity))) {
            _entity = strs.pop().split('$')[0];
        }
    }
    var attributes = getAttributes(dataSchema[_entity].attributes);
    var attribute = attributes[attr];
    return {
        entity: _entity,
        attr: attr,
        attribute: attribute,
    };
}
exports.resolutionPath = resolutionPath;
