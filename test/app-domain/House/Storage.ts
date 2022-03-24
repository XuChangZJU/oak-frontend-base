import { StorageDesc } from "oak-domain/lib/types/Storage";
import { OpSchema } from "./Schema";
export const desc: StorageDesc<OpSchema> = {
    attributes: {
        district: {
            type: "varchar",
            params: {
                width: 16
            }
        },
        areaId: {
            type: "ref",
            ref: "area"
        },
        ownerId: {
            type: "ref",
            ref: "user"
        }
    }
};