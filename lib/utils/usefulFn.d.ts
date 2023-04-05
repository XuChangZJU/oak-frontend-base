/// <reference types="react" />
import { EntityDict } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { StorageSchema, Attribute } from 'oak-domain/lib/types';
import { OakAbsAttrDef, CardDef, DataTransformer, OakAbsAttrUpsertDef, AttrUpsertRender } from '../types/AbstractComponent';
import { DataType } from 'oak-domain/lib/types/schema/DataTypes';
import { ColorDict } from 'oak-domain/lib/types/Style';
export declare function getAttributes(attributes: Record<string, Attribute>): Record<string, Attribute>;
export declare function resolvePath<ED extends EntityDict & BaseEntityDict>(dataSchema: StorageSchema<ED>, entity: keyof ED, path: string): {
    entity: keyof ED;
    attr: string;
    attrType: DataType | "ref";
    attribute: Attribute;
};
export declare function getPath(attribute: OakAbsAttrDef): string;
export declare function getLabel<ED extends EntityDict & BaseEntityDict>(attribute: OakAbsAttrDef, entity: keyof ED, attr: string, t: (k: string, params?: object) => string): string;
export declare function getWidth(attribute: OakAbsAttrDef, attrType: string, useFor: 'table' | 'other'): number | undefined;
export declare function getValue<ED extends EntityDict & BaseEntityDict>(attribute: OakAbsAttrDef, data: any, path: string, entity: keyof ED, attr: string, attrType: string, t: (k: string, params?: object) => string): any;
export declare function getType(attribute: OakAbsAttrDef, attrType: string): string | undefined;
export declare function makeDataTransformer<ED extends EntityDict & BaseEntityDict>(dataSchema: StorageSchema<ED>, entity: string, attrDefs: OakAbsAttrDef[], colorDict?: ColorDict<ED>): DataTransformer;
export declare function analyzeDataUpsertTransformer<ED extends EntityDict & BaseEntityDict>(dataSchema: StorageSchema<ED>, entity: string, attrUpsertDefs: OakAbsAttrUpsertDef<ED>[]): (data: any) => AttrUpsertRender<ED>[];
export declare function analyzeAttrMobileForCard<ED extends EntityDict & BaseEntityDict>(dataSchema: StorageSchema<ED>, entity: string, t: (k: string, params?: object) => string, mobileAttrDef: CardDef, colorDict: ColorDict<ED>): (data: any[]) => {
    title: string;
    rows: {
        label: string;
        value: any;
    }[];
    state: string | number | boolean | import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>> | import("react").ReactFragment | {
        color: string;
        value: string;
    } | null | undefined;
    record: any;
}[];
