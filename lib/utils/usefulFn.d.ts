import { EntityDict } from "oak-domain/lib/types";
import { StorageSchema } from "oak-domain/lib/types";
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
