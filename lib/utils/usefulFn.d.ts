import { EntityDict } from "oak-domain/lib/types";
import { StorageSchema, Attribute } from "oak-domain/lib/types";
import { OakAbsAttrDef, OakAbsAttrDef_Mobile, DataTransformer, DataConverter } from "../types/AbstractComponent";
import { DataType } from "oak-domain/lib/types/schema/DataTypes";
export declare function getAttributes(attributes: Record<string, Attribute>): Record<string, Attribute>;
export declare function resolvePath(dataSchema: StorageSchema<EntityDict>, entity: keyof EntityDict, path: string): {
    entity: string | number;
    attr: string;
    attrType: DataType | "ref";
    attribute: Attribute;
};
declare type ColumnDefProps = {
    width: number;
    title: string;
    renderType: 'tag' | 'text' | 'button';
    fixed?: 'right' | 'left';
};
export declare function makeDataTransformer(dataSchema: StorageSchema<EntityDict>, entity: string, attrDefs: OakAbsAttrDef[], t: (k: string, params?: object) => string): DataTransformer;
export declare function analyzeAttrDefForTable(dataSchema: StorageSchema<EntityDict>, entity: string, attrDefs: OakAbsAttrDef[], t: (k: string, params?: object) => string, mobileAttrDef?: OakAbsAttrDef_Mobile): {
    columnDef: ColumnDefProps[];
    converter: DataConverter | undefined;
};
export {};
