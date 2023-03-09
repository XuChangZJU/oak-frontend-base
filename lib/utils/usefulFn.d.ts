import { EntityDict } from "oak-domain/lib/types";
import { StorageSchema } from "oak-domain/lib/types";
import { OakAbsAttrDef, OakAbsAttrDef_Mobile, DataTransformer, DataConverter } from "../types/AbstractComponent";
export declare function getAttributes(attributes: Record<string, any>): Record<string, any> & {
    id: {
        type: string;
    };
    $$createAt$$: {
        type: string;
    };
    $$updateAt$$: {
        type: string;
    };
    $$deleteAt$$: {
        type: string;
    };
    $$seq$$: {
        type: string;
    };
};
export declare function resolutionPath(dataSchema: StorageSchema<EntityDict>, entity: keyof EntityDict, path: string): {
    entity: string | number;
    attr: any;
    attrType: any;
    attribute: any;
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
