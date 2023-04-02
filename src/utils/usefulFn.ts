import assert from 'assert';
import { EntityDict } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import useFeatures from '../hooks/useFeatures';
import { StorageSchema, Attribute } from 'oak-domain/lib/types';
import { judgeRelation } from 'oak-domain/lib/store/relation';
import {
    OakAbsAttrDef,
    CardDef,
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
    OakAbsNativeAttrUpsertRender,
    OakAbsGeoAttrUpsertDef,
    OakAbsNativeAttrUpsertDef,
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
    1: 140,
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
    if (attr === '$$createAt$$' || attr === '$$updateAt$$' || attr === '$$deleteAt$$') {
        label = t(`common:${attr}`);
    }
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
    if (attrType === 'datetime' && value) {
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
    if (attrType === 'datetime') {
        type = 'datetime'
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

export function makeDataTransformer<ED extends EntityDict & BaseEntityDict>(
    dataSchema: StorageSchema<ED>,
    entity: string,
    attrDefs: OakAbsAttrDef[],
    t: (k: string, params?: object) => string,
    colorDict?: ColorDict<ED>
): DataTransformer {
    const transformerFixedPart = attrDefs.map((ele) => {
        if (typeof ele === 'string') {
            const path = ele;
            const {
                attrType,
                attr,
                attribute,
                entity: entityI8n,
            } = resolvePath(dataSchema, entity, path);
            const label = t(`${entityI8n as string}:attr.${attr}`);
            const type = attrType;
            return {
                path,
                label,
                type,
                attr,
            };
        } else {
            const { path, label, width, type } = ele;
            return {
                path,
                label,
                width,
                type: type || 'varchar',
            };
        }
    });
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

export function analyzeDataUpsertTransformer<
    ED extends EntityDict & BaseEntityDict
>(
    dataSchema: StorageSchema<ED>,
    entity: string,
    attrUpsertDefs: OakAbsAttrUpsertDef<ED>[],
    t: (k: string, params?: object) => string
) {
    let geoDef: OakAbsGeoAttrUpsertDef | undefined = undefined;
    const makeNativeFixedPart = (attr: string, def?: OakAbsNativeAttrUpsertDef<ED, keyof ED, keyof ED[keyof ED]['OpSchema']>) => {
        const attrDef = dataSchema[entity].attributes[attr]; // upsert应该不会涉及createAt这些内置属性
        const {
            type,
            notNull: required,
            default: defaultValue,
            enumeration,
            params,
        } = attrDef;
        const label = t(`${entity}:attr.${attr}`);
        assert(type !== 'ref');
        return {
            attr,
            label,
            type: type as OakAbsNativeAttrUpsertRender<ED, keyof ED, keyof ED[keyof ED]['OpSchema']>['type'],
            required,
            defaultValue: def?.hasOwnProperty('defaultValue') ? def!.defaultValue : defaultValue,
            enumeration,
            min: typeof def?.min === 'number' ? def.min : params?.min,
            max: typeof def?.max === 'number' ? def.max : params?.max,
            maxLength: typeof def?.maxLength === 'number' ? def.maxLength : params?.length,
            get: (data?: Record<string, any>) => data && data[attr],
        };
    };
    const transformerFixedPart = attrUpsertDefs.map((ele) => {
        if (typeof ele === 'string') {
            const rel = judgeRelation(dataSchema, entity, ele);
            assert(rel === 1);
            return makeNativeFixedPart(ele);            
        } 
        else if (ele.type === 'geo') {
            assert(!geoDef, '只能定义一个geo渲染对象');
            geoDef = ele as OakAbsGeoAttrUpsertDef;
        }
        else {
            const {
                attr,
                label,
                ...rest
            } = ele as OakAbsRefAttrPickerDef<ED, keyof ED>;
            const rel = judgeRelation(dataSchema, entity, attr);
            if (rel === 1) {
                const fixedPart = makeNativeFixedPart(attr, ele as OakAbsNativeAttrUpsertDef<ED, keyof ED, keyof ED[keyof ED]['OpSchema']>);
                return Object.assign(fixedPart, {
                    label: label || t(`${entity}:attr.${attr}`),
                    ...rest,
                });
            }
            const origAttr = rel === 2 ? 'entityId' : `${attr}Id`;
            return {
                required: !!(dataSchema[entity].attributes[origAttr]!.notNull),
                label: label || (rel === 2 ? t(`${attr}:name`) : t(`${entity}:attr.${attr}`)),
                ...rest,
                get: (data?: Record<string, any>) => data && data[origAttr],
                attr: origAttr,
            };
        }
    }).filter(
        ele => !!ele
    );
    if (geoDef) {
        // 暂时只放出poiName和coordinate
        const { type, attributes, ...rest } = geoDef as OakAbsGeoAttrUpsertDef;
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
    return (data: any) =>
        transformerFixedPart.map((ele) => {
            const { get } = ele!;
            const value = get(data);
            return {
                value,
                ...ele,
            } as AttrUpsertRender<ED>;
        });
}

export function analyzeAttrDefForTable<ED extends EntityDict & BaseEntityDict>(dataSchema: StorageSchema<ED>, entity: string, attrDefs: OakAbsAttrDef[], t: (k: string, params?: object) => string, mobileAttrDef?: CardDef, colorDict?: ColorDict<ED>): {
    columnDef: ColumnDefProps[];
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
    return {
        columnDef,
    };
}

export function analyzeAttrMobileForCard<ED extends EntityDict & BaseEntityDict>(dataSchema: StorageSchema<ED>, entity: string, t: (k: string, params?: object) => string, mobileAttrDef: CardDef, colorDict: ColorDict<ED>) {
    return (data: any[]) => {
        // 遍历用户传入的数据源
        const coverData = data.map((row) => {
            let title = '';
            // title如果是path进行解析
            if (mobileAttrDef.title) {
                title = typeof mobileAttrDef.title === 'string' ? get(row, mobileAttrDef.title) : mobileAttrDef.title;
            }
            // rows即卡片主体要渲染的数据
            assert(!!(mobileAttrDef.rows && mobileAttrDef.rows.length), 'attributeMb中的rows不能为空')
            const rows = mobileAttrDef.rows.map((attribute) => {
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
                return {
                    label,
                    value,
                };
            });
            // 处理state 卡片右上角的stateView要显示的内容
            let color = 'default';
            let state;
            if (mobileAttrDef.state && typeof mobileAttrDef.state === 'string') {
                const {
                    attr,
                    entity: entityI8n,
                } = resolvePath(dataSchema, entity, mobileAttrDef.state);
                const rowValue = get(row, mobileAttrDef.state);
                const value = t(`${String(entityI8n)}:v.${attr}.${rowValue}`)
                if (colorDict) {
                    color = (<any>colorDict)[entityI8n]![attr]![
                        rowValue
                    ] as string;
                }
                state = {
                    color,
                    value
                }
            }
            else {
                state = mobileAttrDef.state;
            }
            return {
                title,
                rows,
                state,
                record: row,
            }
        })
        return coverData;
    }
}
