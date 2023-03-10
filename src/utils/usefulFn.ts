import assert from "assert";
import { EntityDict } from "oak-domain/lib/types";
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import useFeatures from "../hooks/useFeatures";
import { StorageSchema } from "oak-domain/lib/types";
import { judgeRelation } from "oak-domain/lib/store/relation";
import {
    OakAbsAttrDef, OakAbsAttrDef_Mobile, OakAbsFullAttrDef,
    DataTransformer, DataConverter, ColumnDefProps,
    RenderWidth,
} from "../types/AbstractComponent";
import { Attributes } from "oak-domain/lib/types";
import { get } from "oak-domain/lib/utils/lodash";
import { DataType, DataTypeParams } from 'oak-domain/lib/types/schema/DataTypes';
import { ColorDict } from 'oak-domain/lib/types/Style';
import dayjs from 'dayjs';

const tableWidthMap: Record<number, number> = {
    1: 100,
    2: 200,
    3: 300,
    4: 400
}

export function getAttributes(attributes: Record<string, any>) {
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


export function resolutionPath(dataSchema: StorageSchema<EntityDict>, entity: keyof EntityDict, path: string) {
    assert(!path.includes('['), '数组索引不需要携带[],请使用arr.0.value')
    const attrs = path.split('.');

    let idx = 0;
    let _entity = entity;
    let attr;
    let attrType;
    let attribute;
    while (idx <= attrs.length - 1) {
        attr = attrs[idx];
        const relation = judgeRelation(dataSchema, _entity, attr);
        if (relation === 1) {
            const attributes = getAttributes(
                dataSchema[_entity].attributes
            );
            attribute = attributes[attr];
            attrType = attribute.type;
            if (attrType === 'ref') {
                attr = attribute.ref;
            }
        } else if (relation === 2) {
            // entity entityId
            _entity = attr as keyof EntityDict;
        } else if (typeof relation === 'string') {
            _entity = relation as keyof EntityDict;
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
function isAttrbuteType(attribute: OakAbsAttrDef): OakAbsFullAttrDef {
    return attribute as OakAbsFullAttrDef;
}

// 以下几个get方法只需要两个参数attribute和一个解析path对象，只是后者类型还没定义
function getPath(attribute: OakAbsAttrDef) {
    if (typeof attribute === 'string') {
        return attribute;
    }
    return attribute.path;
}


function getLabel(attribute: OakAbsAttrDef, entity: keyof EntityDict, attr: string, t: (k: string, params?: object) => string) {
    let label = t(`${entity}:attr.${attr}`);
    if (isAttrbuteType(attribute).label) {
        label = isAttrbuteType(attribute).label
    }
    return label;
}

// 目前width属性可以是undefined，只有特殊type或用户自定义才有值，这样其余attr属性可以自适应
function getWidth(attribute: OakAbsAttrDef, attrType: string, useFor: 'table' | 'other') {
    let width;
    if (attrType === 'enum' && useFor === 'table') {
        width = 1;
    }
    if (isAttrbuteType(attribute).width) {
        width = isAttrbuteType(attribute).width
    }
    if (width && useFor === 'table') {
        width = tableWidthMap[width];
    }
    return width;
}

function getValue(attribute: OakAbsAttrDef, data: any, path: string, entity: keyof EntityDict, attr: string, attrType: string, t: (k: string, params?: object) => string) {
    let value = get(data, path);
    // 枚举类型还要通过i18转一下中文
    if (attrType === 'enum' && value) {
        value = t(`${entity}:v.${attr}.${value}`);
    }
    // 如果是dateTime
    if (attrType === 'dateTime' && value) {
        value = dayjs(value).format("YYYY-MM-DD HH:mm")
    }
    if (isAttrbuteType(attribute).value) {
        value = isAttrbuteType(attribute).value
    }
    return value;
}

function getType(attribute: OakAbsAttrDef, attrType: string) {
    let type = 'text';
    if (attrType === 'enum') {
        type = 'tag'
    }
    if (isAttrbuteType(attribute).type) {
        type = isAttrbuteType(attrType).type as string;
    }
    return type as DataType & ('img' | 'file' | 'avatar')
}

function getLabelI18(dataSchema: StorageSchema<EntityDict>, entity: keyof EntityDict, path: string, t: (k: string, params?: object) => string) {
    const { attr, entity: entityI8n } = resolutionPath(dataSchema, entity, path);
    return t(`${entityI8n}:attr.${attr}`);
}
export function makeDataTransformer(dataSchema: StorageSchema<EntityDict>, entity: string, attrDefs: OakAbsAttrDef[], t: (k: string, params?: object) => string, colorDict?: ColorDict<EntityDict & BaseEntityDict>): DataTransformer {
    return (data: any) => {
        // 因为attrDefs里每一项可能是string可能是attrbute, 这里对其每一项进行判断，得到一个都是string类型得pathArr
        const renderArr = attrDefs.map((ele) => {
            const path = getPath(ele);
            const { attrType, attr, attribute, entity: entityI8n } = resolutionPath(dataSchema, entity, path);
            const label = getLabel(attribute, entity, attr, t);
            const value = getValue(attribute, data, path, entity, attr, attrType, t);
            const width = getWidth(attribute, attrType, "other") as RenderWidth;
            let type = attrType;
            let color = 'black';
            // iState 等枚举类型直接转成中文
            if (type === 'enum') {
                if (colorDict) {
                    color = colorDict[entityI8n]![attr]![value] as string;
                }
            }
            return {
                label,
                value,
                type: getType(ele, attrType),
                color,
                width,
                params: attribute.params as DataTypeParams,
            }
        })
        
        return renderArr;
    }
}

export function analyzeAttrDefForTable(dataSchema: StorageSchema<EntityDict>, entity: string, attrDefs: OakAbsAttrDef[], t: (k: string, params?: object) => string, mobileAttrDef?: OakAbsAttrDef_Mobile, colorDict?: ColorDict<EntityDict & BaseEntityDict>) : {
    columnDef: ColumnDefProps[];
    converter: DataConverter | undefined;
} {
    // web使用
    const columnDef: ColumnDefProps[] = attrDefs.map((ele) => {
        const path = getPath(ele);
        const { attrType, attr, attribute, entity: entityI8n } = resolutionPath(dataSchema, entity, path);
        const title = getLabel(ele, entity, attr, t);
        const width = getWidth(ele, attrType, "table");
        const type = getType(ele, attrType);
        return {
            title,
            width,
            type,
            path,
            entity: entityI8n,
            attr,
        } as ColumnDefProps;
    })

    // 移动端使用
    let dataConverter;
    if (mobileAttrDef) {
        dataConverter = (data: any[]) => {
            const coverData = data.map((row) => {
                const title = get(row, mobileAttrDef.titlePath);
                const rows = mobileAttrDef.rowsPath.map((attrbute) => {
                    const path = getPath(attrbute);
                    const { attrType, attr, attribute, entity: entityI8n } = resolutionPath(dataSchema, entity, path);
                    const label = getLabel(attribute, entity, attr, t);
                    const value = getValue(attribute, row, path, entity, attr, attrType, t);
                    let color = 'black';
                    if (attrType === 'enum') {
                        if (colorDict) {
                            color = colorDict[entityI8n]![attr]![value] as string;
                        }
                    }
                    return {
                        label,
                        value,
                        color,
                    }
                })
                return {
                    title,
                    rows,
                    iState: mobileAttrDef.statePath && get(row, mobileAttrDef.statePath)
                }
            })
            return coverData;
        }
    }
    return {
        columnDef,
        converter: dataConverter,
    }
}