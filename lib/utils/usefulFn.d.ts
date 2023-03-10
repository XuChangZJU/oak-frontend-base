import { EntityDict } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { StorageSchema, Attribute } from 'oak-domain/lib/types';
import { OakAbsAttrDef, OakAbsAttrDef_Mobile, DataTransformer, DataConverter, ColumnDefProps, OakAbsAttrUpsertDef, DataUpsertTransformer } from '../types/AbstractComponent';
import { DataType } from 'oak-domain/lib/types/schema/DataTypes';
import { ColorDict } from 'oak-domain/lib/types/Style';
export declare function getAttributes(attributes: Record<string, Attribute>): Record<string, Attribute>;
export declare function resolvePath<ED extends EntityDict & BaseEntityDict>(dataSchema: StorageSchema<ED>, entity: keyof ED, path: string): {
    entity: keyof ED;
    attr: string;
    attrType: "ref" | DataType;
    attribute: Attribute;
};
export declare function makeDataTransformer<ED extends EntityDict & BaseEntityDict>(dataSchema: StorageSchema<ED>, entity: string, attrDefs: OakAbsAttrDef[], t: (k: string, params?: object) => string, colorDict?: ColorDict<ED>): DataTransformer;
export declare function makeDataUpsertTransformer<ED extends EntityDict & BaseEntityDict>(dataSchema: StorageSchema<ED>, entity: string, attrUpsertDefs: OakAbsAttrUpsertDef<ED>[], t: (k: string, params?: object) => string): DataUpsertTransformer<ED>;
export declare function analyzeAttrDefForTable<ED extends EntityDict & BaseEntityDict>(dataSchema: StorageSchema<ED>, entity: string, attrDefs: OakAbsAttrDef[], t: (k: string, params?: object) => string, mobileAttrDef?: OakAbsAttrDef_Mobile, colorDict?: ColorDict<ED>): {
    columnDef: ColumnDefProps[];
    converter: DataConverter | undefined;
};
