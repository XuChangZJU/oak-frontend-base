import assert from "assert";
import { EntityDict } from "oak-domain/lib/types";
import useFeatures from "../hooks/useFeatures";
import { StorageSchema } from "oak-domain/lib/types";

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

export function resolutionPath(dataSchema: StorageSchema<EntityDict>, entity: string, path: string) {
    let _entity = entity;
    let attr: string;
    assert(!path.includes('['), '数组索引不需要携带[],请使用arr.0.value')
    if (!dataSchema) {
        return {
            entity: _entity,
            attr: '',
            attribute: undefined,
        }
    }
    if (!path.includes('.')) {
        attr = path;
    }
    else {
        const strs = path.split('.');
        // 最后一个肯定是属性
        attr = strs.pop()!;
        // 倒数第二个可能是类名可能是索引
        _entity = strs.pop()!;
        // 判断是否是数组索引
        if (!Number.isNaN(Number(_entity))) {
            _entity = strs.pop()!.split('$')[0];
        }
    }
    const attributes = getAttributes(dataSchema[_entity as keyof typeof dataSchema].attributes);
    const attribute = attributes[attr];
    return {
        entity: _entity,
        attr,
        attribute,
    }
}