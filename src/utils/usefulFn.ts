import assert from "assert";
import { EntityDict } from "oak-domain/lib/types";
import useFeatures from "../hooks/useFeatures";
import { StorageSchema } from "oak-domain/lib/types";
import { judgeRelation } from "oak-domain/lib/store/relation";
import { OakAbsAttrDef, OakAbsAttrDef_Mobile, OakAbsFullAttrDef, DataTransformer, DataConverter } from "../types/AbstractComponent";
import { Attributes } from "oak-domain/lib/types";
import { get } from "oak-domain/lib/utils/lodash";


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

function getLabelI18(dataSchema: StorageSchema<EntityDict>, entity: keyof EntityDict, path: string, t: (k: string, params?: object) => string) {
    const { attr, entity: entityI8n } = resolutionPath(dataSchema, entity, path);
    return t(`${entityI8n}:attr.${attr}`);
}

type ColumnDefProps = {
    width: number;
    title: string;
    renderType: 'tag' | 'text' | 'button';
    fixed?: 'right' | 'left';
}

const tableWidthMap = {
    1: 100,
    2: 200,
    3: 300,
    4: 400
}
export function makeDataTransformer(dataSchema: StorageSchema<EntityDict>, entity: string, attrDefs: OakAbsAttrDef[], t: (k: string, params?: object) => string): DataTransformer {
    return (data: any) => {
        // 因为attrDefs里每一项可能是string可能是attrbute, 这里对其每一项进行判断，得到一个都是string类型得pathArr
        const renderArr = attrDefs.map((ele) => {
            let path: string = typeof ele === 'string' ? ele : ele.path;
            const { attrType, attr, attribute, entity: entityI8n } = resolutionPath(dataSchema, entity, path);
            let label = t(`${entityI8n}:attr.${attr}`);
            let type = attrType;
            const value = get(data, path);
            if (typeof ele !== 'string' && ele.label) {
                label = ele.label;
            }
            if (typeof ele !== 'string' && ele.type) {
                type = ele.type
            }
            const renderObj = {
                label,
                value,
                type,
                params: attribute.params,
            }
            if (typeof ele !== 'string' && ele.width) {
                Object.assign(ele, {
                    width: ele.width
                })
            }
            return renderObj;
        })
        
        return renderArr;
    }
}

export function analyzeAttrDefForTable(dataSchema: StorageSchema<EntityDict>, entity: string, attrDefs: OakAbsAttrDef[], t: (k: string, params?: object) => string, mobileAttrDef?: OakAbsAttrDef_Mobile,) : {
    columnDef: ColumnDefProps[];
    converter: DataConverter | undefined;
} {
    // web使用
    const columnDef: ColumnDefProps[] = attrDefs.map((ele) => {
        let path: string = typeof ele === 'string' ? ele : ele.path;
        const { attrType, attr, attribute, entity: entityI8n } = resolutionPath(dataSchema, entity, path);
        let title = t(`${entityI8n}:attr.${attr}`);
        let width: number = tableWidthMap[1];
        let renderType = 'text';
        // 枚举类型长度一般不超过200
        if (attrType === 'enum') {
            width = tableWidthMap[2];
            renderType = 'tag';
        }
        if (typeof ele !== 'string' && ele.label) {
            title = ele.label;
        }
        if (typeof ele !== 'string' && ele.type) {
            renderType = ele.type
        }
        return {
            title,
            width,
            renderType,
        } as ColumnDefProps;
    })

    // 移动端使用
    let dataConverter;
    if (mobileAttrDef) {
        dataConverter = (data: any[]) => {
            const coverData = data.map((row) => {
                const title = get(row, mobileAttrDef.titlePath);
                const rows = mobileAttrDef.rowsPath.map((attrbute) => {
                    const label = typeof attrbute === 'string'
                    ? getLabelI18(dataSchema, entity, attrbute, t) : attrbute.label;
                    const path = typeof attrbute === 'string' ? attrbute : attrbute.path;
                    const value = get(row, path);
                    return {
                        label,
                        value,
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