import { EntityDict } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { StorageSchema, Attribute } from 'oak-domain/lib/types';
import { OakAbsAttrDef, DataTransformer, OakAbsAttrUpsertDef, AttrUpsertRender, OakAbsDerivedAttrDef, OakAbsAttrJudgeDef } from '../types/AbstractComponent';
import { DataType } from 'oak-domain/lib/types/schema/DataTypes';
import { ColorDict } from 'oak-domain/lib/types/Style';
export declare function getAttributes(attributes: Record<string, Attribute>): Record<string, Attribute>;
export declare function resolvePath<ED extends EntityDict & BaseEntityDict>(dataSchema: StorageSchema<ED>, entity: keyof ED, path: string): {
    entity: keyof ED;
    attr: string;
    attrType: DataType | 'ref' | undefined;
    attribute: Attribute | undefined;
};
export declare function getLinkUrl(attribute: OakAbsAttrDef, props: Record<string, string>): string;
export declare function getPath(attribute: OakAbsAttrDef): string;
export declare function getLabel<ED extends EntityDict & BaseEntityDict>(attribute: OakAbsAttrDef, entity: keyof ED, attr: string, t: (k: string, params?: object) => string): string;
export declare function getWidth(attribute: OakAbsAttrDef, attrType: DataType | 'ref' | undefined): number | undefined;
export declare function getValue<ED extends EntityDict & BaseEntityDict>(data: any, path: string, entity: keyof ED, attr: string, attrType: DataType | 'ref' | undefined, t: (k: string, params?: object) => string): any;
export declare function getAlign(attribute: OakAbsAttrDef): 'left' | 'right' | 'center';
export declare function getFixed(attribute: OakAbsAttrDef): 'left' | 'right' | undefined;
export declare function getType(attribute: OakAbsAttrDef, attrType: OakAbsDerivedAttrDef['type']): "link" | "ref" | DataType | undefined;
export declare function makeDataTransformer<ED extends EntityDict & BaseEntityDict>(dataSchema: StorageSchema<ED>, entity: keyof ED, attrDefs: OakAbsAttrDef[], t: (k: string, params?: object) => string, colorDict?: ColorDict<ED>): DataTransformer;
export declare function analyzeDataUpsertTransformer<ED extends EntityDict & BaseEntityDict, T extends keyof ED>(dataSchema: StorageSchema<ED>, entity: T, attrUpsertDefs: OakAbsAttrUpsertDef<ED, T>[]): (data: any) => AttrUpsertRender<ED, T>[];
type CoverData = {
    data: {
        label: string;
        value: any;
        type: OakAbsDerivedAttrDef['type'];
    }[];
    record: EntityDict[keyof EntityDict];
}[];
export declare function translateAttributes<ED extends EntityDict & BaseEntityDict>(dataSchema: StorageSchema<ED>, entity: keyof ED, attributes: OakAbsAttrDef[]): OakAbsAttrJudgeDef[];
export declare function analyzeAttrMobileForCard<ED extends EntityDict & BaseEntityDict>(dataSchema: StorageSchema<ED>, entity: keyof ED, t: (k: string, params?: object) => string, attributes: OakAbsAttrDef[]): (data: any[]) => CoverData;
export {};
