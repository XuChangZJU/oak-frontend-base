import { EntityDict } from "oak-domain/lib/types";
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { StorageSchema, Attribute } from "oak-domain/lib/types";
import { OakAbsAttrDef, OakAbsAttrDef_Mobile, DataTransformer, DataConverter, ColumnDefProps } from "../types/AbstractComponent";
import { DataType } from 'oak-domain/lib/types/schema/DataTypes';
import { ColorDict } from 'oak-domain/lib/types/Style';
export declare function getAttributes(attributes: Record<string, Attribute>): Record<string, Attribute>;
export declare function resolvePath(dataSchema: StorageSchema<EntityDict>, entity: keyof EntityDict, path: string): {
    entity: string | number;
    attr: string;
    attrType: DataType | "ref";
    attribute: Attribute;
};
export declare function makeDataTransformer(dataSchema: StorageSchema<EntityDict>, entity: string, attrDefs: OakAbsAttrDef[], t: (k: string, params?: object) => string, colorDict?: ColorDict<EntityDict & BaseEntityDict>): DataTransformer;
export declare function analyzeAttrDefForTable(dataSchema: StorageSchema<EntityDict>, entity: string, attrDefs: OakAbsAttrDef[], t: (k: string, params?: object) => string, mobileAttrDef?: OakAbsAttrDef_Mobile, colorDict?: ColorDict<EntityDict & BaseEntityDict>): {
    columnDef: ColumnDefProps[];
    converter: DataConverter | undefined;
};
