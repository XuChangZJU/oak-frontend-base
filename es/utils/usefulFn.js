import { assert } from 'oak-domain/lib/utils/assert';
import { judgeRelation } from 'oak-domain/lib/store/relation';
import { get } from 'oak-domain/lib/utils/lodash';
import dayjs from 'dayjs';
import { ThousandCont } from 'oak-domain/lib/utils/money';
const tableWidthMap = {
    1: 120,
    2: 200,
    3: 300,
    4: 400,
};
export function getAttributes(attributes) {
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
export function resolvePath(dataSchema, entity, path) {
    assert(!path.includes('['), '数组索引不需要携带[],请使用arr.0.value');
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
        const relation = judgeRelation(dataSchema, _entity, attr, true);
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
// 强制类型
function isAttrbuteType(attribute) {
    return attribute;
}
export function getLinkUrl(attribute, props) {
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
// 以下几个get方法只需要两个参数attribute和一个解析path对象，只是后者类型还没定义
export function getPath(attribute) {
    if (typeof attribute === 'string') {
        return attribute;
    }
    return attribute.path;
}
export function getLabel(attribute, entity, attr, t) {
    if (isAttrbuteType(attribute).label) {
        return isAttrbuteType(attribute).label;
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
// 目前width属性可以是undefined，只有特殊type或用户自定义才有值，这样其余attr属性可以自适应
export function getWidth(attribute, attrType) {
    let width;
    if (attrType === 'enum') {
        width = 120;
    }
    if (isAttrbuteType(attribute).width) {
        width = isAttrbuteType(attribute).width;
    }
    if (isAttrbuteType(attribute).span) {
        width = tableWidthMap[isAttrbuteType(attribute).span];
    }
    return width;
}
export function getValue(data, path, entity, attr, attrType, t) {
    let value = get(data, path);
    // 枚举类型还要通过i18转一下中文
    if (attrType === 'enum' && value) {
        value = t(`${entity}:v.${attr}.${value}`, {});
    }
    // 如果是dateTime
    if (attrType === 'datetime' && value) {
        value = dayjs(value).format('YYYY-MM-DD HH:mm');
    }
    if (attrType === 'boolean' && typeof value === 'boolean') {
        value = t(`common::${String(value)}`, {
            '#oakModule': 'oak-frontend-base',
        });
    }
    if (attrType === 'money' && typeof value === 'number') {
        value = ThousandCont(value);
    }
    return value;
}
export function getAlign(attrType) {
    const rightType = [
        'float',
        'int',
        'bigint',
        'decimal',
        'money',
    ];
    if (rightType.includes(attrType)) {
        return 'right';
    }
    return 'left';
}
export function getFixed(attribute) {
    if (typeof attribute?.fixed === 'function') {
        return undefined;
    }
    return attribute?.fixed;
}
export function getType(attribute, attrType) {
    let type = attrType;
    if (isAttrbuteType(attribute).type) {
        type = isAttrbuteType(attribute).type;
    }
    return type;
}
function getLabelI18(dataSchema, entity, path, t) {
    const { attr, entity: entityI8n } = resolvePath(dataSchema, entity, path);
    return t(`${entityI8n}:attr.${attr}`, {});
}
export function makeDataTransformer(dataSchema, entity, attrDefs, t, colorDict) {
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
        const value = get(data, path);
        return {
            value,
            ...ele,
        };
    });
}
export function analyzeDataUpsertTransformer(dataSchema, entity, attrUpsertDefs) {
    let geoDef = undefined;
    const makeNativeFixedPart = (attr, def) => {
        const attrDef = dataSchema[entity].attributes[attr]; // upsert应该不会涉及createAt这些内置属性
        const { type, notNull: required, default: defaultValue, enumeration, params, } = attrDef;
        assert(type !== 'ref');
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
            const rel = judgeRelation(dataSchema, entity, ele);
            assert(rel === 1);
            return makeNativeFixedPart(ele);
        }
        else if (typeof ele === 'object' && ele.type === 'geo') {
            assert(!geoDef, '只能定义一个geo渲染对象');
            geoDef = ele;
        }
        else {
            const { attr, ...rest } = ele;
            const rel = judgeRelation(dataSchema, entity, attr);
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
export function translateAttributes(dataSchema, entity, attributes) {
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
export function analyzeAttrMobileForCard(dataSchema, entity, t, attributes) {
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
