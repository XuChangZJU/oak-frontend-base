import assert from 'assert';
import { EntityDict } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import useFeatures from '../hooks/useFeatures';
import { StorageSchema, Attribute } from 'oak-domain/lib/types';
import { judgeRelation } from 'oak-domain/lib/store/relation';
import {
    OakAbsAttrDef,
    OakAbsAttrDef_Mobile,
    DataTransformer,
    DataConverter,
    ColumnDefProps,
    RenderWidth,
    AttrRender,
    OakAbsAttrUpsertDef,
    DataUpsertTransformer,
    AttrUpsertRender,
    OakAbsDerivedAttrDef,
    OakAbsRefAttrPickerDef,
} from '../types/AbstractComponent';
import { Attributes } from 'oak-domain/lib/types';
import { get } from 'oak-domain/lib/utils/lodash';
import {
    DataType,
    DataTypeParams,
} from 'oak-domain/lib/types/schema/DataTypes';
import { ColorDict } from 'oak-domain/lib/types/Style';
import dayjs from 'dayjs';

const tableWidthMap: Record<number, number> = {
    1: 100,
    2: 200,
    3: 300,
    4: 400,
};

export function getAttributes(attributes: Record<string, Attribute>) {
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
    }) as Record<string, Attribute>;
}

export function resolvePath<ED extends EntityDict & BaseEntityDict>(
    dataSchema: StorageSchema<ED>,
    entity: keyof ED,
    path: string
) {
    assert(!path.includes('['), '数组索引不需要携带[],请使用arr.0.value');
    const attrs = path.split('.');

    let idx = 0;
    let _entity = entity;
    let attr: string;
    let attrType: DataType | 'ref';
    let attribute: Attribute;
    while (idx <= attrs.length - 1) {
        attr = attrs[idx];
        if (!isNaN(parseInt(attr))) {
            idx++;
            continue;
        }
        const relation = judgeRelation(dataSchema, _entity, attr);
        if (relation === 1) {
            const attributes = getAttributes(dataSchema[_entity].attributes);
            attribute = attributes[attr];
            attrType = attribute.type;
            if (attrType === 'ref') {
                attr = attribute.ref as string;
            }
        } else if (relation === 2) {
            // entity entityId
            _entity = attr as keyof ED;
        } else if (typeof relation === 'string') {
            _entity = relation as keyof ED;
        }
        idx++;
    }

    return {
        entity: _entity,
        attr: attr!,
        attrType: attrType!,
        attribute: attribute!,
    };
}

// 强制类型
function isAttrbuteType(attribute: OakAbsAttrDef): OakAbsDerivedAttrDef {
    return attribute as OakAbsDerivedAttrDef;
}

// 以下几个get方法只需要两个参数attribute和一个解析path对象，只是后者类型还没定义
function getPath(attribute: OakAbsAttrDef) {
    if (typeof attribute === 'string') {
        return attribute;
    }
    return attribute.path;
}

function getLabel<ED extends EntityDict & BaseEntityDict>(
    attribute: OakAbsAttrDef,
    entity: keyof ED,
    attr: string,
    t: (k: string, params?: object) => string
) {
    let label = t(`${entity as string}:attr.${attr}`);
    if (isAttrbuteType(attribute).label) {
        label = isAttrbuteType(attribute).label;
    }
    return label;
}

// 目前width属性可以是undefined，只有特殊type或用户自定义才有值，这样其余attr属性可以自适应
function getWidth(
    attribute: OakAbsAttrDef,
    attrType: string,
    useFor: 'table' | 'other'
) {
    let width;
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

function getValue<ED extends EntityDict & BaseEntityDict>(
    attribute: OakAbsAttrDef,
    data: any,
    path: string,
    entity: keyof ED,
    attr: string,
    attrType: string,
    t: (k: string, params?: object) => string
) {
    let value = get(data, path);
    // 枚举类型还要通过i18转一下中文
    if (attrType === 'enum' && value) {
        value = t(`${entity as string}:v.${attr}.${value}`);
    }
    // 如果是dateTime
    if (attrType === 'dateTime' && value) {
        value = dayjs(value).format('YYYY-MM-DD HH:mm');
    }
    if (isAttrbuteType(attribute).value) {
        value = isAttrbuteType(attribute).value;
    }
    return value;
}

function getType(attribute: OakAbsAttrDef, attrType: string) {
    let type = 'text';
    if (attrType === 'enum') {
        type = 'tag';
    }
    if (isAttrbuteType(attribute).type) {
        type = isAttrbuteType(attrType).type as string;
    }
    return type as DataType & ('img' | 'file' | 'avatar');
}

function getLabelI18<ED extends EntityDict & BaseEntityDict>(
    dataSchema: StorageSchema<ED>,
    entity: keyof ED,
    path: string,
    t: (k: string, params?: object) => string
) {
    const { attr, entity: entityI8n } = resolvePath<ED>(
        dataSchema,
        entity,
        path
    );
    return t(`${entityI8n as string}:attr.${attr}`);
}

export function makeDataTransformer<ED extends EntityDict & BaseEntityDict>(dataSchema: StorageSchema<ED>, entity: string, attrDefs: OakAbsAttrDef[], t: (k: string, params?: object) => string, colorDict?: ColorDict<ED>): DataTransformer {
    const transformerFixedPart = attrDefs.map(
        (ele) => {
            if (typeof ele === 'string') {
                const path = ele;
                const { attrType, attr, attribute, entity: entityI8n } = resolvePath(dataSchema, entity, path);
                const label = t(`${entityI8n as string}:attr.${attr}`);
                const type = attrType;
                return {
                    path,
                    label,
                    type,
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
        }
    );
    return (data: any) =>
        transformerFixedPart.map((ele) => {
            const { path } = ele;
            const value = get(data, path);
            return {
                value,
                ...ele,
            } as AttrRender;
        });
}

export function analyzeDataUpsertTransformer<ED extends EntityDict & BaseEntityDict>(
    dataSchema: StorageSchema<ED>,
    entity: string,
    attrUpsertDefs: OakAbsAttrUpsertDef<ED>[],
    t: (k: string, params?: object) => string): DataUpsertTransformer<ED> {

    const otmPickerDict: Record<string, OakAbsRefAttrPickerDef<ED, keyof ED>> = {};

    const transformerFixedPart = attrUpsertDefs.map(
        (ele) => {
            if (typeof ele === 'string') {
                const rel = judgeRelation(dataSchema, entity, ele);
                assert(rel === 1);
                const attrDef = dataSchema[entity].attributes[ele]; // upsert应该不会涉及createAt这些内置属性
                const { type, notNull: required, default: defaultValue, enumeration, params } = attrDef;
                const label = t(`${entity}:attr.${ele}`);
                assert(type !== 'ref');
                return {
                    attr: ele,
                    label,
                    type,
                    required,
                    defaultValue,
                    enumeration,
                    params,
                    get: (data: Record<string, any>) => data[ele],
                };
            }
            else {
                const { attr, label, mode, projection, filter, title, count, allowNull } = ele;
                const rel = judgeRelation(dataSchema, entity, attr);
                assert(rel === 2 || rel === ele.entity);
                const refEntity = typeof rel === 'string' ? rel : attr;
                assert(!otmPickerDict[attr]);
                otmPickerDict[attr] = {
                    mode,
                    attr,
                    entity: refEntity as keyof ED,
                    projection,
                    title,
                    filter,
                    count,
                };
                return {
                    type: 'ref',
                    attr: typeof rel === 'string' ? `${attr}Id` : 'entityId',
                    mode,
                    get: (data: Record<string, any>) => title(data[attr]),
                    label: label || t(`${refEntity}:name`),
                    required: !allowNull,
                };
            }
        }
    );
    return (data: any) => transformerFixedPart.map(
        (ele) => {
            const { get } = ele;
            const value = get(data);
            return {
                value,
                ...ele,
            } as AttrUpsertRender<ED>;
        }
    );
}

export function analyzeAttrDefForTable<ED extends EntityDict & BaseEntityDict>(
    dataSchema: StorageSchema<ED>,
    entity: string,
    attrDefs: OakAbsAttrDef[],
    t: (k: string, params?: object) => string,
    mobileAttrDef?: OakAbsAttrDef_Mobile,
    colorDict?: ColorDict<ED>
): {
    columnDef: ColumnDefProps[];
    converter: DataConverter | undefined;
} {
    // web使用
    const columnDef: ColumnDefProps[] = attrDefs.map((ele) => {
        const path = getPath(ele);
        const {
            attrType,
            attr,
            attribute,
            entity: entityI8n,
        } = resolvePath<ED>(dataSchema, entity, path);
        const title = getLabel(ele, entity, attr, t);
        const width = getWidth(ele, attrType, 'table');
        const type = getType(ele, attrType);
        return {
            title,
            width,
            type,
            path,
            entity: entityI8n,
            attr,
        } as ColumnDefProps;
    });

    // 移动端使用
    let dataConverter;
    if (mobileAttrDef) {
        dataConverter = (data: any[]) => {
            const coverData = data.map((row) => {
                const title = get(row, mobileAttrDef.titlePath);
                const rows = mobileAttrDef.rowsPath.map((attribute) => {
                    const path = getPath(attribute);
                    const {
                        attrType,
                        attr,
                        entity: entityI8n,
                    } = resolvePath(dataSchema, entity, path);
                    const label = getLabel(attribute, entity, attr, t);
                    const value = getValue(
                        attribute,
                        row,
                        path,
                        entity,
                        attr,
                        attrType,
                        t
                    );
                    let color = 'black';
                    if (attrType === 'enum') {
                        if (colorDict) {
                            color = (<any>colorDict)[entityI8n]![attr]![
                                value
                            ] as string;
                        }
                    }
                    return {
                        label,
                        value,
                        color,
                    };
                });
                return {
                    title,
                    rows,
                    iState:
                        mobileAttrDef.statePath &&
                        get(row, mobileAttrDef.statePath),
                };
            });
            return coverData;
        };
    }
    return {
        columnDef,
        converter: dataConverter,
    };
}
