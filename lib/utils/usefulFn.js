"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeAttrMobileForCard = exports.translateAttributes = exports.analyzeDataUpsertTransformer = exports.makeDataTransformer = exports.getType = exports.getFixed = exports.getAlign = exports.getValue = exports.getWidth = exports.getLabel = exports.getPath = exports.getLinkUrl = exports.resolvePath = exports.getAttributes = void 0;
const tslib_1 = require("tslib");
const assert_1 = require("oak-domain/lib/utils/assert");
const relation_1 = require("oak-domain/lib/store/relation");
const lodash_1 = require("oak-domain/lib/utils/lodash");
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const money_1 = require("oak-domain/lib/utils/money");
const tableWidthMap = {
    1: 120,
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
    (0, assert_1.assert)(!path.includes('['), '数组索引不需要携带[],请使用arr.0.value');
    const attrs = path.split('.');
    let idx = 0;
    let _entity = entity;
    let attr = path;
    let attrType = undefined;
    let attribute = undefined;
    while (idx <= attrs.length - 1) {
        attr = attrs[idx];
        if (!isNaN(parseInt(attr))) {
            idx++;
            continue;
        }
        const relation = (0, relation_1.judgeRelation)(dataSchema, _entity, attr, true);
        if (relation === 1) {
            const attributes = getAttributes(dataSchema[_entity].attributes);
            attribute = attributes[attr];
            attrType = attribute.type;
            if (attr === 'id') {
                attrType = 'ref';
            }
            else {
                if (attrType === 'ref') {
                    attr = attribute.ref;
                }
            }
        }
        else if (relation === 2) {
            // entity entityId
            if (attr === 'entityId') {
                attrType = 'ref';
            }
            _entity = attr;
        }
        else if (typeof relation === 'string') {
            _entity = relation;
        }
        idx++;
    }
    return {
        entity: _entity,
        attr,
        attrType,
        attribute,
    };
}
exports.resolvePath = resolvePath;
// 强制类型
function isAttributeType(attribute) {
    return attribute;
}
function getLinkUrl(attribute, props) {
    if (typeof attribute === 'string') {
        return '';
    }
    let href = attribute.linkUrl || '';
    const searchParams = [];
    Object.keys(props).forEach((ele) => {
        searchParams.push(`${ele}=${props[ele]}`);
    });
    if (!href.includes('?')) {
        href += '?';
    }
    href += searchParams.join('&');
    return href;
}
exports.getLinkUrl = getLinkUrl;
// 以下几个get方法只需要两个参数attribute和一个解析path对象，只是后者类型还没定义
function getPath(attribute) {
    if (typeof attribute === 'string') {
        return attribute;
    }
    return attribute.path;
}
exports.getPath = getPath;
function getLabel(attribute, entity, attr, t) {
    if (isAttributeType(attribute).label) {
        return isAttributeType(attribute).label;
    }
    if (attr === '$$createAt$$' ||
        attr === '$$updateAt$$' ||
        attr === '$$deleteAt$$' ||
        attr === '$$seq$$') {
        return t(`common::${attr}`, {
            '#oakModule': 'oak-frontend-base',
        });
    }
    if (attr === 'id') {
        return 'id';
    }
    return t(`${entity}:attr.${attr}`, {});
}
exports.getLabel = getLabel;
// 目前width属性可以是undefined，只有特殊type或用户自定义才有值，这样其余attr属性可以自适应
function getWidth(attribute, attrType) {
    let width;
    if (isAttributeType(attribute).width) {
        width = isAttributeType(attribute).width;
        return width;
    }
    if (attrType === 'enum') {
        width = 120;
    }
    if (isAttributeType(attribute).span) {
        width = tableWidthMap[isAttributeType(attribute).span];
    }
    return width;
}
exports.getWidth = getWidth;
function getValue(data, path, entity, attr, attrType, t) {
    let value = (0, lodash_1.get)(data, path);
    // 枚举类型还要通过i18转一下中文
    if (attrType === 'enum' && value) {
        value = t(`${entity}:v.${attr}.${value}`, {});
    }
    // 如果是dateTime
    if (attrType === 'datetime' && value) {
        value = (0, dayjs_1.default)(value).format('YYYY-MM-DD HH:mm');
    }
    if (attrType === 'boolean' && typeof value === 'boolean') {
        value = t(`common::${String(value)}`, {
            '#oakModule': 'oak-frontend-base',
        });
    }
    if (attrType === 'money' && typeof value === 'number') {
        value = (0, money_1.ThousandCont)(value);
    }
    return value;
}
exports.getValue = getValue;
function getAlign(attribute) {
    return isAttributeType(attribute).align || 'left';
}
exports.getAlign = getAlign;
function getFixed(attribute) {
    return isAttributeType(attribute).fixed;
}
exports.getFixed = getFixed;
function getType(attribute, attrType) {
    let type = attrType;
    if (isAttributeType(attribute).type) {
        type = isAttributeType(attribute).type;
    }
    return type;
}
exports.getType = getType;
function getLabelI18(dataSchema, entity, path, t) {
    const { attr, entity: entityI8n } = resolvePath(dataSchema, entity, path);
    return t(`${entityI8n}:attr.${attr}`, {});
}
function makeDataTransformer(dataSchema, entity, attrDefs, t, colorDict) {
    const transformerFixedPart = attrDefs.map((ele) => {
        if (typeof ele === 'string') {
            const path = ele;
            const { attrType, attr, entity: entityI8n, } = resolvePath(dataSchema, entity, path);
            const label = getLabel(ele, entityI8n, attr, t);
            const type = attrType;
            return {
                path,
                label,
                type,
                attr,
            };
        }
        else {
            const { path, label, width, type } = ele;
            return {
                path,
                label,
                width,
                type: type || 'varchar',
            };
        }
    });
    return (data) => transformerFixedPart.map((ele) => {
        const { path } = ele;
        const value = (0, lodash_1.get)(data, path);
        return {
            value,
            ...ele,
        };
    });
}
exports.makeDataTransformer = makeDataTransformer;
function analyzeDataUpsertTransformer(dataSchema, entity, attrUpsertDefs) {
    let geoDef = undefined;
    const makeNativeFixedPart = (attr, def) => {
        const attrDef = dataSchema[entity].attributes[attr]; // upsert应该不会涉及createAt这些内置属性
        const { type, notNull: required, default: defaultValue, enumeration, params, } = attrDef;
        (0, assert_1.assert)(type !== 'ref');
        return {
            attr,
            type: type,
            required,
            defaultValue: def?.hasOwnProperty('defaultValue')
                ? def.defaultValue
                : defaultValue,
            enumeration: enumeration?.map((ele) => ({
                value: ele,
                label: `${entity}:v.${attr}.${ele}`,
            })),
            min: typeof def?.min === 'number' ? def.min : params?.min,
            max: typeof def?.max === 'number' ? def.max : params?.max,
            maxLength: typeof def?.maxLength === 'number'
                ? def.maxLength
                : params?.length,
            get: (data) => data && data[attr],
        };
    };
    const transformerFixedPart = attrUpsertDefs
        .map((ele) => {
        if (typeof ele === 'string') {
            const rel = (0, relation_1.judgeRelation)(dataSchema, entity, ele);
            (0, assert_1.assert)(rel === 1);
            return makeNativeFixedPart(ele);
        }
        else if (typeof ele === 'object' && ele.type === 'geo') {
            (0, assert_1.assert)(!geoDef, '只能定义一个geo渲染对象');
            geoDef = ele;
        }
        else {
            const { attr, ...rest } = ele;
            const rel = (0, relation_1.judgeRelation)(dataSchema, entity, attr);
            if (rel === 1) {
                const fixedPart = makeNativeFixedPart(attr, ele);
                return Object.assign(fixedPart, {
                    ...rest,
                });
            }
            const origAttr = rel === 2 ? 'entityId' : `${attr}Id`;
            return {
                required: !!dataSchema[entity].attributes[origAttr].notNull,
                ...rest,
                get: (data) => data && data[origAttr],
                attr: origAttr,
            };
        }
    })
        .filter((ele) => !!ele);
    if (geoDef) {
        // 暂时只放出poiName和coordinate
        const { type, attributes, ...rest } = geoDef;
        let attr = attributes?.coordinate || 'coordinate';
        transformerFixedPart.push(Object.assign(makeNativeFixedPart(attr), {
            type: 'coordinate',
            extra: attributes,
        }));
        attr = attributes?.poiName || 'poiName';
        transformerFixedPart.push(Object.assign(makeNativeFixedPart(attr), {
            type: 'poiName',
            ...rest,
        }));
    }
    return (data) => transformerFixedPart.map((ele) => {
        const { get } = ele;
        const value = get(data);
        return {
            value,
            ...ele,
        };
    });
}
exports.analyzeDataUpsertTransformer = analyzeDataUpsertTransformer;
function translateAttributes(dataSchema, entity, attributes) {
    const judgeAttributes = attributes.map((ele) => {
        const path = getPath(ele);
        const { attrType, attr, entity: entityI8n, } = resolvePath(dataSchema, entity, path);
        return {
            path,
            attrType,
            attr,
            attribute: ele,
            entity: entityI8n,
        };
    });
    return judgeAttributes;
}
exports.translateAttributes = translateAttributes;
function analyzeAttrMobileForCard(dataSchema, entity, t, attributes) {
    return (data) => {
        // 遍历用户传入的数据源
        const coverData = data.map((row) => {
            const rows = attributes.map((attribute) => {
                const path = getPath(attribute);
                const { attrType, attr, entity: entityI8n, } = resolvePath(dataSchema, entity, path);
                const label = getLabel(attribute, entityI8n, attr, t);
                const value = getValue(row, path, entityI8n, attr, attrType, t);
                const type = getType(attribute, attrType);
                return {
                    label,
                    value,
                    type,
                };
            });
            return {
                data: rows,
                record: row,
            };
        });
        return coverData;
    };
}
exports.analyzeAttrMobileForCard = analyzeAttrMobileForCard;
