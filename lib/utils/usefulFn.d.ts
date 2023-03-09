import { EntityDict } from "oak-domain/lib/types";
import { StorageSchema } from "oak-domain/lib/types";
import { OakAbsAttrDef, DataTransformer, DataConverter } from "../types/AbstractComponent";
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
export declare function resolutionPath(dataSchema: StorageSchema<EntityDict>, entity: string, path: string): {
    entity: string;
    attr: string;
    attribute: any;
};
export declare function makeDataTransformer(dataSchema: StorageSchema<EntityDict>, entity: string, attrDefs: OakAbsAttrDef[], t: (k: string, params?: object) => string): DataTransformer;
export declare function analyzeAttrDefForTable(dataSchema: StorageSchema<EntityDict>, entity: string, attrDefs: OakAbsAttrDef[], t: (k: string, params?: object) => string): {
    columnDef: any;
    converter: DataConverter;
};
